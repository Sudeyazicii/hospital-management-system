import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return <div className="container">Please log in.</div>;

    return (
        <div className="container">
            <h1>Dashboard</h1>
            <p className="text-light">Welcome back, {user.email}</p>

            <div className="dashboard-grid">
                <div className="card">
                    <h3>Appointments</h3>
                    <p>Manage your upcoming appointments.</p>
                    <Link to="/appointments" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>View Appointments</Link>
                </div>

                <div className="card">
                    <h3>Doctors</h3>
                    <p>Find a specialist.</p>
                    <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>View Doctors</Link>
                </div>

                <div className="card">
                    <h3>Medical Records</h3>
                    <p>Access your medical history.</p>
                    <Link to="/records" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>View Records</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
