import { Home, Users, List, Settings, FilePlus, Database, PieChart, HelpCircle, CheckSquare } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <div className="d-flex flex-column h-100 p-3">
            <h4 className="text-center mb-4">🗳️ OnlineVoting</h4>

            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <Link to="/" className="nav-link link-dark">
                        <Home className="me-2" size={18}/>
                        Головна
                    </Link>
                </li>

                <li>
                    <Link to="/publicPolls" className="nav-link link-dark">
                        <CheckSquare className="me-2" size={18}/>
                        Публічні опитування
                    </Link>
                </li>

                {(user?.role === 'admin' || user?.role === 'advanced') && (
                    <li>
                        <Link to="/my-polls" className="nav-link link-dark">
                            <List className="me-2" size={18}/>
                            Мої опитування
                        </Link>
                    </li>
                )}

                {(user?.role === 'admin' || user?.role === 'advanced') && (
                    <li>
                        <Link to="/create-poll" className="nav-link link-dark">
                            <FilePlus className="me-2" size={18}/>
                            Створити опитування
                        </Link>
                    </li>
                )}

                {user?.role === 'admin' && (
                    <li>
                        <Link to="/users" className="nav-link link-dark">
                            <Users className="me-2" size={18}/>
                            Користувачі
                        </Link>
                    </li>
                )}

                {user?.role === 'admin' && (
                    <li>
                        <Link to="/database" className="nav-link link-dark">
                            <Database className="me-2" size={18}/>
                            Управління базою даних
                        </Link>
                    </li>
                )}

                {user?.role === 'admin' && (
                    <li>
                        <Link to="/dashboard" className="nav-link link-dark">
                            <PieChart className="me-2" size={18}/>
                            Панель керування
                        </Link>
                    </li>
                )}

                <li>
                    <Link to="/settings" className="nav-link link-dark">
                        <Settings className="me-2" size={18}/>
                        Налаштування
                    </Link>
                </li>

                <li>
                    <Link to="/help" className="nav-link link-dark">
                        <HelpCircle className="me-2" size={18}/>
                        FAQ
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
