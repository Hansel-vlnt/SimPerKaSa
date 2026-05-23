import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const AdminDashboardData = () => {
  const [tbsPrices, setTbsPrices] = useState([]);
  const [newsList, setNewsList] = useState([]);
  
  const [priceForm, setPriceForm] = useState({ date: '', price: '' });
  const [newsForm, setNewsForm] = useState({ date: '', headline: '', summary: '' });

  const fetchData = async () => {
    try {
      const [priceRes, newsRes] = await Promise.all([
        axios.get(`${API_BASE}/tbs_prices`),
        axios.get(`${API_BASE}/news`)
      ]);
      setTbsPrices(priceRes.data);
      setNewsList(newsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/tbs_prices`, {
        date: priceForm.date,
        price: parseFloat(priceForm.price)
      });
      setPriceForm({ date: '', price: '' });
      fetchData();
    } catch (error) {
      console.error("Error saving TBS price", error);
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/news`, {
        date: newsForm.date,
        headline: newsForm.headline,
        summary: newsForm.summary
      });
      setNewsForm({ date: '', headline: '', summary: '' });
      fetchData();
    } catch (error) {
      console.error("Error saving News", error);
    }
  };

  const deletePrice = async (id) => {
    try {
      await axios.delete(`${API_BASE}/tbs_prices/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting price", error);
    }
  };

  const deleteNews = async (id) => {
    try {
      await axios.delete(`${API_BASE}/news/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting news", error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Dashboard Content</h1>
        <p>Update Harga TBS and Berita Terkini for the public Dashboard.</p>
      </div>

      <div className="admin-card">
        <h3>Update Harga TBS</h3>
        <form onSubmit={handlePriceSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={priceForm.date}
                onChange={e => setPriceForm({...priceForm, date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Price (Rp/kg)</label>
              <input 
                type="number" 
                className="form-control" 
                value={priceForm.price}
                onChange={e => setPriceForm({...priceForm, price: e.target.value})}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Price</button>
        </form>

        <table className="admin-table" style={{marginTop: '20px'}}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Price (Rp/kg)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tbsPrices.map(p => (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td>{p.price.toLocaleString('id-ID')}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => deletePrice(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {tbsPrices.length === 0 && <tr><td colSpan="3">No TBS Prices saved</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h3>Update Berita Terkini</h3>
        <form onSubmit={handleNewsSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={newsForm.date}
                onChange={e => setNewsForm({...newsForm, date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Headline</label>
              <input 
                type="text" 
                className="form-control" 
                value={newsForm.headline}
                onChange={e => setNewsForm({...newsForm, headline: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Summary</label>
            <textarea 
              className="form-control" 
              rows="3"
              value={newsForm.summary}
              onChange={e => setNewsForm({...newsForm, summary: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Save News</button>
        </form>

        <table className="admin-table" style={{marginTop: '20px'}}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Headline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {newsList.map(n => (
              <tr key={n.id}>
                <td>{n.date}</td>
                <td>{n.headline}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => deleteNews(n.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {newsList.length === 0 && <tr><td colSpan="3">No News saved</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardData;
