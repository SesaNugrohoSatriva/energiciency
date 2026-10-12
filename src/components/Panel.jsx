export default function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-header">
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        {action && <button className="panel-action" onClick={action.onClick}>{action.label}</button>}
      </div>
      {children}
    </section>
  );
}