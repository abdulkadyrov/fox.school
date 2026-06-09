import Icon from "./Icon";

export default function SidePanel({ items, activePage, onNavigate, isOpen, onClose }) {
  return (
    <>
      <aside className={`side-panel ${isOpen ? "is-open" : ""}`} aria-label="Разделы приложения">
        <div className="side-panel__top">
          <div>
            <strong>TeacherOS</strong>
            <span>Foxy Teacher</span>
          </div>
          <button className="icon-button side-panel__close" type="button" onClick={onClose} aria-label="Закрыть меню">
            ×
          </button>
        </div>
        <nav className="side-panel__nav">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`side-panel__link ${activePage === item.id ? "is-active" : ""}`}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
            >
              <Icon name={item.icon} size={24} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <button
        className={`panel-scrim ${isOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Закрыть меню"
        onClick={onClose}
      />
    </>
  );
}
