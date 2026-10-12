import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldCheck, Search } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';

function StatusBadge({ status }) {
  const kind = status === 'Passed' ? 'done' : status === 'Failed' ? 'alert' : 'process';
  return <span className={`status-badge ${kind}`}>{status}</span>;
}

export default function QualityControlPage({ data }) {
  const [quality, setQuality] = useState(data.quality);
  const [statusFilter, setStatusFilter] = useState('All');
  const [orderFilter, setOrderFilter] = useState('All');
  const [selected, setSelected] = useState(data.quality[0]);
  const [form, setForm] = useState({ product: '', status: 'Passed', defects: '' });

  const filteredQuality = useMemo(() => {
    return quality.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesOrder = orderFilter === 'All' || item.orderId === orderFilter;
      return matchesStatus && matchesOrder;
    });
  }, [orderFilter, quality, statusFilter]);

  const totalInspections = quality.length;
  const passed = quality.filter((item) => item.status === 'Passed').length;
  const failed = quality.filter((item) => item.status === 'Failed').length;
  const defectRate = ((failed / Math.max(1, totalInspections)) * 100).toFixed(1);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextRecord = {
      id: `QC-${String(110 + quality.length).padStart(3, '0')}`,
      orderId: `PO-${String(2605 + quality.length).padStart(4, '0')}`,
      product: form.product || 'Robot Arm R-06',
      inspector: 'Operator QA',
      status: form.status,
      defects: Number(form.defects || 0),
      defectRate: Number(((Number(form.defects || 0) / 45) * 100).toFixed(1)),
      passed: form.status === 'Passed',
      date: new Date().toISOString().slice(0, 10),
    };

    setQuality((current) => [nextRecord, ...current]);
    setSelected(nextRecord);
    setForm({ product: '', status: 'Passed', defects: '' });
  };

  return (
    <>
      <PageHeader title="Quality Control" description="Pantau inspeksi kualitas, defect rate, dan status produk akhir." />

      <section className="stats-grid">
        {[
          { label: 'Total Inspections', value: totalInspections, note: 'Total inspeksi QA', tone: 'neutral' },
          { label: 'Passed', value: passed, note: 'Produk lolos', tone: 'positive' },
          { label: 'Failed', value: failed, note: 'Inspeksi gagal', tone: 'negative' },
          { label: 'Defect Rate', value: `${defectRate}%`, note: 'Persentase cacat', tone: 'neutral' },
        ].map((card, index) => (
          <article key={card.label} className="stat-card">
            <div className="stat-top"><span>{card.label}</span><span className={`stat-icon stat-icon-${index % 4}`}><ShieldCheck size={18} /></span></div>
            <div className="stat-value">{card.value}</div>
            <div className={`stat-note ${card.tone}`}>{card.note}</div>
          </article>
        ))}
      </section>

      <div className="two-column-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Inspection Records</h2>
              <p>Filter berdasarkan status dan order</p>
            </div>
          </div>
          <div className="filter-row">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter status">
              <option value="All">Semua Status</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Needs Review">Needs Review</option>
            </select>
            <select value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)} aria-label="Filter order">
              <option value="All">Semua Order</option>
              {Array.from(new Set(quality.map((item) => item.orderId))).map((orderId) => (
                <option key={orderId} value={orderId}>{orderId}</option>
              ))}
            </select>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Inspection</th>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Defects</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuality.map((item) => (
                  <tr key={item.id} className={selected?.id === item.id ? 'selected-row' : ''} onClick={() => setSelected(item)}>
                    <td>{item.id}</td>
                    <td>{item.orderId}</td>
                    <td>{item.product}</td>
                    <td>{item.defects}</td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-header">
            <div>
              <h2>Inspection Detail</h2>
              <p>{selected?.id}</p>
            </div>
          </div>
          {selected && (
            <div className="detail-card">
              <h3>{selected.product}</h3>
              <div className="detail-grid">
                <div><span>Order</span><strong>{selected.orderId}</strong></div>
                <div><span>Inspector</span><strong>{selected.inspector}</strong></div>
                <div><span>Defect Rate</span><strong>{selected.defectRate}%</strong></div>
                <div><span>Defects</span><strong>{selected.defects} pcs</strong></div>
              </div>
            </div>
          )}

          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Tambah Inspeksi</h3>
            <label>
              <span>Produk</span>
              <input value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })} placeholder="Robot Arm R-06" />
            </label>
            <div className="half-grid">
              <label>
                <span>Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Needs Review">Needs Review</option>
                </select>
              </label>
              <label>
                <span>Cacat</span>
                <input type="number" min="0" value={form.defects} onChange={(event) => setForm({ ...form, defects: event.target.value })} />
              </label>
            </div>
            <button type="submit" className="button button-primary full-width">Simpan Inspeksi</button>
          </form>
        </aside>
      </div>
    </>
  );
}
