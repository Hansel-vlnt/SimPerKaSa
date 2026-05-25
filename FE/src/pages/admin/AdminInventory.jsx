import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/inventory';

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ item_name: '', current_stock: '', unit: 'Sak' });

  const fetchItems = async () => {
    try {
      const response = await axios.get(API_URL);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching inventory", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, {
        item_name: formData.item_name,
        current_stock: parseFloat(formData.current_stock),
        unit: formData.unit
      });
      setFormData({ item_name: '', current_stock: '', unit: 'Sak' });
      fetchItems();
    } catch (error) {
      console.error("Error saving item", error);
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    try {
      await axios.put(`${API_URL}/${id}/stock`, { current_stock: parseFloat(newStock) });
      fetchItems();
    } catch (error) {
      console.error("Error updating stock", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item", error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Inventory</h1>
        <p>Keep track of warehouse stock (fertilizers, tools, etc).</p>
      </div>

      <div className="admin-card">
        <h3>Add New Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Item Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.item_name}
                onChange={e => setFormData({...formData, item_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Current Stock</label>
              <input 
                type="number" 
                step="0.01"
                className="form-control" 
                value={formData.current_stock}
                onChange={e => setFormData({...formData, current_stock: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select 
                className="form-control" 
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              >
                <option value="Sak">Sak</option>
                <option value="Liter">Liter</option>
                <option value="Kg">Kg</option>
                <option value="Pcs">Pcs</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Item</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Inventory List</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.item_name}</td>
                <td>
                  <input 
                    type="number" 
                    step="0.01"
                    defaultValue={item.current_stock} 
                    onBlur={(e) => {
                      if (parseFloat(e.target.value) !== item.current_stock) {
                        handleStockUpdate(item.id, e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    style={{ 
                      width: '100px', 
                      padding: '6px', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#1a4d33'
                    }}
                  />
                </td>
                <td>{item.unit}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventory;
