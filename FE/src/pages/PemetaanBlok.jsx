import React, { useState } from 'react';
import './PemetaanBlok.css';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

const PemetaanBlok = () => {
  const currentDate = dayjs().format('dddd, DD MMMM YYYY');

  // Editor States
  const [showGrid, setShowGrid] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [activeTool, setActiveTool] = useState('polygon');

  // Interaction States
  const [mousePos, setMousePos] = useState({ x: 400, y: 500, clientX: 0, clientY: 0 });
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      clientX: e.clientX,
      clientY: e.clientY
    });
  };

  // Dummy Map Data
  const staticBlocks = [
    {
      id: 'A',
      name: 'Blok A - Area Timur',
      area: '2.5 Ha',
      points: '550,150 700,200 680,350 500,400 450,250',
      center: { x: 576, y: 270 }
    },
    {
      id: 'B',
      name: 'Blok B - Area Tengah',
      area: '3.1 Ha',
      points: '300,200 420,180 480,250 450,420 350,450 250,350',
      center: { x: 375, y: 308 }
    },
    {
      id: 'C',
      name: 'Blok C - Area Barat',
      area: '1.8 Ha',
      points: '100,100 250,80 280,220 200,300 80,250',
      center: { x: 182, y: 190 }
    }
  ];

  // Active Drawing Simulation Data
  const activeDrawingPoints = '150,450 250,550 400,500';
  const lastDrawingPoint = { x: 400, y: 500 };
  const drawingNodes = [
    { x: 150, y: 450 },
    { x: 250, y: 550 },
    { x: 400, y: 500 }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Halaman Pemetaan Blok (Map Editor)</h1>
        <p className="page-subtitle">Sistem Informasi Geografis Lahan Kelapa Sawit • {currentDate}</p>
      </div>

      <div className="page-content">
        <div className="map-editor-layout">
          
          {/* Editor Sidebar */}
          <div className="editor-sidebar">
            <div className="sidebar-section">
              <h2 className="sidebar-title">Tools</h2>
              <button 
                className={`tool-button ${activeTool === 'polygon' ? 'active' : ''}`}
                onClick={() => setActiveTool('polygon')}
              >
                <span>✏️</span> Draw New Block
              </button>
              <button 
                className={`tool-button ${activeTool === 'node' ? 'active' : ''}`}
                onClick={() => setActiveTool('node')}
              >
                <span>➕</span> Add Node
              </button>
              <button 
                className={`tool-button ${activeTool === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTool('edit')}
              >
                <span>🖐️</span> Edit Boundary
              </button>
              <div style={{ height: '16px' }}></div>
              <button className="tool-button">
                <span>💾</span> Save Layout
              </button>
              <button className="tool-button danger">
                <span>🗑️</span> Clear Canvas
              </button>
            </div>

            <div className="sidebar-section">
              <h2 className="sidebar-title">Layers</h2>
              <div className="toggle-item" onClick={() => setShowGrid(!showGrid)}>
                <span className="toggle-label">Show Grid</span>
                <div className={`toggle-switch ${showGrid ? 'active' : ''}`}></div>
              </div>
              <div className="toggle-item" onClick={() => setShowNodes(!showNodes)}>
                <span className="toggle-label">Boundary Nodes</span>
                <div className={`toggle-switch ${showNodes ? 'active' : ''}`}></div>
              </div>
              <div className="toggle-item" onClick={() => setShowLabels(!showLabels)}>
                <span className="toggle-label">Block Labels</span>
                <div className={`toggle-switch ${showLabels ? 'active' : ''}`}></div>
              </div>
            </div>
          </div>

          {/* Map Canvas */}
          <div 
            className={`map-canvas-container ${showGrid ? 'show-grid' : ''}`}
            onMouseMove={handleMouseMove}
          >
            <svg className="map-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              
              {/* Render Static Blocks */}
              {staticBlocks.map((block) => (
                <g key={block.id}>
                  <polygon
                    points={block.points}
                    className="polygon-block"
                    onMouseEnter={() => setHoveredBlock(block)}
                    onMouseLeave={() => setHoveredBlock(null)}
                  />
                  
                  {/* Render Vertices for Static Blocks */}
                  {showNodes && block.points.split(' ').map((pt, i) => {
                    const [x, y] = pt.split(',');
                    return (
                      <circle 
                        key={`${block.id}-node-${i}`} 
                        cx={x} 
                        cy={y} 
                        r="5" 
                        className="vertex-node" 
                      />
                    );
                  })}

                  {/* Render Labels */}
                  {showLabels && (
                    <text x={block.center.x} y={block.center.y} className="block-label">
                      Blok {block.id}
                    </text>
                  )}
                </g>
              ))}

              {/* Render Active Drawing Simulation */}
              <polyline 
                points={activeDrawingPoints} 
                className="active-drawing-line" 
              />
              
              {/* Dynamic Line to Mouse Cursor */}
              {activeTool === 'polygon' && (
                <line 
                  x1={lastDrawingPoint.x} 
                  y1={lastDrawingPoint.y} 
                  x2={mousePos.x} 
                  y2={mousePos.y} 
                  className="active-drawing-dashed" 
                />
              )}

              {/* Active Drawing Nodes */}
              {showNodes && drawingNodes.map((pt, i) => (
                <circle 
                  key={`draw-node-${i}`} 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="5" 
                  className="drawing-node" 
                />
              ))}
              
            </svg>

            {/* Custom Hover Tooltip */}
            {hoveredBlock && (
              <div 
                className="map-tooltip" 
                style={{
                  left: mousePos.clientX - 280 - 48, // approximate offset based on sidebar & padding
                  top: mousePos.clientY - 120, // approximate offset from header
                  opacity: 1
                }}
              >
                <div className="tooltip-row">
                  <span className="tooltip-label">Nama Blok:</span>
                  <span className="tooltip-value">{hoveredBlock.name}</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Luas Hektar:</span>
                  <span className="tooltip-value">{hoveredBlock.area}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PemetaanBlok;
