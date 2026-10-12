import { useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Wallet } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/layout/PageHeader';

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

export default function CostingPage({ data }) {
  const [selectedOrder, setSelectedOrder] = useState(data.orders[0]?.id || '');

  const selected = useMemo(() => data.orders.find((order) => order.id === selectedOrder) || data.orders[0], [data.orders, selectedOrder]);

  const totalCost = data.costing.reduce((sum, item) => sum + item.total, 0);
  const materialCost = data.costing.reduce((sum, item) => sum + item.material, 0);
  const laborCost = data.costing.reduce((sum, item) => sum + item.labor, 0);
  const energyCost = data.costing.reduce((sum, item) => sum + item.energy, 0);
  const overheadCost = data.costing.reduce((sum, item) => sum + item.overhead, 0);
  const costPerUnit = totalCost / Math.max(1, data.orders.reduce((sum, order) => sum + order.quantity, 0));

  return (
    <>
      <PageHeader
        title="Costing Produksi"
        description="Analisis total biaya produksi, energi, bahan baku, tenaga kerja, dan overhead."
      />

      <section className="stats-grid">
        {[
          { label: 'Total Production Cost', value: currency.format(totalCost), note: 'Total biaya 6 bulan', tone: 'positive' },
          { label: 'Material Cost', value: currency.format(materialCost), note: 'Bahan baku', tone: 'neutral' },
          { label: 'Labor Cost', value: currency.format(laborCost), note: 'Biaya tenaga kerja', tone: 'neutral' },
          { label: 'Energy Cost', value: currency.format(energyCost), note: 'Biaya energi', tone: 'positive' },
        ].map((card, index) => (
          <article key={card.label} className="stat-card">
            <div className="stat-top"><span>{card.label}</span><span className={`stat-icon stat-icon-${index % 4}`}><Wallet size={18} /></span></div>
            <div className="stat-value" style={{ fontSize: '20px' }}>{card.value}</div>
            <div className={`stat-note ${card.tone}`}><ArrowUpRight size={14} />{card.note}</div>
          </article>
        ))}
      </section>

      <div className="two-column-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Production Cost Trend</h2>
              <p>Material, labor, energy, dan overhead</p>
            </div>
            <select value={selectedOrder} onChange={(event) => setSelectedOrder(event.target.value)} aria-label="Order selector">
              {data.orders.map((order) => (
                <option key={order.id} value={order.id}>{order.id}</option>
              ))}
            </select>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.costing} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfeaf0" />
                <XAxis dataKey="month" tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7c86', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [currency.format(value), 'Biaya']} />
                <Line type="monotone" dataKey="material" name="Material" stroke="#1769AA" strokeWidth={2.5} />
                <Line type="monotone" dataKey="energy" name="Energy" stroke="#7dc8ea" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Cost Breakdown</h2>
              <p>{selected?.product || 'Order terpilih'}</p>
            </div>
          </div>
          <div className="cost-list">
            {[
              ['Material', materialCost],
              ['Labor', laborCost],
              ['Energy', energyCost],
              ['Overhead', overheadCost],
              ['Estimated Cost/Unit', costPerUnit],
            ].map(([label, value], index) => (
              <div key={label} className={`cost-row ${index === 4 ? 'cost-total' : ''}`}>
                <span>{label}</span>
                <strong>{typeof value === 'number' && value > 100000 ? currency.format(value) : currency.format(value)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
