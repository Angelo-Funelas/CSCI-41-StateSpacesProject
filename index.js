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
app.use(express.static("static"));
app.use(sessionMiddleware);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.get('/', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/login`);
    res.sendFile("html/index.html", {root: path.join(__dirname)});
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
            let redirectPath = "/?success=Login+successful";
            console.log(`First Login: ${user.firstLogin}`)
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
        managed_bldg_id: req.body.managed_bldg,
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
app.get('/venue/:id', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/login`);
    res.sendFile("html/venue.html", {root: path.join(__dirname)});
});

/**
 * For getting dashboard content.
 * 
 * TODO: implement getting info on agent's buildings
 * NOTE: waiting for db modification
 */
app.get('/api/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(400).send(`User is not an authenticated!`);
    const id = req.user.id;
    const agent = await prisma.user.findUnique({ where: { id } });

    // Fail fast if id is not attributed to an agent
    if (agent.usertype != 1) {
        res.status(400).send(`User is not an agent! ${agent.usertype}`);
        return
    }

    const [buildings, venues, reservations, renovations] = await prisma.$transaction([
        prisma.building.findMany(),
        prisma.venue.findMany({
            where: { agent_id: id },
            select: {
                id: true,
                venue_name: true,
                venue_type: true
            }
        }),
        prisma.reservation.findMany({
            where: {
                venue: {
                    agent_id: id
                },
                start_datetime: {
                    gte: new Date()
                }
            },
            include: {
                user: {
                    select: {
                        lastname: true,
                        firstname: true,
                        middlename: true
                    }
                },
                venue: {
                    select: { venue_name: true }
                }
            },
            take: 5
        }),
        prisma.renovation_date.findMany({
            where: {
                venue: {
                    agent_id: id
                },
                begin_date: {
                    gte: new Date()
                }
            },
            include: {
                venue: {
                    select: { venue_name: true }
                }
            },
            take: 5
        })
    ]);

    const data = { agent, buildings, venues, reservations, renovations };
    res.json(data);
});

/**
 * For getting venue details.
 */
app.get('/api/venue/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const venue = await prisma.venue.findUnique({ where: { id } })
    const rennovation_dates = await prisma.renovation_date.findMany({
        where: {
            venue_id: id
        }
    });
    const amenities = await prisma.venue_amenity.findMany({
        where: {
            venue_id: id
        },
        include: {
            amenity: {
                select: {
                    type: true
                }
            }
    }
    });

    const data = { venue, rennovation_dates, amenities };
    res.json(data);
});

/**
 * For getting building details.
 * 
 * TODO: implement
 * NOTE: waiting for db modification
 */
app.get('/api/building/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await prisma.building.findMany({
        where: { id: id }
    });
    res.json(data);
});

app.post('/reserve/:venue_id', async (req, res) => {
    const venue_id = parseInt(req.params.venue_id);
    if (!req.isAuthenticated()) return res.status(401).json({ error: "User not authenticated" });
    if (req.user.usertype !== 0) return res.status(401).json({ error: "User not customer" });
    try {
        const { start_date, end_date, participant_count } = req.body;
        const venue = await prisma.venue.findUnique({ where: { id:venue_id } })
        const rennovation_dates = await prisma.renovation_date.findMany({
            where: {
                venue_id: venue_id
            }
        });
        console.log({
            reqbody: req.body,
            venue: venue,
            rennovation_dates: rennovation_dates
        });
        return res.redirect(`/venue/${venue_id}?msg=Successfully+reserved+venue`);
    } catch(err) {
        return res.redirect(`/venue/${venue_id}?msg=${encodeURIComponent(err)}`);
    }
});

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});