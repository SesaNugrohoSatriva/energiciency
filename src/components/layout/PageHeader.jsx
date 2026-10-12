export default function PageHeader({ title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">DEMO DATA · MANUFACTURING EXECUTION SYSTEM</p>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
