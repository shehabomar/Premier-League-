import express from 'express';
import passport from '../passportConfig.mjs';
import { register, login, startAuthenticatedSession, endAuthenticatedSession } from '../auth.mjs';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const user = await register(username, email, password);
        await startAuthenticatedSession(req, user);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: "Login successful" });
});

router.post('/logout', async (req, res) => {
    try {
        await endAuthenticatedSession(req);
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
});

export default router;