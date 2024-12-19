import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavoriteTeamsContext } from '../../context/favoritesAppContext';

const Navbar = () => {
    const { userId, username, loading, setUserId, setUsername } = useFavoriteTeamsContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch(`/auth/logout`, { method: 'POST', credentials: 'include' });
            if (response.ok) {
                setUserId(null);
                setUsername(null);
                navigate('/');
            } else {
                console.error('Logout failed:', await response.json());
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (loading) return null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Premier League Hub</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/matches">Matches</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/standings">Standings</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/select-season">Select Season</Link>
                        </li>
                        {userId ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/user">{username}</Link>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="btn nav-link logout-button"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Register</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
