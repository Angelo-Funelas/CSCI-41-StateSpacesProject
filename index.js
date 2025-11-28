const express = require('express');
const { PrismaClient } = require("./generated/prisma");
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.set('view-engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index.ejs');
});
app.get('/login', (req, res) => {
    res.render('login.ejs');
});
app.get('/register', (req, res) => {
    res.render('register.ejs');
});

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