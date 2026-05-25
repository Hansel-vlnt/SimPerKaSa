import React, { useState, useEffect } from 'react';
import './Catatan.css';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

dayjs.locale('id');

const API_BASE = 'http://localhost:8000/api';

const Catatan = () => {
  const currentDate = dayjs().format('dddd, DD MMMM YYYY');

  const [finances, setFinances] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState('Semua Blok');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finRes, harvRes, invRes] = await Promise.all([
          axios.get(`${API_BASE}/finances`),
          axios.get(`${API_BASE}/harvests`),
          axios.get(`${API_BASE}/inventory`)
        ]);
        setFinances(finRes.data);
        setHarvests(harvRes.data);
        setInventory(invRes.data);
      } catch (err) {
        console.error("Failed to fetch data for Catatan", err);
      }
    };
    fetchData();
  }, []);

  const todayStr = dayjs().format('YYYY-MM-DD');

  const todayExpensesList = finances.filter(f => f.type === 'expense' && f.date === todayStr);
  const totalExpenseToday = todayExpensesList.reduce((sum, f) => sum + f.amount, 0);

  const monthFinances = finances.filter(f => f.date && f.date.startsWith(selectedMonth));
  const monthHarvests = harvests.filter(h => h.date && h.date.startsWith(selectedMonth));

  const totalExpenseOverall = monthFinances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const manualIncome = monthFinances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const harvestIncome = monthHarvests.reduce((sum, h) => sum + (h.estimated_income || 0), 0);
  
  const totalIncome = manualIncome + harvestIncome;

  const totalTonnage = monthHarvests.reduce((sum, h) => sum + (h.tonnage || 0), 0);

  // Map inventory to display formats
  const mappedInventory = inventory.map(item => {
    // Fake percentage calculation just for visual progress bar
    let percent = (item.current_stock / 100) * 100;
    if (percent > 100) percent = 100;
    let status = 'safe';
    if (percent < 20) status = 'danger';
    else if (percent < 50) status = 'warning';

    return {
      id: item.id,
      name: item.item_name,
      quantity: `${item.current_stock} ${item.unit}`,
      percent,
      status
    };
  });

  // Calculate Graph Data for this month
  const filteredHarvests = selectedBlock === 'Semua Blok' 
    ? monthHarvests 
    : monthHarvests.filter(h => h.block_name === selectedBlock);

  // Group by Date for the chart
  const graphDataMap = {};
  filteredHarvests.forEach(h => {
    if (!h.date) return;
    if (!graphDataMap[h.date]) {
      graphDataMap[h.date] = { date: h.date, displayDate: dayjs(h.date).format('DD MMM'), income: 0, tonnage: 0 };
    }
    graphDataMap[h.date].income += h.estimated_income || 0;
    graphDataMap[h.date].tonnage += h.tonnage || 0;
  });

  const graphData = Object.values(graphDataMap).sort((a, b) => a.date.localeCompare(b.date));
  const uniqueBlocks = ['Semua Blok', ...new Set(harvests.map(h => h.block_name))];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Catatan & Keuangan</h1>
          <p className="page-subtitle">
            <span className="company-name">PT. Palma Nusantara</span> • Ringkasan operasional dan finansial • {currentDate}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <label style={{ fontWeight: 'bold', color: '#1a4d33', margin: 0 }}>Filter Bulan:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              border: '1px solid #ccc',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      <div className="page-content">
        <div className="records-grid-top">
          {/* Card 1: Pengeluaran Hari Ini */}
          <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="card-title"> Pengeluaran Hari Ini</h2>
            <div className="card-content" style={{ flex: 'none', marginBottom: '16px' }}>
              <h3 className="expense-value">Rp {totalExpenseToday.toLocaleString('id-ID')}</h3>
              <div>
                <span className="badge" style={{ background: '#ffebee', color: '#c62828' }}>Total Harian</span>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '150px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
              {todayExpensesList.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {todayExpensesList.map(exp => (
                    <li key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                      <span style={{ color: '#555', fontWeight: '500' }}>{exp.description || 'Tanpa keterangan'}</span>
                      <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Rp {exp.amount.toLocaleString('id-ID')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', margin: '20px 0' }}>Belum ada pengeluaran hari ini.</p>
              )}
            </div>
          </div>

          {/* Card 1.5: Total Pengeluaran */}
          <div className="dashboard-card">
            <h2 className="card-title"> Total Pengeluaran ({dayjs(selectedMonth).format('MMMM YYYY')})</h2>
            <div className="card-content">
              <h3 className="expense-value" style={{ color: '#c62828' }}>Rp {totalExpenseOverall.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          {/* Card 2: Total Pendapatan */}
          <div className="dashboard-card">
            <h2 className="card-title"> Total Pendapatan ({dayjs(selectedMonth).format('MMMM YYYY')})</h2>
            <div className="card-content">
              <h3 className="income-value">Rp {totalIncome.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          {/* Card 3: Total Tonase Panen */}
          <div className="dashboard-card">
            <h2 className="card-title"> Total Tonase Panen ({dayjs(selectedMonth).format('MMMM YYYY')})</h2>
            <div className="card-content">
              <h3 className="tonnage-value">{totalTonnage.toFixed(2)} Ton</h3>
            </div>
          </div>
        </div>

        <div className="records-grid-bottom">
          {/* Section: Grafik Pendapatan Panen */}
          <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 className="card-title" style={{ margin: 0 }}> Grafik Pendapatan Panen ({dayjs(selectedMonth).format('MMMM YYYY')})</h2>
              <select 
                className="form-control" 
                style={{ width: 'auto', padding: '6px 12px' }}
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
              >
                {uniqueBlocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <div style={{ height: '300px', width: '100%' }}>
              {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a4d33" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1a4d33" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="displayDate" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis 
                      tickFormatter={(value) => {
                        const num = Number(value);
                        return isNaN(num) ? value : `Rp ${(num / 1000000).toFixed(0)}M`;
                      }} 
                      tick={{ fill: '#888', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={(value) => {
                        const num = Number(value);
                        return [isNaN(num) ? value : `Rp ${num.toLocaleString('id-ID')}`, 'Pendapatan'];
                      }}
                      labelStyle={{ color: '#333', fontWeight: 'bold', marginBottom: '4px' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#1a4d33" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  Tidak ada data panen untuk bulan ini.
                </div>
              )}
            </div>
          </div>

          {/* Section: Pendapatan Panen Tabel */}
          <div className="dashboard-card">
            <h2 className="card-title"> Riwayat Pendapatan Panen</h2>
            <div className="table-container">
              <table className="harvest-table">
                <thead>
                  <tr>
                    <th>Nama Blok</th>
                    <th>Tanggal Panen</th>
                    <th>Tonase (Ton)</th>
                    <th>Estimasi Pendapatan (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {harvests.map((row) => (
                    <tr key={row.id}>
                      <td>{row.block_name}</td>
                      <td>{row.date}</td>
                      <td>
                        <strong>{row.tonnage}</strong>
                      </td>
                      <td>
                        <strong>Rp {row.estimated_income.toLocaleString('id-ID')}</strong>
                      </td>
                    </tr>
                  ))}
                  {harvests.length === 0 && (
                    <tr><td colSpan="4" style={{textAlign: 'center'}}>Belum ada data panen</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Stok Gudang */}
          <div className="dashboard-card">
            <h2 className="card-title"> Stok Gudang</h2>
            <div className="inventory-list">
              {mappedInventory.map((item) => (
                <div key={item.id} className="inventory-item">
                  <div className="inventory-header">
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar-fill fill-${item.status}`} 
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {mappedInventory.length === 0 && (
                <p style={{textAlign: 'center', color: '#888'}}>Belum ada data stok</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catatan;
