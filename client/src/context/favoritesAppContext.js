import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const FavoriteTeamsContext = createContext();

export const FavoriteTeamsProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshStatus, setRefreshStatus] = useState(false);

    const refresh = useCallback(() => setRefreshStatus((prev) => !prev), []);

    const fetchFavorites = useCallback(async (currentUserId) => {
        if (!currentUserId) return;
        try {
            const response = await fetch(`/user/users/favorites/${currentUserId}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();

                setFavorites(data.favorites || []);
            } else {
                throw new Error('Failed to fetch favorites');
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError('Failed to load favorites');
        }
    }, []);

    const fetchCurrentUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/user/api/current-user`, {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data?.userId) {
                    setUserId(data.userId);
                    setUsername(data.username);
                    await fetchFavorites(data.userId);
                }
            } else if (response.status === 401) {
                setUserId(null);
                setUsername(null);
                setFavorites([]);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    }, [fetchFavorites]);

    const toggleFavorite = useCallback(
        async (teamId) => {
            if (!userId) return;

            try {
                const response = await fetch(`/user/users/favorites`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ teamId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data.favorites || []);
                } else {
                    const errorData = await response.json();
                    alert(`Failed to update favorites: ${errorData.error}`);
                }
            } catch (error) {
                alert('An unexpected error occurred. Please try again.');
            }
        },
        [userId]
    );


    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser, refreshStatus]);

    return (
        <FavoriteTeamsContext.Provider
            value={{
                favorites,
                fetchFavorites,
                toggleFavorite,
                userId,
                setUserId,
                username,
                setUsername,
                loading,
                error,
                refresh,
            }}
        >
            {children}
        </FavoriteTeamsContext.Provider>
    );
};

export const useFavoriteTeamsContext = () => useContext(FavoriteTeamsContext);
