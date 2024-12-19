import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import MainPage from './components/pages/mainPage';
import MatchesPage from './components/pages/matchesPage';
import StandingsPage from './components/pages/standingTable';
import SeasonForm from './components/pages/seasonForm';
import RegisterForm from './components/auth/registerForm';
import LoginForm from './components/auth/loginForm';
import UserPanel from './components/pages/userPage';
import NotFound from './components/pages/notFound';
import { AppProvider } from './context/appContext';
import { FavoriteTeamsProvider} from './context/favoritesAppContext';
import Navbar from "./components/shared/Navbar";
import handleFetchSeasonData from "./utils/seasonUtils";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
    return (
        <AppProvider>
            <FavoriteTeamsProvider>
                <Router>
                    <div className="App">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<MainPage />} />
                            <Route path="/matches" element={<MatchesPage />} />
                            <Route path="/standings" element={<StandingsPage />} />
                            <Route path="/select-season" element={<SeasonForm onFetchData={handleFetchSeasonData} />} />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/user" element={<UserPanel />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </Router>
            </FavoriteTeamsProvider>
        </AppProvider>
    );
}

export default App;
