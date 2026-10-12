import { useMemo, useState } from 'react';
import { BarChart3, Gauge, LineChart as LineChartIcon, Zap } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';
import PageHeader from '../components/layout/PageHeader';

export default function EnergyMonitoringPage({ data }) {
  const [range, setRange] = useState('7 days');
  const trend = useMemo(() => {
    const source = data.energyData.slice(-7);
    return source.map((item) => ({
      label: item.label,
      kwh: item.kwh,
      target: item.target,
      peak: item.peak,
    }));
  }, [data.energyData]);

  const totalEnergy = trend.reduce((sum, item) => sum + item.kwh, 0);
  const average = Math.round(totalEnergy / trend.length);
  const peak = Math.max(...trend.map((item) => item.peak));
  const costEstimate = totalEnergy * 1640;

  return (
    <>
      <PageHeader
        title="Monitoring Energi"
        description="Pantau konsumsi energi, target, dan puncak beban pada lini produksi."
        actions={[
          <div key="range" className="segment-control">
            {['7 days', '30 days', '90 days'].map((item) => (
              <button key={item} type="button" className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{item}</button>
            ))}
          </div>,
        ]}
      />

      <section className="stats-grid">
        {[
          { label: 'Total Energy', value: `${totalEnergy.toLocaleString('id-ID')}`, unit: 'kWh', note: 'Selama periode aktif', tone: 'neutral' },
          { label: 'Average', value: `${average.toLocaleString('id-ID')}`, unit: 'kWh', note: 'Rata-rata harian', tone: 'positive' },
          { label: 'Peak Load', value: `${peak.toLocaleString('id-ID')}`, unit: 'kWh', note: 'Beban maksimum terdeteksi', tone: 'negative' },
          { label: 'Cost Estimate', value: `Rp${(costEstimate / 1000000).toFixed(2)} jt`, note: 'Berdasarkan tarif demo', tone: 'neutral' },
        ].map((card, index) => (
          <article key={card.label} className="stat-card">
            <div className="stat-top"><span>{card.label}</span><span className={`stat-icon stat-icon-${index % 4}`}><Zap size={18} /></span></div>
            <div className="stat-value">{card.value}{card.unit && <small>{card.unit}</small>}</div>
            <div className={`stat-note ${card.tone}`}>{card.note}</div>
          </article>
        ))}
      </section>

      <div className="two-column-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Energy Consumption Trend</h2>
              <p>Target vs konsumsi aktual pada lini</p>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 12, left: -6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfeaf0" />
                <XAxis dataKey="label" tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="target" name="Target" stroke="#a0aec0" strokeWidth={2} strokeDasharray="6 4" />
                <Line type="monotone" dataKey="kwh" name="Actual" stroke="#1769AA" strokeWidth={3} />
                <Line type="monotone" dataKey="peak" name="Peak" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Machine Energy Status</h2>
              <p>Utilitas energi per mesin</p>
            </div>
          </div>
          <div className="energy-list">
            {data.energyProcessData.map((item) => (
              <div className="energy-row" key={item.name}>
                <div className="energy-row-main">
                  <div className="energy-name">{item.name}</div>
                  <div className="energy-bar">
                    <span style={{ width: `${item.utilization}%`, background: item.utilization > 88 ? '#f59e0b' : '#53b7a4' }} />
                  </div>
                </div>
                <strong>{item.utilization}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Energy by Process</h2>
            <p>Perbandingan energi aktual vs target</p>
          </div>
        </div>
        <div className="chart-wrap small-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.energyProcessData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfeaf0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="energy" name="Actual" fill="#1769AA" radius={[6, 6, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#9bd8ce" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
