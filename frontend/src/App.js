import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyPolls from './pages/MyPolls';
import CreatePoll from './pages/CreatePoll';
import PollDetails from './pages/PollDetails';
import SettingsPage from './pages/SettingsPage';
import Help from './pages/Help';
import UsersAdmin from './pages/UsersAdmin';
import DatabaseAdmin from './pages/DatabaseAdmin';
import NotFound from './pages/NotFound';
import useAuth from './hooks/useAuth';
import PublicPollsPage from './pages/PublicPollsPage';
import { ToastContainer } from 'react-toastify';

const LoadingScreen = () => <div className="d-flex justify-content-center align-items-center min-vh-100">Завантаження...</div>;

const Protected = ({ roles, children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
    if (roles && !roles.includes(user?.role)) return <NotFound />;
    return children;
};

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/publicPolls" element={<Layout><PublicPollsPage /></Layout>} />
        <Route path="/poll/:pollId" element={<Protected><Layout><PollDetails /></Layout></Protected>} />
        <Route path="/settings" element={<Protected><Layout><SettingsPage /></Layout></Protected>} />
        <Route path="/my-polls" element={<Protected roles={['advanced', 'admin']}><Layout><MyPolls /></Layout></Protected>} />
        <Route path="/create-poll" element={<Protected roles={['advanced', 'admin']}><Layout><CreatePoll /></Layout></Protected>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/users" element={<Protected roles={['admin']}><Layout><UsersAdmin /></Layout></Protected>} />
        <Route path="/database" element={<Protected roles={['admin']}><Layout><DatabaseAdmin /></Layout></Protected>} />
        <Route path="/dashboard" element={<Protected roles={['admin']}><Layout><Dashboard /></Layout></Protected>} />
        <Route path="*" element={<NotFound />} />
    </Routes>
);

const App = () => (
    <Router>
        <AppRoutes />
        <ToastContainer />
    </Router>
);

export default App;
