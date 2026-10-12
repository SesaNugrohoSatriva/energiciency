import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Search, Save, Trash2, ClipboardCheck, RefreshCcw, Layers3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { formatCurrency } from '../data/mockDatabase';
import {
  activateBom,
  addBomComponent,
  calculateBomMaterialCost,
  createBom,
  duplicateBomVersion,
  getActiveBomForProduct,
  removeBomComponent,
  updateBomComponent,
  updateBomDraft,
  validateBom,
} from '../utils/bomManagement';

const emptyComponent = (prefix = 'CMP') => ({
  id: `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(16).slice(2, 6)}`,
  componentCode: `${prefix}-${Date.now().toString().slice(-6)}`,
  componentName: 'Primary assembly',
  inventorySku: '',
  quantity: 1,
  unitOfMeasure: 'set',
  unitCost: 0,
  scrapRate: 2,
  notes: '',
});

export default function ProductPage({ data, setData }) {
  const { productId } = useParams();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ sku: '', name: '', category: 'Automation', description: '', uom: 'unit', batchSize: 12, status: 'Active' });
  const [error, setError] = useState('');
  const [bomDraft, setBomDraft] = useState(null);
  const [bomMessage, setBomMessage] = useState({ kind: '', text: '' });

  const filteredProducts = data.products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase()));
  const selectedProduct = data.products.find((product) => product.id === productId) || data.products[0] || null;
  const productBoms = useMemo(
    () => (data.boms || []).filter((bom) => bom.productId === selectedProduct?.id),
    [data.boms, selectedProduct],
  );
  const activeBom = useMemo(() => getActiveBomForProduct(selectedProduct?.id, productBoms), [selectedProduct, productBoms]);
  const selectedBom = useMemo(() => productBoms.find((bom) => bom.id === bomDraft?.id) || activeBom || productBoms[0] || null, [activeBom, bomDraft, productBoms]);

  useEffect(() => {
    if (!selectedBom) {
      setBomDraft(null);
      return;
    }

    setBomDraft({
      ...selectedBom,
      components: (selectedBom.components || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity ?? item.quantityPerUnit ?? 1),
        unitCost: Number(item.unitCost ?? item.unitPrice ?? 0),
        scrapRate: Number(item.scrapRate ?? 0),
      })),
    });
  }, [selectedBom]);

  const validation = bomDraft ? validateBom(bomDraft, data.boms || [], data.inventory || []) : null;
  const requiredMaterialCost = bomDraft ? calculateBomMaterialCost(bomDraft, Number(bomDraft.outputQuantity || 1), data.inventory || []) : 0;

  const handleCreateProduct = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.sku.trim()) {
      setError('Nama dan SKU product harus diisi.');
      return;
    }

    const newProduct = {
      id: `PRD-${String(2000 + data.products.length).padStart(4, '0')}`,
      sku: form.sku,
      name: form.name,
      category: form.category,
      description: form.description || 'New product entry',
      uom: form.uom,
      batchSize: Number(form.batchSize || 1),
      status: form.status,
      bom: [],
      routing: [],
      targetOee: 0.85,
      estimatedCost: 0,
    };

    setData((current) => ({
      ...current,
      products: [newProduct, ...current.products],
    }));

    setForm({ sku: '', name: '', category: 'Automation', description: '', uom: 'unit', batchSize: 12, status: 'Active' });
    setError('');
  };

  const handleCreateBom = () => {
    if (!selectedProduct) return;
    const candidate = createBom(
      {
        productId: selectedProduct.id,
        bomCode: `${selectedProduct.sku}-BOM`,
        outputQuantity: 1,
        description: `Draft BOM for ${selectedProduct.name}`,
        components: [{ ...emptyComponent(`${selectedProduct.sku}`), componentCode: `${selectedProduct.sku}-CMP-01`, componentName: 'Primary assembly' }],
      },
      data.boms || [],
      data.inventory || [],
    );

    if (!candidate.validation.valid) {
      setBomMessage({ kind: 'error', text: candidate.validation.blockingErrors[0]?.message || 'BOM draft invalid.' });
      return;
    }

    setData((current) => ({
      ...current,
      boms: [candidate.bom, ...(current.boms || [])],
      products: current.products.map((product) => product.id === selectedProduct.id ? { ...product, bomId: candidate.bom.id, bom: candidate.bom.components } : product),
    }));

    setBomDraft(candidate.bom);
    setBomMessage({ kind: 'success', text: 'New BOM draft created.' });
  };

  const handleFieldChange = (field, value) => {
    setBomDraft((current) => (current ? { ...current, [field]: value, updatedAt: new Date().toISOString().slice(0, 10) } : current));
  };

  const handleComponentChange = (componentId, field, value) => {
    setBomDraft((current) => {
      if (!current) return null;
      return {
        ...current,
        components: current.components.map((component) => component.id === componentId ? { ...component, [field]: field === 'quantity' || field === 'unitCost' || field === 'scrapRate' ? Number(value) : value } : component),
      };
    });
  };

  const handleSaveBom = () => {
    if (!bomDraft) return;
    const updated = updateBomDraft(bomDraft, bomDraft);
    const nextValidation = validateBom(updated, data.boms || [], data.inventory || []);

    if (!nextValidation.valid) {
      setBomMessage({ kind: 'error', text: nextValidation.blockingErrors[0]?.message || 'BOM has blocking validation issues.' });
      return;
    }

    setData((current) => ({
      ...current,
      boms: (current.boms || []).map((bom) => bom.id === bomDraft.id ? updated : bom),
      products: current.products.map((product) => product.id === selectedProduct.id ? { ...product, bom: updated.components, bomId: updated.id } : product),
    }));

    setBomMessage({ kind: 'success', text: 'BOM draft saved successfully.' });
  };

  const handleActivateBom = () => {
    if (!bomDraft) return;
    const { bom, validation } = activateBom(bomDraft, data.boms || [], data.inventory || []);
    if (!validation.valid) {
      setBomMessage({ kind: 'error', text: validation.blockingErrors[0]?.message || 'BOM activation blocked.' });
      return;
    }

    setData((current) => ({
      ...current,
      boms: (current.boms || []).map((item) => item.id === bom.id ? bom : item),
      products: current.products.map((product) => product.id === selectedProduct.id ? { ...product, bomId: bom.id } : product),
    }));

    setBomDraft(bom);
    setBomMessage({ kind: 'success', text: 'BOM activated and ready for production planning.' });
  };

  const handleDuplicateBom = () => {
    if (!bomDraft) return;
    const duplicated = duplicateBomVersion(bomDraft);
    setData((current) => ({
      ...current,
      boms: [duplicated, ...(current.boms || [])],
    }));
    setBomDraft(duplicated);
    setBomMessage({ kind: 'success', text: 'BOM version duplicated as new draft.' });
  };

  const handleAddComponent = () => {
    setBomDraft((current) => {
      if (!current) return null;
      return addBomComponent(current, emptyComponent());
    });
  };

  const handleRemoveComponent = (componentId) => {
    setBomDraft((current) => {
      if (!current) return null;
      return removeBomComponent(current, componentId);
    });
  };

  const handleProductSelection = (product) => {
    setBomDraft(null);
    setBomMessage({ kind: '', text: '' });
    window.location.href = `/products/${product.id}`;
  };

  if (!selectedProduct) {
    return null;
  }

  return (
    <>
      <PageHeader title="Produk" description="Kelola daftar produk, BOM, routing, dan estimasi biaya produksi." />

      <section className="two-column-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Product List</h2>
              <p>Daftar produk yang tersedia untuk order dan costing</p>
            </div>
          </div>
          <div className="filter-row">
            <label className="search-input">
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari produk" aria-label="Cari produk" />
            </label>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Batch</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={product.id === selectedProduct.id ? 'selected-row' : ''} onClick={() => handleProductSelection(product)}>
                    <td><Link to={`/products/${product.id}`}>{product.sku}</Link></td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.batchSize} {product.uom}</td>
                    <td>{formatCurrency(product.estimatedCost || 0)}</td>
                    <td><span className={`status-badge ${product.status === 'Archived' ? 'alert' : 'done'}`}>{product.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-header">
            <div>
              <h2>Tambah Produk</h2>
              <p>Tambah entri baru ke database demo</p>
            </div>
          </div>

          <form className="form-card" onSubmit={handleCreateProduct}>
            <label>
              <span>SKU</span>
              <input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="RBT-NEW-01" />
            </label>
            <label>
              <span>Nama Produk</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Robot New Product" />
            </label>
            <div className="half-grid">
              <label>
                <span>Kategori</span>
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  <option value="Automation">Automation</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Testing">Testing</option>
                </select>
              </label>
              <label>
                <span>Satuan</span>
                <select value={form.uom} onChange={(event) => setForm({ ...form, uom: event.target.value })}>
                  <option value="unit">unit</option>
                  <option value="kg">kg</option>
                </select>
              </label>
            </div>
            <div className="half-grid">
              <label>
                <span>Batch Size</span>
                <input type="number" min="1" value={form.batchSize} onChange={(event) => setForm({ ...form, batchSize: event.target.value })} />
              </label>
              <label>
                <span>Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>
            </div>
            <label>
              <span>Deskripsi</span>
              <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Deskripsi ringkas" />
            </label>
            {error && <p className="field-error">{error}</p>}
            <button type="submit" className="button button-primary full-width"><PlusCircle size={16} /> Create Product</button>
          </form>
        </aside>
      </section>

      <section className="panel product-bom-section">
        <div className="panel-header bom-panel-header">
          <div>
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.sku} · {selectedProduct.category}</p>
          </div>
          <div className="page-header-actions bom-actions">
            <button type="button" className="button button-secondary" onClick={handleCreateBom}><Layers3 size={16} /> New BOM</button>
          </div>
        </div>

        <div className="metric-grid bom-summary-grid">
          <div className="metric">
            <span>Active BOM</span>
            <strong>{activeBom ? activeBom.bomCode : 'Not assigned'}</strong>
          </div>
          <div className="metric">
            <span>Estimated material cost</span>
            <strong>{formatCurrency(requiredMaterialCost)}</strong>
          </div>
        </div>

        {productBoms.length === 0 ? (
          <div className="empty-state-panel">
            <h2>0</h2>
            <p>Belum ada BOM untuk produk ini. Buat draft BOM untuk memulai alur produksi.</p>
            <button type="button" className="button button-primary" onClick={handleCreateBom}><PlusCircle size={16} /> Create BOM</button>
          </div>
        ) : (
          <>
            <div className="filter-row bom-toolbar">
              <select className="bom-version-select" value={bomDraft?.id || ''} onChange={(event) => {
                const nextBom = productBoms.find((bom) => bom.id === event.target.value);
                if (nextBom) {
                  setBomDraft({ ...nextBom, components: (nextBom.components || []).map((item) => ({ ...item, quantity: Number(item.quantity ?? item.quantityPerUnit ?? 1), unitCost: Number(item.unitCost ?? item.unitPrice ?? 0), scrapRate: Number(item.scrapRate ?? 0) })) });
                }
              }}>
                {productBoms.map((bom) => (
                  <option key={bom.id} value={bom.id}>{bom.bomCode} (v{bom.version})</option>
                ))}
              </select>
            </div>

            {bomDraft && (
              <div className="bom-editor">
                <div className="bom-header-row">
                  <div className="bom-form-grid">
                    <label>
                      <span>BOM Code</span>
                      <input value={bomDraft.bomCode || ''} onChange={(event) => handleFieldChange('bomCode', event.target.value)} />
                    </label>
                    <label>
                      <span>Output quantity</span>
                      <input type="number" min="1" value={bomDraft.outputQuantity || 1} onChange={(event) => handleFieldChange('outputQuantity', Number(event.target.value || 1))} />
                    </label>
                  </div>
                  <div className="page-header-actions bom-actions">
                    <button type="button" className="button button-secondary" onClick={handleSaveBom}><Save size={16} /> Save</button>
                    <button type="button" className="button button-primary" onClick={handleActivateBom}><ClipboardCheck size={16} /> Activate</button>
                    <button type="button" className="button button-secondary" onClick={handleDuplicateBom}><RefreshCcw size={16} /> Duplicate</button>
                  </div>
                </div>

                <div className="bom-detail-grid">
                  <label>
                    <span>Description</span>
                    <input value={bomDraft.description || ''} onChange={(event) => handleFieldChange('description', event.target.value)} />
                  </label>
                  <label>
                    <span>Status</span>
                    <select value={bomDraft.status || 'draft'} onChange={(event) => handleFieldChange('status', event.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                </div>

                {validation && (
                  <div className="validation-card">
                    <strong>{validation.valid ? 'Valid BOM' : 'Blocking issues found'}</strong>
                    {validation.blockingErrors.length > 0 && (
                      <ul>
                        {validation.blockingErrors.map((issue, index) => <li key={`${issue.field}-${index}`}>{issue.message}</li>)}
                      </ul>
                    )}
                    {validation.warnings.length > 0 && (
                      <div className="warning-list">
                        {validation.warnings.map((issue, index) => <small key={`${issue.field}-${index}`}>{issue.message}</small>)}
                      </div>
                    )}
                  </div>
                )}

                <div className="bom-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Component</th>
                        <th>Inventory</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Scrap</th>
                        <th>Cost</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(bomDraft.components || []).map((component) => (
                        <tr key={component.id}>
                          <td><input value={component.componentCode || ''} onChange={(event) => handleComponentChange(component.id, 'componentCode', event.target.value)} /></td>
                          <td><input value={component.componentName || ''} onChange={(event) => handleComponentChange(component.id, 'componentName', event.target.value)} /></td>
                          <td><input value={component.inventorySku || ''} onChange={(event) => handleComponentChange(component.id, 'inventorySku', event.target.value)} /></td>
                          <td><input type="number" min="0" value={component.quantity || 1} onChange={(event) => handleComponentChange(component.id, 'quantity', Number(event.target.value || 1))} /></td>
                          <td><input value={component.unitOfMeasure || 'set'} onChange={(event) => handleComponentChange(component.id, 'unitOfMeasure', event.target.value)} /></td>
                          <td><input type="number" min="0" step="0.1" value={component.scrapRate || 0} onChange={(event) => handleComponentChange(component.id, 'scrapRate', Number(event.target.value || 0))} /></td>
                          <td><input type="number" min="0" value={component.unitCost || 0} onChange={(event) => handleComponentChange(component.id, 'unitCost', Number(event.target.value || 0))} /></td>
                          <td><button type="button" className="icon-button" onClick={() => handleRemoveComponent(component.id)} aria-label="Remove component"><Trash2 size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="filter-row" style={{ marginTop: '12px' }}>
                  <button type="button" className="button button-secondary" onClick={handleAddComponent}><PlusCircle size={16} /> Add component</button>
                </div>

                {bomMessage.text && <p className={`field-${bomMessage.kind === 'error' ? 'error' : 'success'}`}>{bomMessage.text}</p>}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
