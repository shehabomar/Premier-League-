import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './registerForm.css';

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password) {
            setError('All fields are required');
            return;
        }
        if (username.length < 8 || password.length < 8) {
            setError('Username and password must be at least 8 characters long');
            return;
        }

        try {
            const response = await fetch(`/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="form-container-register">
            <h2 className="form-title-register">
                <i className="bi bi-person-plus me-2"></i>Register
            </h2>
            <form className="form-register" onSubmit={handleSubmit}>
                <div className="form-group-register">
                    <label className="form-label-register">
                        <i className="bi bi-person me-2"></i>Username
                    </label>
                    <input
                        type="text"
                        className="form-input-register"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        required
                    />
                </div>
                <div className="form-group-register">
                    <label className="form-label-register">
                        <i className="bi bi-envelope me-2"></i>Email
                    </label>
                    <input
                        type="email"
                        className="form-input-register"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        required
                    />
                </div>
                <div className="form-group-register">
                    <label className="form-label-register">
                        <i className="bi bi-key me-2"></i>Password
                    </label>
                    <input
                        type="password"
                        className="form-input-register"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                    />
                </div>
                {error && (
                    <div className="form-error-register">
                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                        {error}
                    </div>
                )}
                <button type="submit" className="form-button-register">
                    <i className="bi bi-check-circle me-2"></i>Register
                </button>
            </form>
        </div>
    );
}

export default RegisterForm;
