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
        password: hashedPassword
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

// Sample Code for Later
// app.get('/api/users', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT id, name, email FROM users LIMIT 10;');
//         res.json({
//             message: 'Successfully retrieved data from PostgreSQL',
//             count: result.rowCount,
//             data: result.rows
//         });

//     } catch (err) {
//         console.error('Database query error:', err.message);
//         res.status(500).json({
//             error: 'Failed to query database.',
//             details: 'Ensure your PostgreSQL server is running, the "users" table exists, and environment variables are set correctly.',
//             internalError: err.message
//         });
//     }
// });

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});