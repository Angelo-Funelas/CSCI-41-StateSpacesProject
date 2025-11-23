const express = require('express');
const { PrismaClient } = require("./generated/prisma");
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * For getting dashboard content.
 * 
 * TODO: implement
 */
app.get('/api/dashboard/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await prisma.ss_user.findMany({
        where: { id: id }
    });
    res.json(data);
});

/**
 * For getting venue details.
 */
app.get('/api/venue/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await prisma.venue.findMany({
        where: { id },
        include: {
            ss_user: {
                include: { id: false }
            },
            venue_amenity: {
                include: {
                    venue_id: false,
                    amenity_id: false,
                    amenity: true
                }
            }
        }
    });

    res.json(data);
});

/**
 * For getting building details.
 * 
 * TODO: implement
 * NOTE: waiting for confirmation if db needs to be modified.
 */
app.get('/api/building/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await prisma.building.findMany({
        where: { id: id }
    });
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});