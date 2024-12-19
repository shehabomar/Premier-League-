import React, { useState } from 'react';
import { useAppContext } from '../../context/appContext';
import './seasonForm.css';

function SeasonForm() {
    const { setSeason, setStage } = useAppContext();
    const [localSeason, setLocalSeason] = useState('');
    const [localStage, setLocalStage] = useState('E0');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!localSeason || localSeason.length !== 4) {
            setError('Please enter a valid 4-digit season (e.g., 2324).');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/season/select-season?season=${localSeason}&stage=${localStage}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to load season data');
            }
            const data = await response.json();
            console.log('Season data loaded:', data);

            setSeason(localSeason);
            setStage(localStage);
        } catch (error) {
            console.error('Error loading season data:', error);
            setError(error.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container-season">
            <h2 className="form-title-season">
                <i className="bi bi-calendar me-2"></i>
                Select Season
            </h2>
            <form className={"form-select-season"} onSubmit={handleSubmit}>
                <div className="form-group-season">
                    <label className="form-label-season">
                        <i className="bi bi-calendar-event me-2"></i>
                        Season
                    </label>
                    <input
                        type="text"
                        className="form-input-season"
                        value={localSeason}
                        onChange={(e) => setLocalSeason(e.target.value)}
                        placeholder="Enter season (e.g., 2324)"
                    />
                </div>
                <div className="form-group-season">
                    <label className="form-label-season">
                        <i className="bi bi-trophy me-2"></i>
                        League
                    </label>
                    <select
                        className="form-input-season"
                        value={localStage}
                        onChange={(e) => setLocalStage(e.target.value)}
                    >
                        <option value="E0">Premier League (E0)</option>
                        <option value="E1">Championship (E1)</option>
                        <option value="E2">League One (E2)</option>
                        <option value="E3">League Two (E3)</option>
                    </select>
                </div>
                {error && <div className="form-error-season">{error}</div>}
                <button type="submit" className="form-button-season">
                    {isLoading ? (
                        <div className="loader-container-season">
                            <div className="loader-season"></div>
                        </div>
                    ) : (
                        <>
                            <i className="bi bi-search me-2"></i>
                            Search
                        </>
                    )}
                </button>
            </form>
        </div>
    );

    // return (
    //     <form className={"form-select-season"} onSubmit={handleSubmit}>
    //         <div>
    //             <label>Season: </label>
    //             <input
    //                 type="text"
    //                 value={localSeason}
    //                 onChange={(e) => setLocalSeason(e.target.value)}
    //                 placeholder="Enter season (e.g., 2324)"
    //             />
    //         </div>
    //         <div>
    //             <label>Stage: </label>
    //             <select value={localStage} onChange={(e) => setLocalStage(e.target.value)}>
    //                 <option value="E0">Premier League (E0)</option>
    //                 <option value="E1">Championship (E1)</option>
    //                 <option value="E2">League One (E2)</option>
    //                 <option value="E3">League Two (E3)</option>
    //             </select>
    //         </div>
    //         {error && <p>{error}</p>}
    //         <button type="submit" disabled={isLoading}>
    //             {isLoading ? 'Setting Season...' : 'Set Season'}
    //         </button>
    //         {isLoading && (
    //             <div className="loader-container">
    //                 <div className="loader"></div>
    //             </div>
    //         )}
    //     </form>
    // );
}

export default SeasonForm;
