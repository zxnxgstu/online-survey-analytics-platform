import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import PublicPollsPage from "./pages/PublicPollsPage";
import { ToastContainer } from 'react-toastify';

const App = () => {
  const { user } = useAuth();

  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            <Route
                path="/publicPolls"
                element={
                    <Layout>
                        <PublicPollsPage />
                    </Layout>
                }
            />
            <Route
                path="/poll/:pollId"
                element={
                    <Layout>
                        <PollDetails />
                    </Layout>
                }
            />
            <Route
                path="/settings"
                element={
                    <Layout>
                        <SettingsPage />
                    </Layout>
                }
            />
            <Route
              path="/my-polls"
              element={
                <Layout>
                    {(user?.role === 'advanced' || user?.role === 'admin') ? <MyPolls /> : <NotFound />}
                </Layout>
              }
          />
          <Route
              path="/create-poll"
              element={
                <Layout>
                    {(user?.role === 'advanced' || user?.role === 'admin') ? <CreatePoll /> : <NotFound />}
                </Layout>
              }
          />


          <Route
              path="/help"
              element={
                <Layout>
                     <Help />
                </Layout>
              }
          />
          <Route
              path="/users"
              element={
                <Layout>
                  {user?.role === 'admin' ? <UsersAdmin /> : <NotFound />}
                </Layout>
              }
          />
          <Route
              path="/database"
              element={
                <Layout>
                  {user?.role === 'admin' ? <DatabaseAdmin /> : <NotFound />}
                </Layout>
              }
          />
            <Route
                path="/dashboard"
                element={
                    <Layout>
                        {user?.role === 'admin' ? <Dashboard /> : <NotFound />}
                    </Layout>
                }
            />
          <Route path="*" element={<NotFound />} />
        </Routes>
          <ToastContainer />
      </Router>
  );
};

export default App;