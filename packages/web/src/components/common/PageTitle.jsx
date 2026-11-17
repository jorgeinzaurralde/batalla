export default function PageTitle({ title, description, status }) {
  return (
    <header className="jp-page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {status && <span className="jp-badge">{status}</span>}
    </header>
  );
}
