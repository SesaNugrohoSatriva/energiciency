import { ArrowDownRight, ArrowUpRight, Gauge, Zap, Boxes, Wallet } from "lucide-react";

const icons = [Boxes, Zap, Wallet, Gauge];

export default function StatCard({ stat, index }) {
  const Icon = icons[index] || Gauge;
  const Trend = stat.tone === "negative" ? ArrowUpRight : ArrowDownRight;
  return (
    <article className="stat-card">
      <div className="stat-top"><span>{stat.label}</span><span className={`stat-icon stat-icon-${index}`}><Icon size={18} /></span></div>
      <div className="stat-value">{stat.value}{stat.unit && <small>{stat.unit}</small>}</div>
      <div className={`stat-note ${stat.tone}`}><Trend size={14} />{stat.note}</div>
    </article>
  );
}