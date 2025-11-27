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
 * TODO: implement getting info on agent's buildings
 * NOTE: waiting for db modification
 */
app.get('/api/dashboard/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const agent = await prisma.ss_user.findUnique({ where: { id } });

    // Fail fast if id is not attributed to an agent
    if (agent.usertype != 1) {
        res.status(400).send("User is not an agent!");
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
                ss_user: {
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
    const [venue, agent, amenities] = await prisma.$transaction([
        prisma.venue.findUnique({ where: { id } }),
        prisma.ss_user.findMany({
            where: {
                venue: { 
                    some: { id }
                }
            },
            include: {
                id: false,
                usertype: false,
                birthdate: false
            }
        }),
        prisma.venue_amenity.findMany({
            where: { venue_id: id },
            include: {
                venue_id: false,
                amenity_id: false,
                amenity: true
            }
        })
    ]);

    const data = { venue, agent, amenities };
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

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});