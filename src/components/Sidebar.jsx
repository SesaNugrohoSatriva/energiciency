import { Activity, Boxes, ChartNoAxesCombined, ClipboardList, Factory, Gauge, Package, Zap } from "lucide-react";

const links = [
  { label: "Dashboard", icon: Gauge },
  { label: "Production Order", icon: ClipboardList },
  { label: "Produk", icon: Package },
  { label: "Monitoring Energi", icon: Zap },
  { label: "Performa Mesin", icon: Factory },
  { label: "Costing", icon: ChartNoAxesCombined },
  { label: "Persediaan", icon: Package },
  { label: "Laporan", icon: Activity },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Factory size={21} /></div>
        <div>
          <div className="brand-name">ENERGICIENCY</div>
          <div className="brand-subtitle">Manufacturing Intelligence</div>
        </div>
      </div>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="navigation" aria-label="Navigasi utama">
        {links.map(({ label, icon: Icon }) => (
          <button key={label} className={`nav-link ${active === label ? "active" : ""}`} onClick={() => onNavigate(label)}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <span className="status-dot" />
        <div><small>SYSTEM STATUS</small><strong>Prototype Mode</strong></div>
      </div>
    </aside>
  );
}