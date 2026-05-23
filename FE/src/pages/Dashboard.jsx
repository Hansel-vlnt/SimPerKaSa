import React, { useState, useEffect } from 'react';
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
import './Dashboard.css';

// Set locale to Indonesian
dayjs.locale('id');

const API_BASE = 'http://localhost:8000/api';

const Dashboard = () => {
  const currentDate = dayjs().format('dddd, DD MMMM YYYY');
  
  const [tbsPrices, setTbsPrices] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [priceRes, newsRes] = await Promise.all([
          axios.get(`${API_BASE}/tbs_prices`),
          axios.get(`${API_BASE}/news`)
        ]);
        setTbsPrices(priceRes.data);
        setNews(newsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchData();
  }, []);

  // Format data for chart
  const dataHargaTBS = tbsPrices.map(p => ({
    tanggal: dayjs(p.date).format('DD MMM'),
    harga: p.price
  }));

  const latestPrice = tbsPrices.length > 0 ? tbsPrices[tbsPrices.length - 1] : null;
  const previousPrice = tbsPrices.length > 1 ? tbsPrices[tbsPrices.length - 2] : null;

  let priceTrend = '-';
  let priceTrendColor = '#999';
  if (latestPrice && previousPrice) {
    const diff = latestPrice.price - previousPrice.price;
    if (diff > 0) {
      priceTrend = `⬆ Rp ${diff} dari kemarin`;
      priceTrendColor = '#4caf50';
    } else if (diff < 0) {
      priceTrend = `⬇ Rp ${Math.abs(diff)} dari kemarin`;
      priceTrendColor = '#f44336';
    } else {
      priceTrend = `Stabil`;
      priceTrendColor = '#ff9800';
    }
  }

  const latestNews = news.length > 0 ? news[0] : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Eksekutif</h1>
        <p className="dashboard-subtitle">
          <span className="company-name">PT. Palma Nusantara</span> • {currentDate}
        </p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-cards-top">
          {/* Card 1: Harga TBS Hari Ini */}
          <div className="dashboard-card">
            <h2 className="card-title">💰 Harga TBS Hari Ini</h2>
            <div className="card-content">
              <h3 className="price-value">
                {latestPrice ? `Rp ${latestPrice.price.toLocaleString('id-ID')}` : '-'} <span className="price-unit">/ kg</span>
              </h3>
              <div>
                <span className="price-trend" style={{ color: priceTrendColor, background: `${priceTrendColor}1a` }}>
                  {priceTrend}
                </span>
              </div>
            </div>
            <div className="card-footer">
              🕒 Terakhir diperbarui: {latestPrice ? dayjs(latestPrice.date).format('DD MMM YYYY') : '-'}
            </div>
          </div>

          {/* Card 2: Berita Terkini */}
          <div className="dashboard-card">
            <h2 className="card-title">📰 Berita Terkini</h2>
            <div className="card-content">
              <h3 className="news-headline" style={{ color: latestNews ? '#333' : '#999' }}>
                {latestNews ? latestNews.headline : '-'}
              </h3>
              <p className="news-summary" style={{ color: latestNews ? '#666' : '#999' }}>
                {latestNews ? latestNews.summary : 'Tidak ada berita terbaru.'}
              </p>
            </div>
            <div className="card-footer">
              🕒 Terakhir diperbarui: {latestNews ? dayjs(latestNews.date).format('DD MMM YYYY') : '-'}
            </div>
          </div>
        </div>

        <div className="dashboard-cards-bottom">
          {/* Card 3: Grafik Riwayat Harga TBS */}
          <div className="dashboard-card">
            <h2 className="card-title">📈 Riwayat Harga TBS (Bulan Ini)</h2>
            <div className="card-content">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dataHargaTBS}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorHarga" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a4d33" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1a4d33" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis 
                      dataKey="tanggal" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 12 }}
                      domain={['dataMin - 100', 'dataMax + 100']}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Harga TBS']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="harga" 
                      stroke="#1a4d33" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorHarga)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
