import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/harvests';

const AdminHarvests = () => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({ block_name: '', tonnage: '', estimated_income: '', date: '' });

  const fetchRecords = async () => {
    try {
      const response = await axios.get(API_URL);
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching harvests", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, {
        block_name: formData.block_name,
        tonnage: parseFloat(formData.tonnage),
        estimated_income: parseFloat(formData.estimated_income),
        date: formData.date
      });
      setFormData({ block_name: '', tonnage: '', estimated_income: '', date: '' });
      fetchRecords();
    } catch (error) {
      console.error("Error saving record", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchRecords();
    } catch (error) {
      console.error("Error deleting record", error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Harvests</h1>
        <p>Log harvest yields and estimated incomes per block.</p>
      </div>

      <div className="admin-card">
        <h3>Add New Harvest Record</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Block Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.block_name}
                onChange={e => setFormData({...formData, block_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Tonnage (Ton)</label>
              <input 
                type="number" 
                step="0.01"
                className="form-control" 
                value={formData.tonnage}
                onChange={e => setFormData({...formData, tonnage: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Est. Income (Rp)</label>
              <input 
                type="number" 
                className="form-control" 
                value={formData.estimated_income}
                onChange={e => setFormData({...formData, estimated_income: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Harvest</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Harvest Records</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Block</th>
              <th>Tonnage</th>
              <th>Est. Income</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.block_name}</td>
                <td>{record.tonnage} Ton</td>
                <td>Rp {record.estimated_income.toLocaleString('id-ID')}</td>
                <td>{record.date}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(record.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHarvests;
