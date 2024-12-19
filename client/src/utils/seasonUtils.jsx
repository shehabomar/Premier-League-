const handleFetchSeasonData = async (season, stage) => {
    try {
        const response = await fetch(`/season/select-season?season=${season}&stage=${stage}`);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
    } catch (error) {
        console.error('Error fetching season data:', error);
    }
};

export default handleFetchSeasonData;