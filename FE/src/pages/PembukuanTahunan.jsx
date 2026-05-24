import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './PembukuanTahunan.css';

dayjs.locale('id');

const API_BASE = 'http://localhost:8000/api';

const monthsList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const PembukuanTahunan = () => {
  const [finances, setFinances] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [selectedYear, setSelectedYear] = useState(dayjs().format('YYYY'));
  
  // Available years based on data, defaulting to current year
  const [availableYears, setAvailableYears] = useState([dayjs().format('YYYY')]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finRes, harvRes] = await Promise.all([
          axios.get(`${API_BASE}/finances`),
          axios.get(`${API_BASE}/harvests`)
        ]);
        setFinances(finRes.data);
        setHarvests(harvRes.data);

        // Extract unique years from data
        const years = new Set([dayjs().format('YYYY')]);
        finRes.data.forEach(f => { if(f.date) years.add(f.date.substring(0,4)) });
        harvRes.data.forEach(h => { if(h.date) years.add(h.date.substring(0,4)) });
        
        setAvailableYears(Array.from(years).sort((a,b) => b.localeCompare(a)));
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  // Process data for the selected year
  const generateYearlyData = () => {
    // Initialize 12 months data
    const monthlyData = monthsList.map((month, index) => ({
      monthName: month,
      monthNum: String(index + 1).padStart(2, '0'),
      income: 0,
      expense: 0,
      netProfit: 0,
      tonnage: 0
    }));

    // Filter and aggregate finances
    finances.forEach(f => {
      if (!f.date || typeof f.date !== 'string' || !f.date.startsWith(selectedYear)) return;
      const monthIndex = parseInt(f.date.substring(5, 7), 10) - 1;
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return;
      
      if (f.type === 'income') {
        monthlyData[monthIndex].income += (f.amount || 0);
      } else if (f.type === 'expense') {
        monthlyData[monthIndex].expense += (f.amount || 0);
      }
    });

    // Filter and aggregate harvests
    harvests.forEach(h => {
      if (!h.date || typeof h.date !== 'string' || !h.date.startsWith(selectedYear)) return;
      const monthIndex = parseInt(h.date.substring(5, 7), 10) - 1;
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return;
      
      monthlyData[monthIndex].income += (h.estimated_income || 0);
      monthlyData[monthIndex].tonnage += (h.tonnage || 0);
    });

    // Calculate Net Profit
    monthlyData.forEach(d => {
      d.netProfit = d.income - d.expense;
    });

    return monthlyData;
  };

  const yearlyData = generateYearlyData();

  // Summary logic
  const totalYearIncome = yearlyData.reduce((sum, d) => sum + d.income, 0);
  const totalYearExpense = yearlyData.reduce((sum, d) => sum + d.expense, 0);
  const totalYearProfit = totalYearIncome - totalYearExpense;
  const totalYearTonnage = yearlyData.reduce((sum, d) => sum + d.tonnage, 0);

  const exportToCSV = () => {
    // Define CSV Headers
    const headers = ['Bulan', 'Tonase Panen (Ton)', 'Pendapatan (Rp)', 'Pengeluaran (Rp)', 'Laba Bersih (Rp)'];
    
    // Map data to CSV rows
    const rows = yearlyData.map(d => [
      d.monthName,
      d.tonnage.toFixed(2),
      d.income,
      d.expense,
      d.netProfit
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Tahunan_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentDate = dayjs().format('dddd, DD MMMM YYYY');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Buku Tahunan</h1>
        <p className="page-subtitle">
          <span className="company-name">PT. Palma Nusantara</span> • Laporan Keuangan 12 Bulan • {currentDate}
        </p>
      </div>

      <div className="page-content">
        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
          <button 
            onClick={exportToCSV}
            style={{
              padding: '8px 16px', 
              background: '#1a4d33', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
             Download CSV
          </button>
          <div className="year-selector">
            <label>Pilih Tahun: </label>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
              className="form-control"
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="records-grid-top">
          <div className="dashboard-card">
            <h2 className="card-title"> Total Pendapatan ({selectedYear})</h2>
            <div className="card-content">
              <h3 className="income-value">Rp {totalYearIncome.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          <div className="dashboard-card">
            <h2 className="card-title"> Total Pengeluaran ({selectedYear})</h2>
            <div className="card-content">
              <h3 className="expense-value" style={{ color: '#c62828' }}>Rp {totalYearExpense.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          <div className="dashboard-card">
            <h2 className="card-title"> Laba Bersih ({selectedYear})</h2>
            <div className="card-content">
              <h3 style={{ color: totalYearProfit >= 0 ? '#1a4d33' : '#c62828', fontSize: '1.8rem', margin: 0 }}>
                Rp {totalYearProfit.toLocaleString('id-ID')}
              </h3>
            </div>
          </div>
          <div className="dashboard-card">
            <h2 className="card-title"> Total Tonase ({selectedYear})</h2>
            <div className="card-content">
              <h3 className="tonnage-value">{totalYearTonnage.toFixed(2)} Ton</h3>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="dashboard-card" style={{ marginTop: '20px' }}>
          <h2 className="card-title"> Grafik Perbandingan Pendapatan vs Pengeluaran</h2>
          <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthName" tick={{fontSize: 12}} />
                <YAxis 
                  tickFormatter={(val) => {
                    const num = Number(val);
                    return isNaN(num) ? val : `Rp ${(num/1000000).toFixed(0)}M`;
                  }} 
                  tick={{fontSize: 12}}
                />
                <Tooltip 
                  formatter={(value) => {
                    const num = Number(value);
                    return [isNaN(num) ? value : `Rp ${num.toLocaleString('id-ID')}`];
                  }}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="income" name="Pendapatan" fill="#4caf50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#ef5350" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Section */}
        <div className="dashboard-card" style={{ marginTop: '20px' }}>
          <h2 className="card-title"> Rincian 12 Bulan</h2>
          <div className="table-container">
            <table className="harvest-table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Tonase Panen</th>
                  <th>Pendapatan</th>
                  <th>Pengeluaran</th>
                  <th>Laba Bersih</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((data, idx) => (
                  <tr key={idx}>
                    <td><strong>{data.monthName}</strong></td>
                    <td>{data.tonnage > 0 ? `${data.tonnage.toFixed(2)} Ton` : '-'}</td>
                    <td style={{color: '#2e7d32'}}>Rp {data.income.toLocaleString('id-ID')}</td>
                    <td style={{color: '#c62828'}}>Rp {data.expense.toLocaleString('id-ID')}</td>
                    <td>
                      <strong style={{color: data.netProfit >= 0 ? '#1a4d33' : '#c62828'}}>
                        Rp {data.netProfit.toLocaleString('id-ID')}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PembukuanTahunan;
