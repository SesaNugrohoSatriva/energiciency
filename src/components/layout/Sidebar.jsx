import { NavLink } from 'react-router-dom';
import { Activity, Boxes, ChartNoAxesCombined, ClipboardList, Package, Zap, Factory } from 'lucide-react';
import logo from '../../img/logo.jpeg';
import { navItems } from '../../data/mockDatabase';

const icons = {
  Dashboard: Activity,
  'Production Order': ClipboardList,
  Produk: Package,
  'Monitoring Energi': Zap,
  'Performa Mesin': Factory,
  Costing: ChartNoAxesCombined,
  Persediaan: Package,
  Laporan: Boxes,
};

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-wrap">
        <img src={logo} alt="Energiciency logo" className="brand-logo" />
        <div className="brand-copy">
          <div className="brand-name">ENERGICIENCY</div>
          <div className="brand-subtitle">Manufacturing Intelligence</div>
        </div>
      </div>

      <div className="nav-caption">WORKSPACE</div>
      <nav className="navigation" aria-label="Sidebar navigation">
        {navItems.map(({ label, path }) => {
          const Icon = icons[label] || Factory;

          return (
            <NavLink
              key={label}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <span className="status-dot" />
        <div>
          <small>SYSTEM STATUS</small>
          <strong>Demo Mode</strong>
        </div>
      </div>
    </aside>
  );
}
