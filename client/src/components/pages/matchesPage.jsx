import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/appContext';
import { useFavoriteTeamsContext } from '../../context/favoritesAppContext';
import './matchesPage.css';

function MatchesPage() {
    const { season, stage } = useAppContext();
    const { favorites, fetchFavorites, userId, loading: favoritesLoading } = useFavoriteTeamsContext();
    const [matches, setMatches] = useState([]);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            setMatchesLoading(true);
            setError(null);
            try {
                const response = await fetch(`/matches/matches?season=${season}&stage=${stage}`);
                if (!response.ok) throw new Error('Failed to fetch matches');
                const data = await response.json();
                setMatches(data.filter((match) => match.team1 && match.team2));
            } catch (err) {
                setError(err.message);
                setMatches([]);
            } finally {
                setMatchesLoading(false);
            }
        };
        if (season && stage) {
            fetchMatches();
        }
    }, [season, stage]);

    useEffect(() => {
        if (userId) {
            fetchFavorites(userId).catch((err) => console.error('Error fetching favorites:', err));
        }
    }, [userId, fetchFavorites]);

    const isFavorite = (teamId) => {
        if (!teamId) return false;
        const isFav = favorites.some((fav) => fav._id.toString() === teamId.toString());
        return isFav;
    };

    if (matchesLoading || favoritesLoading) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-arrow-repeat spinner-border text-primary" role="status"></i>
                <p className="mt-3">Loading data...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">
                <i className="bi bi-calendar-event me-2"></i>Match Schedule
            </h1>
            <div className="row gy-4">
                {error ? (
                    <div className="col-12">
                        <p className="text-danger text-center">
                            <i className="bi bi-exclamation-triangle me-2"></i>{error}
                        </p>
                    </div>
                ) : matches.length > 0 ? (
                    matches.map((match) => {
                        const team1 = match.team1;
                        const team2 = match.team2;

                        if (!team1 || !team2) {
                            return null;
                        }

                        // Determine if either team is a favorite
                        const isTeam1Favorite = isFavorite(team1._id);
                        const isTeam2Favorite = isFavorite(team2._id);

                        // Determine the card color based on the favorite team
                        const cardStyle = {
                            backgroundColor: isTeam1Favorite || isTeam2Favorite ? '#ffecb3' : '#fff', // Light yellow for favorites
                            borderColor: isTeam1Favorite || isTeam2Favorite ? '#ff9800' : '#ccc', // Orange border for favorites
                        };

                        return (
                            <div key={match._id} className="col-md-4">
                                <div className="card shadow-sm" style={cardStyle}>
                                    <div className="card-body text-center">
                                        <h5 className="card-title text-primary">
                                            <i className="bi bi-people-fill me-2"></i>
                                            {team1.name} vs {team2.name}
                                        </h5>
                                        <p className="card-text">
                                            <i className="bi bi-trophy me-1"></i>
                                            <strong>Score:</strong> {match.score.team1} - {match.score.team2}
                                        </p>
                                        <p className="card-text">
                                            <i className="bi bi-calendar2-week-fill me-1"></i>
                                            <strong>Date:</strong> {new Date(match.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-12">
                        <p className="text-muted text-center no-matches">
                            <i className="bi bi-emoji-frown me-2"></i>No matches available
                        </p>
                    </div>
                )}
            </div>
        </div>
    );


    // return (
    //     <div className="container py-5">
    //         <h1 className="text-center mb-4">
    //             <i className="bi bi-calendar-event me-2"></i>Match Schedule
    //         </h1>
    //         <div className="row gy-4">
    //             {error ? (
    //                 <div className="col-12">
    //                     <p className="text-danger text-center">
    //                         <i className="bi bi-exclamation-triangle me-2"></i>{error}
    //                     </p>
    //                 </div>
    //             ) : matches.length > 0 ? (
    //                 matches.map((match) => {
    //                     const team1 = match.team1;
    //                     const team2 = match.team2;
    //
    //                     if (!team1 || !team2) {
    //                         return null;
    //                     }
    //
    //                     return (
    //                         <div
    //                             key={match._id}
    //                             className={`col-md-4 ${
    //                                 isFavorite(team1._id) || isFavorite(team2._id)
    //                                     ? 'favorite-highlight'
    //                                     : ''
    //                             }`}
    //                         >
    //                             <div className="card shadow-sm">
    //                                 <div className="card-body text-center">
    //                                     <h5 className="card-title text-primary">
    //                                         <i className="bi bi-people-fill me-2"></i>
    //                                         {team1.name} vs {team2.name}
    //                                     </h5>
    //                                     <p className="card-text">
    //                                         <i className="bi bi-trophy me-1"></i>
    //                                         <strong>Score:</strong> {match.score.team1} - {match.score.team2}
    //                                     </p>
    //                                     <p className="card-text">
    //                                         <i className="bi bi-calendar2-week-fill me-1"></i>
    //                                         <strong>Date:</strong> {new Date(match.date).toLocaleDateString()}
    //                                     </p>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     );
    //                 })
    //             ) : (
    //                 <div className="col-12">
    //                     <p className="text-muted text-center no-matches">
    //                         <i className="bi bi-emoji-frown me-2"></i>No matches available
    //                     </p>
    //                 </div>
    //             )}
    //         </div>
    //     </div>
    // );
}

export default MatchesPage;
