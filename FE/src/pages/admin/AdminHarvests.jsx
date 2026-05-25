import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/harvests';
const API_TBS = 'http://localhost:8000/api/tbs_prices';
const API_BLOCKS = 'http://localhost:8000/api/blocks';

const AdminHarvests = () => {
  const [records, setRecords] = useState([]);
  const [tbsPrices, setTbsPrices] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [tbsError, setTbsError] = useState('');
  const [formData, setFormData] = useState({ block_name: '', tonnage: '', estimated_income: '', date: '' });

  const fetchRecords = async () => {
    try {
      const [harvRes, tbsRes, blocksRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(API_TBS),
        axios.get(API_BLOCKS)
      ]);
      setRecords(harvRes.data);
      setTbsPrices(tbsRes.data);
      setBlocks(blocksRes.data);
    } catch (error) {
      console.error("Error fetching harvests", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (formData.date && formData.tonnage && tbsPrices.length > 0) {
      const priceRecord = tbsPrices.find(p => p.date === formData.date);
      if (priceRecord) {
        setTbsError('');
        const calculatedIncome = parseFloat(formData.tonnage) * 1000 * priceRecord.price;
        if (formData.estimated_income !== calculatedIncome) {
          setFormData(prev => ({ ...prev, estimated_income: calculatedIncome }));
        }
      } else {
        setTbsError(`Harga TBS tanggal ${formData.date} belum diatur! Harap atur di Dashboard.`);
        if (formData.estimated_income !== '') {
          setFormData(prev => ({ ...prev, estimated_income: '' }));
        }
      }
    } else {
      setTbsError('');
    }
  }, [formData.date, formData.tonnage, tbsPrices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tbsError) {
      alert("Tidak dapat menyimpan data. " + tbsError);
      return;
    }
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
              <select 
                className="form-control" 
                value={formData.block_name}
                onChange={e => setFormData({...formData, block_name: e.target.value})}
                required
              >
                <option value="" disabled>-- Pilih Blok Panen --</option>
                {blocks.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
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
                readOnly
                placeholder="Auto-calculated"
                style={{ backgroundColor: '#f5f5f5', color: '#555', cursor: 'not-allowed', fontWeight: 'bold' }}
              />
              {tbsError && <small style={{ color: '#d32f2f', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>{tbsError}</small>}
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
