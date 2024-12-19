import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: { type: [mongoose.Schema.Types.ObjectId], ref: 'Team', default: [] }
});

userSchema.methods.addFavorite = async function (teamId) {
    if (this.favorites.length >= 3) {
        throw new Error("You can only have up to 3 favorite teams.");
    }
    if (!this.favorites.includes(teamId)) {
        this.favorites.push(teamId);
    }
    return this.save();
};

userSchema.methods.removeFavorite = async function (teamId) {
    this.favorites = this.favorites.filter((id) => id.toString() !== teamId.toString());
    return this.save();
};


const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    nameKey: { type: String, required: true, unique: true },
});

teamSchema.index({ nameKey: 1 }, { unique: true });

const teamSeasonSchema = new mongoose.Schema({
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    season: { type: String, required: true },
    stage: { type: String, required: true },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 }
});

teamSeasonSchema.index({ team: 1, season: 1, stage: 1 }, { unique: true });

const matchSchema = new mongoose.Schema({
    team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    score: {
        team1: Number,
        team2: Number
    },
    date: Date,
    stats: {
        possession_team1: Number,
        possession_team2: Number,
        shots_on_target_team1: Number,
        shots_on_target_team2: Number
    },
    season: { type: String, required: true },
    stage: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const Match = mongoose.model('Match', matchSchema);
const Team = mongoose.model('Team', teamSchema);
const TeamSeason = mongoose.model('TeamSeason', teamSeasonSchema);

export { User, Match, Team, TeamSeason };