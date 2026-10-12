import { useMemo, useState } from 'react';
import { Search, PlusCircle, PackageCheck, Truck } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { formatCurrency } from '../data/mockDatabase';
import { calculateMaterialRequirements, getActiveBomForProduct } from '../utils/bomManagement';

function StatusBadge({ status }) {
  const kind = status === 'Completed' ? 'done' : status === 'In Progress' ? 'process' : status === 'Delayed' ? 'alert' : 'planned';
  return <span className={`status-badge ${kind}`}>{status}</span>;
}

export default function ProductionOrdersPage({ data, setData }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrderId, setSelectedOrderId] = useState(data.orders[0]?.id || '');
  const [form, setForm] = useState({ productId: data.products[0]?.id || '', quantity: 12, status: 'Planned' });
  const [error, setError] = useState('');

  const selectedOrder = data.orders.find((order) => order.id === selectedOrderId) || data.orders[0] || null;
  const selectedProduct = data.products.find((product) => product.id === form.productId) || data.products[0] || null;
  const activeBom = selectedProduct ? getActiveBomForProduct(selectedProduct.id, data.boms || []) : null;
  const materialRequirements = activeBom ? calculateMaterialRequirements(activeBom, Number(form.quantity || 1), data.inventory || []) : [];
  const shortages = materialRequirements.filter((item) => item.shortage > 0);

  const filteredOrders = useMemo(() => {
    return data.orders.filter((order) => {
      const matchesSearch = `${order.id} ${order.product || order.productName || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.orders, search, statusFilter]);

  const totalOrders = data.orders.length;
  const inProgress = data.orders.filter((order) => order.status === 'In Progress').length;
  const completed = data.orders.filter((order) => order.status === 'Completed').length;
  const planned = data.orders.filter((order) => order.status === 'Planned').length;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedProduct || !form.quantity || Number(form.quantity) <= 0) {
      setError('Pilih produk dan jumlah yang valid.');
      return;
    }

    const bomSnapshot = activeBom ? {
      ...activeBom,
      components: (activeBom.components || []).map((component) => ({
        ...component,
        quantity: Number(component.quantity ?? component.quantityPerUnit ?? 1),
        unitCost: Number(component.unitCost ?? component.unitPrice ?? 0),
      })),
    } : { id: 'MANUAL-BOM', bomCode: 'MANUAL-BOM', version: 1, status: 'draft', outputQuantity: Number(form.quantity), components: [] };

    const nextOrder = {
      id: `PO-${String(2700 + data.orders.length).padStart(4, '0')}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      product: selectedProduct.name,
      quantity: Number(form.quantity),
      plannedQuantity: Number(form.quantity),
      status: form.status,
      progress: form.status === 'Completed' ? 100 : form.status === 'In Progress' ? 62 : 24,
      date: new Date().toISOString().slice(0, 10),
      energy: `${(Number(form.quantity) * 1.8).toFixed(1)} kWh`,
      cost: `Rp${(Number(form.quantity) * 185000).toLocaleString('id-ID')}`,
      priority: 'Medium',
      bomId: activeBom?.id || '',
      bomVersion: activeBom?.version || 1,
      bomSnapshot,
      materialsReserved: false,
    };

    setData((current) => ({
      ...current,
      orders: [nextOrder, ...current.orders],
      productionOrders: [nextOrder, ...current.productionOrders],
    }));

    setSelectedOrderId(nextOrder.id);
    setForm({ productId: selectedProduct.id, quantity: 12, status: 'Planned' });
    setError('');
  };

  const handleReserveMaterials = () => {
    if (!selectedOrder || selectedOrder.materialsReserved) return;

    const snapshot = selectedOrder.bomSnapshot || { components: [] };
    const requirements = calculateMaterialRequirements(snapshot, Number(selectedOrder.quantity || selectedOrder.plannedQuantity || 1), data.inventory || []);

    setData((current) => {
      const nextInventory = current.inventory.map((item) => {
        const match = requirements.find((requirement) => requirement.inventorySku === item.sku);
        if (!match) return item;
        const reservedQty = Number(match.grossQuantity || 0);
        return {
          ...item,
          stock: Math.max(0, Number(item.stock || 0) - reservedQty),
          reserved: Number(item.reserved || 0) + reservedQty,
          status: Number(item.stock || 0) - reservedQty <= item.threshold ? 'Low Stock' : item.status,
        };
      });

      const updatedOrders = current.orders.map((order) => order.id === selectedOrder.id ? { ...order, materialsReserved: true, status: order.status === 'Planned' ? 'In Progress' : order.status } : order);

      return {
        ...current,
        inventory: nextInventory,
        orders: updatedOrders,
        productionOrders: updatedOrders,
        bomTransactions: [
          {
            id: `TX-${Date.now().toString().slice(-6)}`,
            type: 'reservation',
            orderId: selectedOrder.id,
            createdAt: new Date().toISOString(),
            entries: requirements.map((requirement) => ({
              inventorySku: requirement.inventorySku,
              quantity: requirement.grossQuantity,
            })),
          },
          ...(current.bomTransactions || []),
        ],
      };
    });
  };

  return (
    <>
      <PageHeader
        title="Production Order"
        description="Kelola jadwal, status, dan progres order secara terstruktur."
        actions={[
          <button key="add" type="button" className="button button-primary">
            <PlusCircle size={16} /> Create Order
          </button>,
        ]}
      />

      <section className="stats-grid compact-grid">
        {[{ label: 'Total Orders', value: totalOrders }, { label: 'In Progress', value: inProgress }, { label: 'Completed', value: completed }, { label: 'Planned', value: planned }].map((item) => (
          <article key={item.label} className="stat-card">
            <div className="stat-top"><span>{item.label}</span><span className="stat-icon stat-icon-1"><Search size={18} /></span></div>
            <div className="stat-value">{item.value}</div>
            <div className="stat-note positive">Dari semua batch aktif</div>
          </article>
        ))}
      </section>

      <div className="two-column-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Daftar Order</h2>
              <p>Filter berdasarkan status dan pencarian produk</p>
            </div>
          </div>
          <div className="filter-row">
            <label className="search-input">
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari order atau produk" aria-label="Cari order" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter status">
              <option value="All">Semua</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Planned">Planned</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Produk</th>
                  <th>Qty</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected-row' : ''} onClick={() => setSelectedOrderId(order.id)}>
                    <td>{order.id}</td>
                    <td>{order.product || order.productName}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <div className="mini-progress">
                        <span style={{ width: `${order.progress || 0}%` }} />
                      </div>
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-header">
            <div>
              <h2>Order Detail</h2>
              <p>{selectedOrder?.id || 'Pilih order'}</p>
            </div>
          </div>
          {selectedOrder && (
            <div className="detail-card">
              <h3>{selectedOrder.product || selectedOrder.productName}</h3>
              <div className="detail-grid">
                <div><span>Jumlah</span><strong>{selectedOrder.quantity} unit</strong></div>
                <div><span>Prioritas</span><strong>{selectedOrder.priority}</strong></div>
                <div><span>Energi</span><strong>{selectedOrder.energy}</strong></div>
                <div><span>Target</span><strong>{selectedOrder.date}</strong></div>
              </div>
              <div className="progress-summary compact">
                <div className="progress-label">
                  <strong>{selectedOrder.progress || 0}%</strong>
                  <span>{selectedOrder.status}</span>
                </div>
                <div className="progress-track"><span style={{ width: `${selectedOrder.progress || 0}%` }} /></div>
              </div>
              <div className="cost-list" style={{ marginTop: '12px' }}>
                <div className="cost-row"><span>BOM snapshot</span><strong>{selectedOrder.bomId || 'Manual'}</strong></div>
                <div className="cost-row"><span>Status reservation</span><strong>{selectedOrder.materialsReserved ? 'Reserved' : 'Pending'}</strong></div>
              </div>
              <div className="field-row" style={{ marginTop: '12px' }}>
                <button type="button" className="button button-secondary full-width" onClick={handleReserveMaterials} disabled={selectedOrder.materialsReserved}>
                  <Truck size={16} /> {selectedOrder.materialsReserved ? 'Materials reserved' : 'Reserve materials'}
                </button>
              </div>
            </div>
          )}

          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Buat Production Order</h3>
            <label>
              <span>Produk</span>
              <select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })}>
                {data.products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Jumlah</span>
              <input value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="Misal 25" type="number" min="1" />
            </label>
            <label>
              <span>Status</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
            <div className="cost-list">
              <div className="cost-row"><span>Active BOM</span><strong>{activeBom ? activeBom.bomCode : 'Manual'}</strong></div>
              <div className="cost-row"><span>Projected BOM cost</span><strong>{formatCurrency(materialRequirements.reduce((sum, item) => sum + (Number(item.grossQuantity || 0) * Number(item.unitCost || 0)), 0))}</strong></div>
            </div>
            {shortages.length > 0 && (
              <div className="validation-card warning-box">
                <strong>Shortages</strong>
                <ul>
                  {shortages.map((item, index) => <li key={`${item.inventorySku}-${index}`}>{item.inventoryName || item.inventorySku}: {item.shortage.toFixed(1)} shortage</li>)}
                </ul>
              </div>
            )}
            {error && <p className="field-error">{error}</p>}
            <button type="submit" className="button button-primary full-width"><PackageCheck size={16} /> Tambah Order</button>
          </form>
        </aside>
      </div>
    </>
  );
}
