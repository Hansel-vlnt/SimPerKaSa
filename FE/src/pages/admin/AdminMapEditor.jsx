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
    if (isDrawing && currentPolygon.length > 2) {
      // Close the polygon
      setIsDrawing(false);
      setShowForm(true);
    }
  };

  const handleSaveBlock = async (e) => {
    e.preventDefault();
    
    // Convert currentPolygon to string format: "x1,y1 x2,y2 ..."
    const coordsString = currentPolygon.map(pt => `${pt.x},${pt.y}`).join(' ');

    try {
      await axios.post(API_URL, {
        name: formData.name,
        area_size: parseFloat(formData.area_size),
        status: formData.status,
        plant_age: parseInt(formData.plant_age, 10),
        coordinates: coordsString
      });
      
      setFormData({ name: '', area_size: '', status: 'Sudah Dipupuk', plant_age: '' });
      setCurrentPolygon([]);
      setShowForm(false);
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
        <p>Click to add nodes. Double-click to close the polygon and save.</p>
      </div>

      <div className="admin-map-container">
        <div className="map-sidebar">
          <h3>Saved Blocks</h3>
          <ul className="block-list">
            {blocks.map(b => (
              <li key={b.id}>
                <div>
                  <strong>{b.name}</strong>
                  <div>{b.area_size} Ha • {b.plant_age} Tahun</div>
                  <div><small style={{color: b.status === 'Sudah Dipupuk' ? '#2e7d32' : '#f57f17'}}>{b.status}</small></div>
                </div>
                <button className="btn btn-danger" onClick={() => handleDelete(b.id)}>X</button>
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
                  <h3>Save Plantation Block</h3>
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
                      </select>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn" onClick={handleCancel}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Block</button>
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
