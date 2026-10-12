import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { navItems } from '../../data/mockDatabase';

export default function Topbar() {
  const location = useLocation();
  const item = navItems.find((nav) => nav.path === location.pathname) || navItems[0];

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">MANUFACTURING EXECUTION SYSTEM · IOT</div>
        <div className="simulation-banner">
          Data simulasi untuk demonstrasi Energiciency. Bukan data operasional resmi STECHOQ Robotika Indonesia.
        </div>
        <h1>{item.label}</h1>
        <p>Monitor produksi, energi, biaya, inventori, dan kualitas dengan data demo terintegrasi.</p>
      </div>

      <div className="topbar-actions">
        <button type="button" className="icon-button" aria-label="Search">
          <Search size={18} />
        </button>
        <button type="button" className="icon-button notification" aria-label="Notifications">
          <Bell size={18} />
          <i />
        </button>
        <div className="user-profile">
          <div className="avatar">IK</div>
          <div>
            <strong>Admin IKM</strong>
            <span>Production Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
