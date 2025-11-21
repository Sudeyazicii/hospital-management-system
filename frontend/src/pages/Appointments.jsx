import React from 'react';
import { Link } from 'react-router-dom';

const Appointments = () => {
    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Appointments</h1>
                <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
                <p>No appointments scheduled yet.</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Book New Appointment</button>
            </div>
        </div>
    );
};

export default Appointments;
