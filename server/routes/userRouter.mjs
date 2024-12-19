import express from 'express';
import mongoose from 'mongoose';
import {Team, User} from '../db.mjs';

const router = express.Router();

router.get('/api/current-user', (req, res) => {
    try {
        if (req.isAuthenticated() && req.user) {
            res.json({
                userId: req.user._id,
                username: req.user.username
            });
        } else {
            res.status(401).json({ error: 'Not authenticated' });
        }
    } catch (error) {
        console.error('Error in current-user route:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/users/favorites', async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const { teamId } = req.body;

    console.log('Received request to toggle favorite:', { teamId, userId: req.user._id });

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ error: 'Invalid team ID' });
    }

    try {
        const teamExists = await Team.findById(teamId);
        if (!teamExists) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isFavorite = user.favorites.includes(teamId);

        if (!isFavorite) {
            if (user.favorites.length >= 3) {
                return res.status(400).json({ error: 'You can only select up to 3 favorite teams' });
            }
            user.favorites.push(teamId);
        } else {
            user.favorites = user.favorites.filter((favId) => favId.toString() !== teamId);
        }
        console.log('Updated favorites:', user.favorites);
        await user.save();

        res.json({ favorites: user.favorites });
    } catch (error) {
        console.error('Error updating favorites:', error);
        res.status(500).json({ error: 'Failed to update favorite teams' });
    }
});

router.get('/users/favorites/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('favorites', '_id name nameKey');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ favorites: user.favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorite teams' });
    }
});

export default router;
