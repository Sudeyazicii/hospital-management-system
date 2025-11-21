import React from 'react';
import { Link } from 'react-router-dom';

const MedicalRecords = () => {
    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Medical Records</h1>
                <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
                <h3>Recent Visits</h3>
                <ul style={{ marginTop: '1rem' }}>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                        <strong>2023-10-01:</strong> General Checkup - Dr. Smith
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                        <strong>2023-09-15:</strong> Flu Shot - Dr. Jones
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default MedicalRecords;
