import React, { useState, useEffect } from 'react';
import './BlokKebun.css';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import axios from 'axios';

dayjs.locale('id');

const API_URL = 'http://localhost:8000/api/blocks';

const BlokKebun = () => {
  const currentDate = dayjs().format('dddd, DD MMMM YYYY');

  const [blocks, setBlocks] = useState([]);
  const [mousePos, setMousePos] = useState({ clientX: 0, clientY: 0 });
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get(API_URL);
        setBlocks(response.data);
      } catch (error) {
        console.error("Error fetching blocks", error);
      }
    };
    fetchBlocks();
  }, []);

  const handleMouseDown = (e) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    setMousePos({
      clientX: e.clientX,
      clientY: e.clientY
    });

    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
    setHoveredBlock(null);
  };

  // Calculate some center points roughly for the label
  const getCenter = (pointsStr) => {
    if (!pointsStr) return { x: 0, y: 0 };
    const points = pointsStr.split(' ').map(pt => {
      const [x, y] = pt.split(',');
      return { x: parseFloat(x), y: parseFloat(y) };
    });
    
    let sumX = 0, sumY = 0;
    points.forEach(p => { sumX += p.x; sumY += p.y; });
    return { x: sumX / points.length, y: sumY / points.length };
  };

  const totalArea = blocks.reduce((sum, b) => sum + b.area_size, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Peta Blok Kebun</h1>
        <p className="page-subtitle">
          <span className="company-name">PT. Palma Nusantara</span> • Tinjauan visual area lahan kelapa sawit • {currentDate}
        </p>
      </div>

      <div className="page-content">
        <div className="viewer-layout">
          
          {/* Map Legend & Information Panel */}
          <div className="info-sidebar">
            <div className="sidebar-section">
              <h2 className="sidebar-title">Ringkasan Peta</h2>
              <div className="summary-item">
                <span className="summary-label">Total Area Lahan</span>
                <span className="summary-value">{totalArea.toFixed(1)} Hektar</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Jumlah Blok</span>
                <span className="summary-value">{blocks.length} Blok</span>
              </div>
            </div>

            <div className="sidebar-section">
              <h2 className="sidebar-title">Legenda Peta</h2>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#4caf50' }}></div>
                <span>Sudah Dipupuk</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#ffeb3b' }}></div>
                <span>Belum Dipupuk</span>
              </div>
            </div>
          </div>

          {/* View-Only Map Canvas */}
          <div 
            className="map-canvas-container"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ 
              cursor: isPanning ? 'grabbing' : 'grab',
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          >
            <svg className="map-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              
              {/* Render Polygons inside a draggable group */}
              <g transform={`translate(${pan.x}, ${pan.y})`}>
                {blocks.map((block) => {
                  const center = getCenter(block.coordinates);
                  const isFertilized = block.status === 'Sudah Dipupuk';
                  return (
                    <g key={block.id}>
                      <polygon
                        points={block.coordinates}
                        className="polygon-block"
                        style={{
                          fill: isFertilized ? '#8fc7a6' : '#fff59d',
                          stroke: isFertilized ? '#4caf50' : '#fbc02d'
                        }}
                        onMouseEnter={() => setHoveredBlock(block)}
                        onMouseLeave={() => setHoveredBlock(null)}
                      />
                      
                      {/* Render Labels */}
                      <text x={center.x} y={center.y} className="block-label" style={{ pointerEvents: 'none' }}>
                        {block.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover Tooltip (View Only Mode) */}
            {hoveredBlock && !isPanning && (
              <div 
                className="map-tooltip" 
                style={{
                  left: mousePos.clientX - 300 - 48, // approx offset
                  top: mousePos.clientY - 120, // approx offset
                  opacity: 1,
                  pointerEvents: 'none'
                }}
              >
                <div className="tooltip-row">
                  <span className="tooltip-label">Nama Blok:</span>
                  <span className="tooltip-value">{hoveredBlock.name}</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Luas Hektar:</span>
                  <span className="tooltip-value">{hoveredBlock.area_size} Ha</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Umur Tanaman:</span>
                  <span className="tooltip-value">{hoveredBlock.plant_age} Tahun</span>
                </div>
                <div className="tooltip-row" style={{ marginTop: '4px' }}>
                  <span className="tooltip-label">Status:</span>
                  <span className="status-badge" style={{
                    background: hoveredBlock.status === 'Belum Dipupuk' ? '#fff9c4' : '#e8f5e9',
                    color: hoveredBlock.status === 'Belum Dipupuk' ? '#f57f17' : '#2e7d32'
                  }}>{hoveredBlock.status}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BlokKebun;
