import React, { useEffect } from 'react';
import { useAppContext } from '../../context/appContext';
import './mainPage.css';

function MainPage() {
    const { season, setSeason, stage, setStage } = useAppContext();

    useEffect(() => {
        fetch(`/season/select-season`)
            .then((response) => response.json())
            .then((data) => {
                setSeason(data.season || '2425');
                setStage(data.stage || 'E0');
            })
            .catch((error) => console.error('Error fetching season and stage:', error));
    }, [setSeason, setStage]);

    return (
        <div className="main-container">
            <section className="hero-section">
                <h1>Welcome to the Premier League Hub</h1>
                <p>Your one-stop destination for Premier League stats, matches, and standings.</p>
                <p>
                    {season && stage
                        ? `Currently viewing: Season ${season}, Stage ${stage}`
                        : 'Loading current season data...'}
                </p>
                <a href="/select-season" className="btn btn-warning btn-lg">Get Started</a>
            </section>

            <section className="features-section">
                <h2 className="section-title">Features</h2>
                <div className="features">
                    <div className="feature-card">
                        <img src="/assets/imgs/track-matches.jpg" alt="Track Matches" className="feature-image" />
                        <h5>Track Matches</h5>
                        <p>Stay updated with match schedules and results.</p>
                    </div>
                    <div className="feature-card">
                        <img src="assets/imgs/view-standings.jpg" alt="View Standings" className="feature-image" />
                        <h5>View Standings</h5>
                        <p>Check the latest league standings and team stats.</p>
                    </div>
                    <div className="feature-card">
                        <img src="assets/imgs/season-selector.jpg" alt="Season Selector" className="feature-image" />
                        <h5>Season Selector</h5>
                        <p>Explore data from different seasons and stages.</p>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <div className="about-content">
                    <h2>About the Premier League Hub</h2>
                    <p>
                        Our platform brings you comprehensive and up-to-date information about the Premier League.
                        Whether you're a die-hard fan or a casual follower, we aim to provide you with the tools and data
                        you need to enjoy the game.
                    </p>
                </div>
                <img src="assets/imgs/about-premier-league.png" alt="About Premier League" className="about-image" />
            </section>

            <section className="cta-section">
                <h2>Ready to Explore?</h2>
                <p>Choose your favorite teams, track their matches, and dive into the stats that matter.</p>
                <a href="/user" className="btn btn-primary btn-lg">Go to Your Dashboard</a>
            </section>
        </div>
    );
}

export default MainPage;
