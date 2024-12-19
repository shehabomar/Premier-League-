import express from 'express';
import {Match} from "../db.mjs";

const router = express.Router();

router.get('/matches', async (req, res) => {
    try {
        let { season, stage } = req.query;
        const currentYear = new Date().getFullYear();

        if (!season || !stage) {
            season = `${currentYear.toString().slice(-2)}${(currentYear + 1).toString().slice(-2)}`;
            stage = 'E0';
        }

        let matches = await Match.find({ season, stage })
            .populate('team1 team2')
            .sort({ date: -1 });

        if (matches.length === 0) {
            res.status(404).json({ error: "No matches found for the specified season and stage. Please load the data using /select-season endpoint." });
            return;
        }

        res.json(matches);
    } catch (error) {
        console.error("Failed to fetch matches:", error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});

export default router;