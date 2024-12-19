import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './loginForm.css';
import {useFavoriteTeamsContext} from "../../context/favoritesAppContext";

function LoginForm() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { refresh } = useFavoriteTeamsContext();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: formData.username, password: formData.password }),
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                navigate('/');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred. Please try again.');
        }

        refresh();
    };

    return (
        <div id="form-container-login">
            <h2 className="form-title-login">
                <i className="bi bi-person-circle me-2"></i>
                Login
            </h2>
            <form className="form-login" onSubmit={handleSubmit}>
                <div className="form-group-login">
                    <label className="form-label-login">
                        <i className="bi bi-person me-2"></i>
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        className="form-input-login"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                    />
                </div>
                <div className="form-group-login">
                    <label className="form-label-login">
                        <i className="bi bi-key me-2"></i>
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        className="form-input-login"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                    />
                </div>
                {error && <div className="form-error-login">{error}</div>}
                <button type="submit" className="form-button-login">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                </button>
            </form>
        </div>
    );
}

export default LoginForm;