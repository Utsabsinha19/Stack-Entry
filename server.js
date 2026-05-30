const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("MDDS Address API Running");
});

app.get("/states", async (req, res) => {
    const states = await prisma.state.findMany();

    res.json(states);
});

app.get("/districts/:stateId", async (req, res) => {

    const stateId = Number(req.params.stateId);

    const districts = await prisma.district.findMany({
        where: {
            stateId
        }
    });

    res.json(districts);
});

app.get("/villages", async (req, res) => {

    const villages = await prisma.village.findMany({
        take: 20
    });

    res.json(villages);
});
app.get("/search", async (req, res) => {

    const q = req.query.q || "";

    if (q.length < 2) {
        return res.json([]);
    }

    const villages = await prisma.village.findMany({
        where: {
            name: {
                contains: q,
                mode: "insensitive"
            }
        },
        include: {
            subDistrict: {
                include: {
                    district: {
                        include: {
                            state: true
                        }
                    }
                }
            }
        },
        take: 20
    });

    const result = villages.map(v => ({
        code: v.code,
        village: v.name,
        subDistrict: v.subDistrict.name,
        district: v.subDistrict.district.name,
        state: v.subDistrict.district.state.name
    }));

    res.json(result);
});
app.get("/village/:code", async (req, res) => {

    const village = await prisma.village.findUnique({
        where: {
            code: req.params.code
        },
        include: {
            subDistrict: {
                include: {
                    district: {
                        include: {
                            state: {
                                include: {
                                    country: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    res.json(village);
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});