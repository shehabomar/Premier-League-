import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/appContext';
import { useFavoriteTeamsContext } from '../../context/favoritesAppContext';

function StandingsPage() {
    const { season, stage } = useAppContext();
    const { favorites, fetchFavorites, userId } = useFavoriteTeamsContext();
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (season && stage) {
            setLoading(true);
            fetch(`/standings/standings?season=${season}&stage=${stage}`)
                .then((response) => response.json())
                .then((data) => {
                    setStandings(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching standings:', error);
                    setLoading(false);
                });
        }
    }, [season, stage]);

    useEffect(() => {
        if (userId) {
            fetchFavorites(userId);
        }
    }, [userId, fetchFavorites]);

    const isFavorite = (team) => {
        if (!team) return false;
        const teamId = team._id ? team._id.toString() : team.toString();
        const isFav = favorites.some((fav) => fav._id.toString() === teamId);
        return isFav;
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-arrow-repeat spinner-border text-primary" role="status"></i>
                <p className="mt-3">Loading standings...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">
                <i className="bi bi-trophy-fill me-2"></i>League Standings
            </h2>
            {standings.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-light">
                        <tr>
                            <th><i className="bi bi-shield-fill me-1"></i>Team</th>
                            <th><i className="bi bi-star-fill me-1"></i>Points</th>
                            <th><i className="bi bi-check-circle me-1"></i>Wins</th>
                            <th><i className="bi bi-x-circle me-1"></i>Losses</th>
                            <th><i className="bi bi-arrow-repeat me-1"></i>Draws</th>
                        </tr>
                        </thead>
                        <tbody>
                        {standings.map((team) => (
                            <tr
                                key={team._id}
                                className={isFavorite(team._id) ? 'table-warning' : ''}
                            >
                                <td>{team.name}</td>
                                <td>{team.points}</td>
                                <td>{team.wins}</td>
                                <td>{team.losses}</td>
                                <td>{team.draws}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center">No standings available. Please select a season and stage.</p>
            )}
        </div>
    );
}

export default StandingsPage;
