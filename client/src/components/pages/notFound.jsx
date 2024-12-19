import React from "react";
import { Link } from "react-router-dom";
import "./notFound.css";

const NotFound = () => {
    return (
        <div className="not-found-container">
            <h1>404</h1>
            <p>Oops! The page you’re looking for doesn’t exist.</p>
            <Link to="/" className="btn btn-primary">
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;
