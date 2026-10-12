import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/layout/PageHeader';

export default function ReportsPage({ data }) {
  const [range, setRange] = useState('6M');
  const chartData = useMemo(() => {
    const visible = range === '6M' ? data.reportsTrend : data.productionData.map((item) => ({ label: item.label, output: item.production, energy: item.energy, efficiency: item.efficiency }));
    return visible;
  }, [data.productionData, data.reportsTrend, range]);

  const exportCsv = () => {
    const rows = [
      ['Month', 'Output', 'Energy', 'Efficiency'],
      ...chartData.map((item) => [item.label || item.month, item.output || item.production, item.energy, item.efficiency || item.energy]),
    ];

    const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'energiciency-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Laporan"
        description="Ringkasan performa produksi, energi, dan kualitas dengan model data demo."
        actions={[
          <button key="export" type="button" className="button button-primary" onClick={exportCsv}><Download size={16} /> Export CSV</button>,
        ]}
      />

      <section className="stats-grid">
        {[
          { label: 'Production Output', value: '486', unit: 'unit', note: 'Total output', tone: 'positive' },
          { label: 'Energy Usage', value: '1.284', unit: 'kWh', note: 'Total konsumsi', tone: 'neutral' },
          { label: 'Cost Report', value: 'Rp4.8 jt', note: 'Biaya total', tone: 'neutral' },
          { label: 'Quality Pass', value: '92.4%', note: 'Persentase lolos', tone: 'positive' },
        ].map((card, index) => (
          <article key={card.label} className="stat-card">
            <div className="stat-top"><span>{card.label}</span><span className={`stat-icon stat-icon-${index % 4}`}><FileText size={18} /></span></div>
            <div className="stat-value">{card.value}{card.unit && <small>{card.unit}</small>}</div>
            <div className={`stat-note ${card.tone}`}>{card.note}</div>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Performance Overview</h2>
            <p>Produksi, energi, dan efisiensi tren</p>
          </div>
          <div className="segment-control">
            {['6M', '12M'].map((item) => (
              <button key={item} type="button" className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfeaf0" />
              <XAxis dataKey="label" tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="output" name="Output" stroke="#1769AA" strokeWidth={3} />
              <Line type="monotone" dataKey="energy" name="Energy" stroke="#7dc8ea" strokeWidth={2} />
              <Line type="monotone" dataKey="efficiency" name="Efficiency" stroke="#34b27e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
