import { Bell, Search } from "lucide-react";

export default function Topbar({ active }) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">MANUFACTURING EXECUTION SYSTEM · IoT</div>
        <h1>{active === "Dashboard" ? "Dashboard Energiciency" : active}</h1>
        <p>Pantau work order, progres produksi, konsumsi energi, dan biaya operasional dalam satu tampilan.</p>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Cari"><Search size={18} /></button>
        <button className="icon-button notification" aria-label="Notifikasi"><Bell size={18} /><i /></button>
        <div className="user-profile">
          <div className="avatar">IK</div>
          <div><strong>Admin IKM</strong><span>Production Manager</span></div>
        </div>
      </div>
    </header>
  );
}