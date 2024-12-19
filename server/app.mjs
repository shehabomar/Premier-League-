import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors';
import passport from './passportConfig.mjs';
import {DSN, PORT, SECRET_KEY, DOMAIN, NODE_ENV, TEST_DSN ,TEST_PORT} from './config.mjs';
import path from 'path';
import authRouter from "./routes/authRouter.mjs";
import matchesRouter from "./routes/matchesRouter.mjs";
import standingsRouter from "./routes/standingsRouter.mjs";
import userRouter from "./routes/userRouter.mjs";
import seasonRouter from "./routes/seasonRouter.mjs";
import favRouter from "./routes/favRouter.mjs";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());

app.use(cors({
    origin: `${DOMAIN}`,
    credentials: true
}));

app.use(
    session({
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something broke!',
        details: err.message
    });
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use(passport.session());

// serve react frontend
app.use(express.static(path.join(__dirname, '../client/build')));

// routes
app.use('/auth', authRouter);

app.use('/matches', matchesRouter);

app.use('/standings', standingsRouter);

app.use('/fav', favRouter);

app.use('/user', userRouter);

app.use('/season', seasonRouter);

// invalid endpoints
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// connecting to the database

mongoose.connect( DSN)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

app.listen(NODE_ENV === 'test'? TEST_PORT:  PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app };
