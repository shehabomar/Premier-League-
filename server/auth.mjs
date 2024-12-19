import bcrypt from 'bcryptjs';
import { User } from './db.mjs';

const startAuthenticatedSession = (req, user) => {
    return new Promise((fulfill, reject) => {
        req.session.regenerate((err) => {
            if (!err) {
                req.session.user = user;
                fulfill(user);
            } else {
                reject(err);
            }
        });
    });
};

const endAuthenticatedSession = (req) => {
    return new Promise((fulfill, reject) => {
        req.session.user = null;
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                reject(err);
            } else {
                console.log('Session destroyed successfully');
                fulfill(null);
            }
        });
    });
};

const register = async (username, email, password) => {
    if (username.length < 8 || password.length < 8) {
        throw new Error("USERNAME PASSWORD TOO SHORT");
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error("USERNAME ALREADY EXISTS");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });
    await newUser.save();

    return newUser;
};

const login = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error("USER NOT FOUND");
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        throw new Error("PASSWORDS DO NOT MATCH");
    }

    return user;
};

export {
    startAuthenticatedSession,
    endAuthenticatedSession,
    register,
    login
};
