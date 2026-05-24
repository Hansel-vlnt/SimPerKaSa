import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_FINANCES = 'http://localhost:8000/api/finances';
const API_HARVESTS = 'http://localhost:8000/api/harvests';

const AdminFinances = () => {
  const [records, setRecords] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [formData, setFormData] = useState({ type: 'income', amount: '', description: '', date: '' });

  const fetchData = async () => {
    try {
      const [finRes, harvRes] = await Promise.all([
        axios.get(API_FINANCES),
        axios.get(API_HARVESTS)
      ]);
      setRecords(finRes.data);
      setHarvests(harvRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_FINANCES, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date
      });
      setFormData({ type: 'income', amount: '', description: '', date: '' });
      fetchData();
    } catch (error) {
      console.error("Error saving record", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_FINANCES}/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting record", error);
    }
  };

  // Calculations for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const isCurrentMonth = (dateString) => {
    const d = new Date(dateString);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const blockIncomeThisMonth = harvests
    .filter(h => isCurrentMonth(h.date))
    .reduce((sum, h) => sum + h.estimated_income, 0);

  const manualIncomeThisMonth = records
    .filter(r => r.type === 'income' && isCurrentMonth(r.date))
    .reduce((sum, r) => sum + r.amount, 0);

  const expensesThisMonth = records
    .filter(r => r.type === 'expense' && isCurrentMonth(r.date))
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Finances</h1>
        <p>Add, edit, or delete manual financial records. View automatic summaries.</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ flex: 1, margin: 0, borderLeft: '4px solid #4caf50' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>Total Block Income (This Month)</h4>
          <h2 style={{ margin: 0, color: '#1a4d33' }}>Rp {blockIncomeThisMonth.toLocaleString('id-ID')}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#888' }}>Calculated from Harvest Records</p>
        </div>
        
        <div className="admin-card" style={{ flex: 1, margin: 0, borderLeft: '4px solid #8fc7a6' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>Total Manual Income (This Month)</h4>
          <h2 style={{ margin: 0, color: '#1a4d33' }}>Rp {manualIncomeThisMonth.toLocaleString('id-ID')}</h2>
        </div>

        <div className="admin-card" style={{ flex: 1, margin: 0, borderLeft: '4px solid #f44336' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>Total Expenses (This Month)</h4>
          <h2 style={{ margin: 0, color: '#d32f2f' }}>Rp {expensesThisMonth.toLocaleString('id-ID')}</h2>
        </div>
      </div>

      <div className="admin-card">
        <h3>Add New Manual Record</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select 
                className="form-control" 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="income">Income (Pendapatan Lainnya)</option>
                <option value="expense">Expense (Pengeluaran)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount (Rp)</label>
              <input 
                type="number" 
                className="form-control" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Reason (Description)</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Buy fertilizer..."
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
          <button type="submit" className="btn btn-primary">Save Record</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Manual Financial Records</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Amount (Rp)</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.type === 'income' ? ' Income' : ' Expense'}</td>
                <td>{record.amount.toLocaleString('id-ID')}</td>
                <td>{record.description || '-'}</td>
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

export default AdminFinances;
