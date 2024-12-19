import React, { useEffect, useState } from 'react';
import { useFavoriteTeamsContext } from '../../context/favoritesAppContext';

const UserPanel = () => {
    const {
        username,
        favorites,
        loading,
        error,
        toggleFavorite,
        refresh,
    } = useFavoriteTeamsContext();
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch(`/fav/api/teams`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setTeams(data);
                } else {
                    console.error('Failed to fetch teams');
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        fetchTeams();
    }, []);

    const handleAddOrRemove = async (teamId) => {
        try {
            await toggleFavorite(teamId);
            refresh();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const isFavorite = (teamId) => favorites.some((fav) => fav._id === teamId);

    if (loading) {
        return <p className="text-center text-muted">Loading your data...</p>;
    }

    if (error) {
        return <p className="text-center text-danger">{error}</p>;
    }

    if (!username) {
        return <p className="text-center text-warning">Please log in to manage your profile.</p>;
    }

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1>
                    <i className="bi bi-person-circle me-2"></i>{username}'s Profile
                </h1>
                <p className="text-muted">Manage your favorite teams below:</p>
            </div>

            <div className="mb-4">
                <h2 className="text-center text-primary">
                    <i className="bi bi-heart-fill me-2"></i>Your Favorite Teams
                </h2>
                {favorites.length > 0 ? (
                    <ul className="row gy-4 list-unstyled">
                        {favorites.map((team) => (
                            <li
                                key={team._id}
                                className="col-md-3 team-card favorite"
                            >
                                <span>
                                    <i className="bi bi-shield-fill me-2"></i>{team.name}
                                </span>
                                <button
                                    onClick={() => handleAddOrRemove(team._id)}
                                    className="btn btn-danger w-100"
                                >
                                    <i className="bi bi-x-circle me-1"></i>Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="alert alert-warning text-center">You haven't selected any favorite teams yet.</p>
                )}
            </div>

            <div>
                <h2 className="text-center text-success">
                    <i className="bi bi-list-check me-2"></i>Available Teams
                </h2>
                {teams.length > 0 ? (
                    <ul className="row gy-4 list-unstyled">
                        {teams.map((team) => (
                            <li
                                key={team._id}
                                className={`col-md-3 team-card ${isFavorite(team._id) ? 'favorite' : ''}`}
                            >
                                <span>
                                    <i className="bi bi-shield-fill me-2"></i>{team.name}
                                </span>
                                <button
                                    onClick={() => handleAddOrRemove(team._id)}
                                    className={`btn ${isFavorite(team._id) ? 'btn-danger' : 'btn-primary'} w-100`}
                                >
                                    <i className={`bi ${isFavorite(team._id) ? 'bi-x-circle' : 'bi-plus-circle'} me-1`}></i>
                                    {isFavorite(team._id) ? 'Remove' : 'Add'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="alert alert-info text-center">No teams available.</p>
                )}
            </div>
        </div>
    );
};

export default UserPanel;
