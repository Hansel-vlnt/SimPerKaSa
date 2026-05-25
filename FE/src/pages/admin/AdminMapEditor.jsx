import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminMapEditor.css';

const API_URL = 'http://localhost:8000/api/blocks';

const AdminMapEditor = () => {
  const [blocks, setBlocks] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({ name: '', area_size: '', status: 'Sudah Dipupuk', plant_age: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const svgRef = React.useRef(null);

  const fetchBlocks = async () => {
    try {
      const response = await axios.get(API_URL);
      setBlocks(response.data);
    } catch (error) {
      console.error("Error fetching blocks", error);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser save
        if (isDrawing && currentPolygon.length > 2) {
          setIsDrawing(false);
          setShowForm(true);
        } else if (showForm) {
          const btn = document.getElementById('save-block-btn');
          if (btn) btn.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, currentPolygon, showForm]);

  const getSvgPoint = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const handleMouseMove = (e) => {
    const pt = getSvgPoint(e.clientX, e.clientY);
    setMousePos({ x: pt.x, y: pt.y });
  };

  const handleCanvasClick = (e) => {
    if (showForm) return; // Prevent drawing if form is open

    const pt = getSvgPoint(e.clientX, e.clientY);

    if (!isDrawing) {
      setIsDrawing(true);
      setCurrentPolygon([{ x: pt.x, y: pt.y }]);
    } else {
      setCurrentPolygon([...currentPolygon, { x: pt.x, y: pt.y }]);
    }
  };

  const handleCanvasDoubleClick = () => {
    // We keep double click as a fallback, but the user requested Ctrl+S
    if (isDrawing && currentPolygon.length > 2) {
      setIsDrawing(false);
      setShowForm(true);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isDrawing && currentPolygon.length > 0) {
      const newPolygon = currentPolygon.slice(0, -1);
      setCurrentPolygon(newPolygon);
      if (newPolygon.length === 0) {
        setIsDrawing(false);
      }
    }
  };

  const handleSaveBlock = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBlockId) {
        await axios.put(`${API_URL}/${editingBlockId}`, {
          name: formData.name,
          area_size: parseFloat(formData.area_size),
          status: formData.status,
          plant_age: parseInt(formData.plant_age, 10),
        });
      } else {
        const coordsString = currentPolygon.map(pt => `${pt.x},${pt.y}`).join(' ');
        await axios.post(API_URL, {
          name: formData.name,
          area_size: parseFloat(formData.area_size),
          status: formData.status,
          plant_age: parseInt(formData.plant_age, 10),
          coordinates: coordsString
        });
      }
      
      setFormData({ name: '', area_size: '', status: 'Sudah Dipupuk', plant_age: '' });
      setCurrentPolygon([]);
      setShowForm(false);
      setEditingBlockId(null);
      fetchBlocks();
    } catch (error) {
      console.error("Error saving block", error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', area_size: '', status: 'Sudah Dipupuk', plant_age: '' });
    setCurrentPolygon([]);
    setShowForm(false);
    setIsDrawing(false);
    setEditingBlockId(null);
  };

  const handleEditClick = (block) => {
    setEditingBlockId(block.id);
    setFormData({
      name: block.name,
      area_size: block.area_size,
      status: block.status,
      plant_age: block.plant_age
    });
    setShowForm(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}/status`, { status: newStatus });
      fetchBlocks();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchBlocks();
    } catch (error) {
      console.error("Error deleting block", error);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Map Editor (Admin)</h1>
        <p>Click to add nodes. Right click to remove a node. Ctrl+S to save.</p>
      </div>

      <div className="admin-map-container">
        <div className="map-sidebar">
          <h3>Saved Blocks</h3>
          <ul className="block-list">
            {blocks.map(b => (
              <li key={b.id}>
                <div>
                  <strong>{b.name}</strong>
                  <div>{b.area_size} Ha • {b.plant_age === 0 ? '-' : b.plant_age} Tahun</div>
                  <div style={{ marginTop: '4px' }}>
                    <select 
                      value={b.status} 
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      style={{ 
                        fontSize: '0.85rem', 
                        padding: '2px 4px', 
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: b.status === 'Replanting' ? '#f5f5f5' : (b.status === 'Sudah Dipupuk' ? '#e8f5e9' : '#fff3e0'),
                        color: b.status === 'Replanting' ? '#616161' : (b.status === 'Sudah Dipupuk' ? '#2e7d32' : '#f57f17'),
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Sudah Dipupuk">Sudah Dipupuk</option>
                      <option value="Belum Dipupuk">Belum Dipupuk</option>
                      <option value="Replanting">Replanting</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => handleEditClick(b)} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(b.id)} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Hapus</button>
                </div>
              </li>
            ))}
          </ul>
          {blocks.length === 0 && <p className="text-muted">No blocks mapped yet.</p>}
        </div>

        <div className="map-editor-main">
          <div 
            className="editor-canvas" 
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
            onContextMenu={handleContextMenu}
          >
            <svg ref={svgRef} viewBox="0 0 800 600" className="editor-svg">
              {/* Existing Blocks */}
              {blocks.map(b => (
                <polygon 
                  key={b.id} 
                  points={b.coordinates} 
                  className="saved-polygon" 
                />
              ))}

              {/* Current Drawing Polygon */}
              {currentPolygon.length > 0 && (
                <>
                  <polyline 
                    points={currentPolygon.map(pt => `${pt.x},${pt.y}`).join(' ')} 
                    className="drawing-polyline" 
                  />
                  {/* Dynamic line to cursor */}
                  {isDrawing && (
                    <line 
                      x1={currentPolygon[currentPolygon.length - 1].x} 
                      y1={currentPolygon[currentPolygon.length - 1].y} 
                      x2={mousePos.x} 
                      y2={mousePos.y} 
                      className="drawing-dynamic-line" 
                    />
                  )}
                  {/* Nodes */}
                  {currentPolygon.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="5" className="drawing-node" />
                  ))}
                </>
              )}
            </svg>

            {/* Block Details Form Modal */}
            {showForm && (
              <div className="block-form-overlay">
                <div className="block-form-modal">
                  <h3>{editingBlockId ? "Edit Plantation Block" : "Save Plantation Block"}</h3>
                  <form onSubmit={handleSaveBlock}>
                    <div className="form-group">
                      <label>Block Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required 
                        autoFocus
                      />
                    </div>
                    <div className="form-group">
                      <label>Area Size (Hectares)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="form-control" 
                        value={formData.area_size}
                        onChange={e => setFormData({...formData, area_size: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Plant Age (Years)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={formData.plant_age}
                        onChange={e => setFormData({...formData, plant_age: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select 
                        className="form-control" 
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="Sudah Dipupuk">Sudah Dipupuk (Fertilized)</option>
                        <option value="Belum Dipupuk">Belum Dipupuk (Not Fertilized)</option>
                        <option value="Replanting">Replanting</option>
                      </select>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn" onClick={handleCancel}>Cancel</button>
                      <button type="submit" id="save-block-btn" className="btn btn-primary">Save Block</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMapEditor;
