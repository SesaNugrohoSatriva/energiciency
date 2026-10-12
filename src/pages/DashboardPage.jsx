import { AlertTriangle, ArrowUpRight, CheckCircle2, Factory, Gauge, Sparkles } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/layout/PageHeader';

function StatusBadge({ kind, label }) {
  return <span className={`status-badge ${kind}`}>{label}</span>;
}

export default function DashboardPage({ data }) {
  const productionTrend = data.productionData.map((item) => ({
    month: item.label,
    production: item.production,
    energy: item.energy,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard Energiciency"
        description="Ringkasan produksi, konsumsi energi, efisiensi, dan alert operasional harian."
        actions={[
          <button key="period" type="button" className="button button-secondary">6 Bulan</button>,
        ]}
      />

      <section className="stats-grid">
        {data.dashboardKpis.map((stat, index) => (
          <article key={stat.label} className="stat-card">
            <div className="stat-top">
              <span>{stat.label}</span>
              <span className={`stat-icon stat-icon-${index % 4}`}><Gauge size={18} /></span>
            </div>
            <div className="stat-value">
              {stat.value}
              {stat.unit && <small>{stat.unit}</small>}
            </div>
            <div className={`stat-note ${stat.tone}`}>
              <ArrowUpRight size={14} />
              {stat.note}
            </div>
          </article>
        ))}
      </section>

      <div className="dashboard-grid">
        <div className="main-column">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Produksi vs Konsumsi Energi</h2>
                <p>Tren keluaran dan penggunaan energi terintegrasi</p>
              </div>
            </div>
            <div className="chart-legend">
              <span><i className="legend-production" /> Output produksi</span>
              <span><i className="legend-energy" /> Konsumsi energi</span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionTrend} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfeaf0" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="production" name="Output Produksi" stroke="#1769AA" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="energy" name="Konsumsi Energi" stroke="#7dc8ea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Production Order Terbaru</h2>
                <p>Status batch produksi yang sedang berjalan</p>
              </div>
              <button type="button" className="panel-action">Lihat Semua</button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Produk</th>
                    <th>Qty</th>
                    <th>Energi</th>
                    <th>HPP/Unit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="batch">{order.id}</td>
                      <td>{order.product}</td>
                      <td>{order.quantity}</td>
                      <td>{order.energy}</td>
                      <td>{order.cost}</td>
                      <td>
                        <StatusBadge kind={order.status === 'Completed' ? 'done' : order.status === 'In Progress' ? 'process' : 'planned'} label={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Konsumsi Energi per Proses</h2>
                <p>Distribusi konsumsi pada lini produksi</p>
              </div>
            </div>
            <div className="energy-list">
              {data.energyProcessData.map((item) => (
                <div className="energy-row" key={item.name}>
                  <div className="energy-row-main">
                    <div className="energy-name">{item.name}</div>
                    <div className="energy-bar">
                      <span style={{ width: `${item.energy}%` }} />
                    </div>
                  </div>
                  <strong>{item.energy} kWh</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="side-column">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Progress Produksi</h2>
                <p>{data.productionProgress.shift} · {data.productionProgress.machine}</p>
              </div>
              <StatusBadge kind="process" label="Berjalan" />
            </div>
            <div className="progress-summary">
              <div className="progress-label">
                <strong>{data.productionProgress.actual} / {data.productionProgress.target} unit</strong>
                <span>{data.productionProgress.current}% selesai</span>
              </div>
              <div className="progress-track"><span style={{ width: `${data.productionProgress.current}%` }} /></div>
              <div className="progress-metrics">
                <div>
                  <span>OEE</span>
                  <strong>{data.productionProgress.oee}%</strong>
                </div>
                <div>
                  <span>Operator</span>
                  <strong>Tim A · 3</strong>
                </div>
                <div>
                  <span>Target selesai</span>
                  <strong>{data.productionProgress.completion}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Indikator Efisiensi</h2>
                <p>Batch aktif · {data.productionProgress.machine}</p>
              </div>
            </div>
            <div className="metric-grid">
              {[
                ['Output', '35 unit'],
                ['Energi', '61.7 kWh'],
                ['Energi/unit', '1.76 kWh'],
                ['Biaya energi', 'Rp92.5k'],
              ].map(([label, value]) => (
                <div className="metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="optimization-alert">
              <AlertTriangle size={18} />
              <div>
                <strong>Potensi optimasi terdeteksi</strong>
                <p>Energi kalibrasi dan uji beban berada 14% di atas standar. Evaluasi durasi pengujian dan siklus gerak aktuator.</p>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Aktifitas Mesin</h2>
                <p>Stok energi dan proses saat ini</p>
              </div>
            </div>
            <div className="process-list">
              {data.energyProcessData.map((item, index) => (
                <div className="process-item" key={item.name}>
                  <div className="process-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="process-copy">
                    <strong>{item.name}</strong>
                    <small>{item.utilization}% utilitas</small>
                  </div>
                  <span className="process-energy">{item.energy} kWh</span>
                </div>
              ))}
            </div>
          </section>

          <div className="footer-note">
            <Factory size={15} /> Data demo · belum terhubung ke perangkat IoT atau backend
          </div>
        </div>
      </div>
    </>
  );
}
