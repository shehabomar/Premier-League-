import express from 'express';
import {parse} from "csv-parse";
import {Match, Team, TeamSeason} from "../db.mjs";

const router = express.Router();

const standardizeTeamName = (name) => {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

router.get('/select-season', async (req, res) => {
    let { season, stage } = req.query;
    const currentYear = new Date().getFullYear();

    if (!season || !stage) {
        return res.json({
            season: `${currentYear.toString().slice(-2)}${(currentYear + 1).toString().slice(-2)}`,
            stage: 'E0',
        });
    }

    const url = `https://www.football-data.co.uk/mmz4281/${season}/${stage}.csv`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch data from URL. Status: ${response.status}`);
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const csvData = await response.text();
        const records = await new Promise((resolve, reject) => {
            parse(csvData, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }, (err, records) => {
                if (err) {
                    console.error('Error parsing CSV data:', err);
                    reject(err);
                } else {
                    resolve(records);
                }
            });
        });

        await Promise.all([
            Match.deleteMany({ season, stage }),
            TeamSeason.deleteMany({ season, stage })
        ]);

        const teamNames = new Set([...records.map(m => standardizeTeamName(m.HomeTeam)), ...records.map(m => standardizeTeamName(m.AwayTeam))]);
        const existingTeams = await Team.find({
            nameKey: { $in: Array.from(teamNames) },
        });

        const teamMap = existingTeams.reduce((map, team) => {
            map[team.nameKey] = team._id;
            return map;
        }, {});

        for (const teamNameKey of teamNames) {
            try {
                if (!teamMap[teamNameKey]) {
                    let team = await Team.findOne({ nameKey: teamNameKey });

                    if (!team) {
                        const record = records.find(
                            (r) =>
                                standardizeTeamName(r.HomeTeam) === teamNameKey ||
                                standardizeTeamName(r.AwayTeam) === teamNameKey
                        );

                        let originalName;
                        if (record) {
                            originalName = standardizeTeamName(record.HomeTeam) === teamNameKey
                                ? record.HomeTeam
                                : record.AwayTeam;
                        } else {
                            originalName = teamNameKey;
                        }

                        team = await Team.findOne({ name: originalName });

                        if (!team) {
                            try {
                                team = await Team.create({
                                    name: originalName,
                                    nameKey: teamNameKey,
                                });
                            } catch (error) {
                                if (error.code === 11000) {
                                    team = await Team.findOne({
                                        $or: [
                                            { name: originalName },
                                            { nameKey: teamNameKey }
                                        ]
                                    });

                                    if (!team) {
                                        throw error;
                                    }
                                } else {
                                    throw error;
                                }
                            }
                        }
                    }
                    teamMap[teamNameKey] = team._id;
                }
            } catch (error) {
                console.error(`Error handling team ${teamNameKey}:`, error);
                throw error;
            }
        }

        for (const teamName of teamNames) {
            const teamId = teamMap[teamName];
            try {
                await TeamSeason.create({
                    team: teamId,
                    season,
                    stage,
                    points: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0
                });
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`TeamSeason document already exists for team ${teamName}. Skipping creation.`);
                } else {
                    console.error(`Error creating TeamSeason document for team ${teamName}:`, error);
                    throw error;
                }
            }
        }

        const matchPromises = records.map(async (match) => {
            try {
                const matchDateParts = match.Date.split('/');
                const matchDate = new Date(
                    matchDateParts[2],
                    matchDateParts[1] - 1,
                    matchDateParts[0]
                );

                const team1NameKey = standardizeTeamName(match.HomeTeam);
                const team2NameKey = standardizeTeamName(match.AwayTeam);

                const team1Id = teamMap[team1NameKey];
                const team2Id = teamMap[team2NameKey];

                return Match.create({
                    team1: team1Id,
                    team2: team2Id,
                    score: {
                        team1: parseInt(match.FTHG) || 0,
                        team2: parseInt(match.FTAG) || 0,
                    },
                    date: matchDate,
                    season,
                    stage,
                });
            } catch (error) {
                console.error(
                    `Error creating match between ${match.HomeTeam} and ${match.AwayTeam}:`,
                    error
                );
                throw error;
            }
        });

        await Promise.all(matchPromises.filter(Boolean));

        const matches = await Match.find({ season, stage });

        const teamStats = {};
        for (const teamNameKey of teamNames) {
            const teamId = teamMap[teamNameKey].toString();
            teamStats[teamId] = {
                points: 0,
                wins: 0,
                losses: 0,
                draws: 0,
            };
        }

        for (const match of matches) {
            const team1Id = match.team1.toString();
            const team2Id = match.team2.toString();
            const team1Goals = match.score.team1;
            const team2Goals = match.score.team2;

            if (team1Goals > team2Goals) {
                teamStats[team1Id].points += 3;
                teamStats[team1Id].wins += 1;
                teamStats[team2Id].losses += 1;
            } else if (team1Goals < team2Goals) {
                teamStats[team2Id].points += 3;
                teamStats[team2Id].wins += 1;
                teamStats[team1Id].losses += 1;
            } else {
                teamStats[team1Id].points += 1;
                teamStats[team1Id].draws += 1;
                teamStats[team2Id].points += 1;
                teamStats[team2Id].draws += 1;
            }
        }

        for (const [teamId, stats] of Object.entries(teamStats)) {
            await TeamSeason.findOneAndUpdate(
                { team: teamId, season, stage },
                { $set: stats },
                { upsert: true }
            );
        }

        const updatedStandings = await TeamSeason.find({ season, stage })
            .populate('team')
            .sort('-points -wins +losses');

        const updatedMatches = await Match.find({ season, stage })
            .populate('team1 team2')
            .sort('date');

        res.json({ matches: updatedMatches, standings: updatedStandings });
    } catch (error) {
        console.error("Data fetching error:", error.message);
        res.status(500).json({
            error: "Failed to fetch data for the selected season and stage.",
            details: error.message
        });
    }
});

export default router;