import React from 'react';
import { Link } from 'react-router-dom';

const Doctors = () => {
    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Our Doctors</h1>
                <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
            </div>
            <div className="dashboard-grid">
                <div className="card">
                    <h3>Dr. Smith</h3>
                    <p>Cardiology</p>
                    <button className="btn btn-primary">View Profile</button>
                </div>
                <div className="card">
                    <h3>Dr. Jones</h3>
                    <p>Pediatrics</p>
                    <button className="btn btn-primary">View Profile</button>
                </div>
            </div>
        </div>
    );
};

export default Doctors;
