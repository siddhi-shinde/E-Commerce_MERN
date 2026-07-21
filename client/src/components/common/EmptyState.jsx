const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="mk-empty-state">
    {Icon && <Icon size={40} className="mb-3" style={{ color: 'var(--mk-border)' }} />}
    <h5 className="mb-1">{title}</h5>
    {message && <p className="mb-3">{message}</p>}
    {action}
  </div>
);

export default EmptyState;
