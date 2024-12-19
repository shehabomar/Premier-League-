import express from 'express';
import {TeamSeason, User} from "../db.mjs";

const router = express.Router();

router.get('/standings', async (req, res) => {
    try {
        let { season, stage } = req.query;
        const currentYear = new Date().getFullYear();
        const userId = req.isAuthenticated() ? req.user._id : null;
        let userFavorites = [];

        if (userId) {
            const user = await User.findById(userId).populate('favorites');
            userFavorites = user.favorites.map((team) => team._id.toString());
        }

        if (!season || !stage) {
            season = `${currentYear.toString().slice(-2)}${(currentYear + 1).toString().slice(-2)}`;
            stage = 'E0';
        }

        const standings = await TeamSeason.find({ season, stage })
            .populate('team')
            .sort({ points: -1, wins: -1, losses: 1 });

        if (standings.length === 0) {
            console.warn(`No standings found for season ${season} and stage ${stage}`);
        }

        const enhancedStandings = standings.map((teamSeason) => ({
            _id: teamSeason.team._id,
            name: teamSeason.team.name,
            points: teamSeason.points,
            wins: teamSeason.wins,
            losses: teamSeason.losses,
            draws: teamSeason.draws,
            season: teamSeason.season,
            stage: teamSeason.stage,
            isFavorite: userFavorites.includes(teamSeason.team._id.toString()),
        }));

        res.json(enhancedStandings);
    } catch (error) {
        console.error("Failed to fetch standings:", error);
        res.status(500).json({ error: "Failed to fetch standings" });
    }
});

export default router;
