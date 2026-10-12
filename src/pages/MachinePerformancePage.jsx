import { useMemo, useState } from 'react';
import { BarChart3, Gauge, Search, TriangleAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { formatPercent } from '../utils/oeeCalculator';

const tabs = ['Machine', 'Process', 'Product'];

export default function MachinePerformancePage({ data }) {
  const [tab, setTab] = useState('Machine');
  const [machineFilter, setMachineFilter] = useState('All');
  const [processFilter, setProcessFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');

  const machineRows = useMemo(() => {
    return data.machinePerformance.filter((item) => {
      const matchesMachine = machineFilter === 'All' || item.machineId === machineFilter;
      const matchesProcess = processFilter === 'All' || item.processIds.includes(processFilter);
      return matchesMachine && matchesProcess;
    });
  }, [data.machinePerformance, machineFilter, processFilter]);

  const processRows = useMemo(() => data.processPerformance.filter((item) => productFilter === 'All' || item.processName.includes('')),
    [data.processPerformance, productFilter]);

  const productRows = useMemo(() => data.productPerformance.filter((item) => productFilter === 'All' || item.productId === productFilter), [data.productPerformance, productFilter]);

  const chartSource = useMemo(() => {
    const base = tab === 'Machine' ? machineRows : tab === 'Process' ? data.processPerformance : data.productPerformance;
    return base.map((item) => ({
      name: tab === 'Machine' ? item.machineName : tab === 'Process' ? item.processName : item.productName,
      oee: item.latestOee || item.oee || 0,
      availability: item.availability || 0,
      performance: item.performance || 0,
      quality: item.quality || 0,
    }));
  }, [data.processPerformance, data.productPerformance, machineRows, tab]);

  const summary = [
    { label: 'Average OEE', value: formatPercent((machineRows.reduce((sum, item) => sum + (item.averageOee || 0), 0) / Math.max(1, machineRows.length)) || 0), tone: 'positive' },
    { label: 'Below target', value: String(machineRows.filter((item) => (item.latestOee || 0) < data.oeeTarget).length), tone: 'negative' },
    { label: 'Normal', value: String(machineRows.filter((item) => (item.latestOee || 0) >= data.oeeTarget).length), tone: 'neutral' },
    { label: 'Investigate', value: String(machineRows.filter((item) => (item.latestOee || 0) < 0.6).length), tone: 'neutral' },
  ];

  return (
    <>
      <PageHeader title="Performa Mesin" description="Analisis OEE menurut mesin, proses, dan produk dengan target operasional yang dapat dikonfigurasi." />

      <section className="stats-grid">
        {summary.map((card, index) => (
          <article key={card.label} className="stat-card">
            <div className="stat-top"><span>{card.label}</span><span className={`stat-icon stat-icon-${index % 4}`}><Gauge size={18} /></span></div>
            <div className="stat-value">{card.value}</div>
            <div className={`stat-note ${card.tone}`}>{card.label === 'Average OEE' ? 'Seluruh mesin eligible' : 'Periode aktif'}</div>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Analisis OEE</h2>
            <p>Target: {formatPercent(data.oeeTarget)} · Average historical: {formatPercent(data.historicalAverageOee)}</p>
          </div>
          <div className="segment-control">
            {tabs.map((item) => (
              <button key={item} type="button" className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <select value={machineFilter} onChange={(event) => setMachineFilter(event.target.value)}>
            <option value="All">Semua Mesin</option>
            {data.machinePerformance.map((item) => <option key={item.machineId} value={item.machineId}>{item.machineName}</option>)}
          </select>
          <select value={processFilter} onChange={(event) => setProcessFilter(event.target.value)}>
            <option value="All">Semua Proses</option>
            {data.processes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={productFilter} onChange={(event) => setProductFilter(event.target.value)}>
            <option value="All">Semua Produk</option>
            {data.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartSource} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfeaf0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7c86', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7c86', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 1]} />
              <Tooltip formatter={(value) => formatPercent(value)} />
              <Legend />
              <Line type="monotone" dataKey="oee" name="OEE" stroke="#1769AA" strokeWidth={3} />
              <Line type="monotone" dataKey="availability" name="Availability" stroke="#7dc8ea" strokeWidth={2} />
              <Line type="monotone" dataKey="performance" name="Performance" stroke="#3cb6a4" strokeWidth={2} />
              <Line type="monotone" dataKey="quality" name="Quality" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="two-column-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{tab} Comparison</h2>
              <p>OEE target and historical average benchmark</p>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{tab === 'Machine' ? 'Machine' : tab === 'Process' ? 'Process' : 'Product'}</th>
                  <th>OEE</th>
                  <th>Availability</th>
                  <th>Performance</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'Machine' ? machineRows : tab === 'Process' ? data.processPerformance : data.productPerformance).map((item) => {
                  const label = tab === 'Machine' ? item.machineName : tab === 'Process' ? item.processName : item.productName;
                  const oee = item.latestOee || item.oee || 0;
                  const availability = item.availability || item.averageOee || 0;
                  const performance = item.performance || item.oee || 0;
                  const quality = item.quality || 0.96;

                  return (
                    <tr key={tab === 'Machine' ? item.machineId : tab === 'Process' ? item.processId : item.productId}>
                      <td>
                        {tab === 'Machine' ? (
                          <Link to={`/machines/${item.machineId}`}>{label}</Link>
                        ) : (
                          label
                        )}
                      </td>
                      <td>{formatPercent(oee)}</td>
                      <td>{formatPercent(availability)}</td>
                      <td>{formatPercent(performance)}</td>
                      <td>{formatPercent(quality)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recommendation Engine</h2>
              <p>Transparent rule-based maintenance suggestions</p>
            </div>
          </div>
          <div className="energy-list">
            {data.maintenanceLogs.map((log) => (
              <div key={`${log.machineId}-${log.date}`} className="energy-row">
                <div className="energy-row-main">
                  <div className="energy-name">{log.machineId} · {log.issue}</div>
                  <div className="energy-bar"><span style={{ width: log.priority === 'High' ? '80%' : log.priority === 'Medium' ? '55%' : '35%', background: log.priority === 'High' ? '#d14d4d' : log.priority === 'Medium' ? '#f59e0b' : '#1769AA' }} /></div>
                </div>
                <strong>{log.status}</strong>
              </div>
            ))}
          </div>
          <div className="optimization-alert">
            <TriangleAlert size={18} />
            <div>
              <strong>Recommendation rules</strong>
              <p>Below target plus downtime, repeated breakdowns, and declining trend trigger higher maintenance priority. This is a demo recommendation engine and not a predictive maintenance claim.</p>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
