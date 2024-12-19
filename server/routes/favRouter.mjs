import express from 'express';
import {Team, User} from "../db.mjs";
import mongoose from "mongoose";

const router = express.Router();

router.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().select('_id name');
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

router.post('/favorites/add', async (req, res) => {
    const { teamId } = req.body;
    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        throw new Error("Invalid team ID");
    }

    try {
        const user = await User.findById(req.user._id);
        await user.addFavorite(teamId);
        res.json({ message: "Favorite team added successfully", favorites: user.favorites });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/favorites/remove', async (req, res) => {
    const { teamId } = req.body;
    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        throw new Error("Invalid team ID");
    }

    try {
        const user = await User.findById(req.user._id);
        await user.removeFavorite(teamId);
        res.json({ message: "Favorite team removed successfully", favorites: user.favorites });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
