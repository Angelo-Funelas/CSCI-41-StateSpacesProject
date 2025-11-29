require('dotenv').config();
const express = require('express');
const { PrismaClient } = require("./generated/prisma");
const bcrypt = require("bcrypt");
const path = require('path');
const { Pool } = require('pg');
const Joi = require("joi");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().alphanum().min(3).max(30).required(),
  confirmPassword: Joi.ref("password"),
}).with("password", "confirmPassword");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
        if (username.length === 0 || password.length === 0) {
            return done(null, false, { message: "No username or password given"});
        }
        let match;
        const user = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive"
                }
            }
        })
        if (user !== null) match = await bcrypt.compare(password, user.password);
        if (user === null) return done(null, false, { message: "User does not exist" });
        if (!match) return done(null, false, { message: "Incorrect password" });
        return done(null, user);
    }
    catch(err) {
        return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      }
    })
    done(null, user);
  }
  catch(err) {
    done(err);
  }
});

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    createTableIfMissing: true,
  }),
  secret: "cats",
  resave: false,
  saveUninitialized: false
});
app.use("/static", express.static('static'));
app.use(sessionMiddleware);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

// USER MANAGEMENT
app.get('/', (req, res) => {
    res.sendFile("html/index.html", {root: path.join(__dirname)});
});
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/login`);
    res.sendFile("html/dashboard.html", {root: path.join(__dirname)});
});
app.get('/login', (req, res) => {
    res.sendFile("html/auth/login.html", {root: path.join(__dirname)});
});
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect(`/login?msg=${encodeURIComponent(info.message)}`);
        req.logIn(user, (err) => {
            if (err) return next(err);
            let redirectPath = "/dashboard?success=Login+successful";
            if (user.firstLogin) {
                updateUser(prisma, user.id, {
                firstLogin: false,
                })
                redirectPath += "&firstLogin=true"
            }
            return res.redirect(redirectPath);
        });
    })(req, res, next);
});
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
});
app.get('/register', (req, res) => {
    if (req.isAuthenticated()) return res.redirect(`/`);
    res.sendFile("html/auth/register.html", {root: path.join(__dirname)});
});
app.post("/register", async (req, res) => {
  try {
    const username = req.body.username;
    const value = await schema.validateAsync({ username: username, password: req.body.password, confirmPassword: req.body.confirmPassword });
    const validatedUsername = value["username"];
    const validatedPassword = value["password"];
    let hashedPassword;
    hashedPassword = await bcrypt.hashSync(validatedPassword, saltRounds);
    await prisma.user.create({
      data: {
        username: validatedUsername,
        password: hashedPassword,
        usertype: parseInt(req.body.usertype),
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        middlename: req.body.middlename,
        birthdate: new Date(req.body.birthdate),
        managed_bldg_id: parseInt(req.body.managed_bldg),
      },
    });
    console.log(`Registered user: ${validatedUsername} ${validatedPassword}`)
    res.redirect("/login");
  } catch(err) {
    console.error(err);
    let errorMessage = "Registration+failed";
    if (err.isJoi) errorMessage = err.details[0].message.replace(/ /g, '+');
    else if (err.code === 'P2002') errorMessage = "Username+already+taken";
    res.redirect(`/register?msg=${errorMessage}`);
  }
})

// USER ACTIONS (manage building, reserve venue)
app.get('/venue/:id', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/login`);
    res.sendFile("html/venue.html", {root: path.join(__dirname)});
});
app.get('/building/:id', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/login`);
    res.sendFile("html/building.html", {root: path.join(__dirname)});
});

// API Endpoints
app.get('/api/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(400).send(`User is not authenticated!`);
    const id = req.user.id;
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            password: false
        }
    });

    if (user.usertype == 0) {
        const reservations = await prisma.reservation.findMany({
            where: { parent_user: id },
            include: {
                parent_user: false,
                venue: {
                    select: {
                        venue_name: true,
                        venue_type: true, 
                    }
                } 
            }
        });
        const data = { user, reservations };
        res.json(data);
    }
    else {
        const [building, venues] = await prisma.$transaction([
            prisma.building.findUnique({
                where: { id: user.managed_bldg_id },
            }),
            prisma.venue.findMany({
                where: { agent_id: id },
                select: {
                    id: true,
                    venue_name: true,
                    venue_type: true
                }
            })
        ]);

        const data = { user, building, venues };
        res.json(data);
    }
});
app.get('/api/venue/:id', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(400).send(`User is not authenticated!`);
    const id = parseInt(req.params.id);
    const [user, venue, amenities, renovation_dates, reservations] = await prisma.$transaction([
        prisma.user.findUnique({ where: { id: req.user.id }, include: {password: false} }),
        prisma.venue.findUnique({
            where: {
                id
            },
            include: {
                bldg: true
            }
        }),
        prisma.venue_amenity.findMany({
            where: {
                venue_id: id
            },
            include: {
                venue_id: false,
                amenity: {
                    include: { id: false }
                }
            }
        }),
        prisma.renovation_date.findMany({
            where: {
                venue_id: id
            }
        }),
        prisma.reservation.findMany({
            where: { parent_venue: id },
            include: { 
                parent_venue: false,
                User: {
                    select: {
                        username: true,
                    }
                }
            }
        }),
    ]);
    res.json({ user, venue, amenities, renovation_dates, reservations });
});
app.get('/api/buildings', async (req, res) => {
    const data = await prisma.building.findMany();
    res.json(data);
});
app.get('/api/building/:id', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(400).send(`User is not authenticated!`);
    const id = parseInt(req.params.id);
    const building = await prisma.building.findUnique({
        where: { id }
    });
    const venues = await prisma.venue.findMany({
        where: { buildingId: id },
        include: { buildingId: false }
    });

    const data = { user: {...req.user, password: null}, building, venues };
    res.json(data);
});

// POST Requests (manage building, reserve venue)
app.post('/manage/:building_id', async (req, res) => {
    const building_id = parseInt(req.params.building_id);
    const action = req.query.action;
    if (!req.isAuthenticated()) return res.status(401).json({ error: "User not authenticated" });
    if (req.user.usertype !== 1) return res.status(401).json({ error: "User not an agent" });
    if (req.user.managed_bldg_id !== building_id) return res.status(401).json({ error: "User is not assigned to the building" });
    try {
        const id = parseInt(req.body.venue_id);
        if (action == "add") {
            await prisma.venue.update({
                where: { id },
                data: { agent_id: req.user.id }
            });
            return res.redirect(`/building/${building_id}?msg=Successfully+added+building`);
        }
        else if (action == "remove") {
            const venue = await prisma.venue.findUnique({ where: { id } });
            if (venue.agent_id == req.user.id) {
                await prisma.venue.update({
                    where: { id },
                    data: { agent_id: null}
                });
                return res.redirect(`/building/${building_id}?msg=Successfully+removed+building`);
            }
            return res.redirect(`/building/${building_id}?msg=You+are+not+managing+this+venue`);
        }
    } catch (err) {
        console.error(err);
        return res.redirect(`/building/${building_id}?msg=${encodeURIComponent(err)}`);
    }
});
function checkDateConflicts(start_datetime, end_datetime, unavailableRanges) {
    const start = new Date(start_datetime).getTime();
    const end = new Date(end_datetime).getTime();
    if (isNaN(start) || isNaN(end) || start > end) throw new Error("Invalid or inverted date range provided for 'newRange'.");
    for (const existingRange of unavailableRanges) {
        const existingStart = new Date(existingRange.start_datetime).getTime();
        const existingEnd = new Date(existingRange.end_datetime).getTime();

        if (isNaN(existingStart) || isNaN(existingEnd)) continue;
        const noConflict = (end < existingStart) || (start > existingEnd);

        if (noConflict) continue;
        throw new Error(`Reservation has conflicts`);
    }
    return true;
}
app.post('/reserve/:venue_id', async (req, res) => {
    const venue_id = parseInt(req.params.venue_id);
    if (!req.isAuthenticated()) return res.status(401).json({ error: "User not authenticated" });
    if (req.user.usertype !== 0) return res.status(401).json({ error: "User not customer" });
    try {
        console.log(req.body)
        const { start_datetime, end_datetime, participant_count } = req.body;
        const venue = await prisma.venue.findUnique({ where: { id:venue_id } })
        const renovation_dates = await prisma.renovation_date.findMany({
            where: {
                venue_id: venue_id
            }
        });
        const reservation_dates = await prisma.reservation.findMany({
            where: {
                parent_venue: venue_id
            }
        });
        const unavailable_dates = renovation_dates.concat(reservation_dates)
        checkDateConflicts(start_datetime, end_datetime, unavailable_dates)
        await prisma.reservation.create({
            data: {
                parent_user: req.user.id,
                parent_venue: venue_id,
                start_datetime: new Date(start_datetime),
                end_datetime: new Date(end_datetime),
                participant_count: parseInt(participant_count)
            },
        });
        console.log({
            reqbody: req.body,
            venue,
            renovation_dates,
            reservation_dates
        });
        return res.redirect(`/venue/${venue_id}?msg=Successfully+reserved+venue`);
    } catch(err) {
        console.error(err)
        return res.redirect(`/venue/${venue_id}?msg=${encodeURIComponent(err)}`);
    }
});

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});