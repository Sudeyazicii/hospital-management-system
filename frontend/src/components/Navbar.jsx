import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="nav">
            <Link to="/" className="nav-brand">MediCare HMS</Link>
            <div className="nav-links">
                {user ? (
                    <>
                        <span className="nav-link">Welcome, {user.email} ({user.role})</span>
                        <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
