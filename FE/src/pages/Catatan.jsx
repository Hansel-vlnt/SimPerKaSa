import React from 'react';

const Catatan = () => {
  return (
    <div>
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid #e0e0e0', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Catatan</h1>
      </div>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888'
      }}>
        <p>Konten Catatan masih kosong.</p>
      </div>
    </div>
  );
};

export default Catatan;
