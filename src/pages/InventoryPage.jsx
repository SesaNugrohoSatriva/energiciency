import { useMemo, useState } from 'react';
import { Package, Search, PlusCircle } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';

export default function InventoryPage({ data }) {
  const [inventory, setInventory] = useState(data.inventory);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [form, setForm] = useState({ name: '', category: 'Mechanic', stock: '', threshold: '' });
  const [error, setError] = useState('');

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = `${item.name} ${item.sku}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, inventory, search]);

  const totalValue = inventory.reduce((sum, item) => sum + item.stock * item.unitCost, 0);
  const lowStock = inventory.filter((item) => item.stock <= item.threshold).length;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.stock || Number(form.stock) <= 0) {
      setError('Nama dan jumlah stok harus valid.');
      return;
    }

    const nextItem = {
      sku: `INV-${String(200 + inventory.length).padStart(3, '0')}`,
      name: form.name,
      category: form.category,
      stock: Number(form.stock),
      threshold: Number(form.threshold || 15),
      unit: 'pcs',
      location: 'Rack A',
      unitCost: 150000,
      status: 'Healthy',
    };

    setInventory((current) => [nextItem, ...current]);
    setForm({ name: '', category: 'Mechanic', stock: '', threshold: '' });
    setError('');
  };

  return (
    <>
      <PageHeader
        title="Persediaan"
        description="Pantau stok, status, dan kebutuhan reorder bahan produksi."
        actions={[
          <button key="add" type="button" className="button button-primary"><PlusCircle size={16} /> Add Item</button>,
        ]}
      />

      <section className="stats-grid">
        {[
          { label: 'Total Items', value: inventory.length, note: 'Total SKU aktif', tone: 'positive' },
          { label: 'Low Stock', value: lowStock, note: 'Butuh perhatian', tone: 'negative' },
          { label: 'Inventory Value', value: `Rp${(totalValue / 1000000).toFixed(1)} jt`, note: 'Nilai persediaan', tone: 'neutral' },
          { label: 'Healthy Stock', value: inventory.filter((item) => item.status === 'Healthy').length, note: 'Terkonfirmasi siap pakai', tone: 'positive' },
        ].map((card, index) => (
          <article key={card.label} className="stat-card">
            <div className="stat-top"><span>{card.label}</span><span className={`stat-icon stat-icon-${index % 4}`}><Package size={18} /></span></div>
            <div className="stat-value">{card.value}</div>
            <div className={`stat-note ${card.tone}`}>{card.note}</div>
          </article>
        ))}
      </section>

      <div className="two-column-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Inventory Table</h2>
              <p>Stok, lokasi, dan status item</p>
            </div>
          </div>
          <div className="filter-row">
            <label className="search-input">
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari item atau sku" aria-label="Cari item" />
            </label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter category">
              <option value="All">Semua Kategori</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Electronics">Electronics</option>
              <option value="Safety">Safety</option>
              <option value="Consumables">Consumables</option>
            </select>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.sku}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.stock} {item.unit}</td>
                    <td><span className={`status-badge ${item.status === 'Low Stock' ? 'alert' : item.status === 'Monitor' ? 'process' : 'done'}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-header">
            <div>
              <h2>Tambah Item</h2>
              <p>Catat material baru dan set stok awal</p>
            </div>
          </div>
          <form className="form-card" onSubmit={handleSubmit}>
            <label>
              <span>Nama item</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh Relay 24V" />
            </label>
            <label>
              <span>Kategori</span>
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option value="Mechanic">Mechanic</option>
                <option value="Electronics">Electronics</option>
                <option value="Safety">Safety</option>
                <option value="Consumables">Consumables</option>
              </select>
            </label>
            <div className="half-grid">
              <label>
                <span>Stock</span>
                <input type="number" min="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
              </label>
              <label>
                <span>Threshold</span>
                <input type="number" min="1" value={form.threshold} onChange={(event) => setForm({ ...form, threshold: event.target.value })} />
              </label>
            </div>
            {error && <p className="field-error">{error}</p>}
            <button type="submit" className="button button-primary full-width">Simpan Item</button>
          </form>
        </aside>
      </div>
    </>
  );
}
