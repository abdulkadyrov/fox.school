import Icon from "./Icon";

const mobileItems = ["dashboard", "groups", "planner", "games", "settings"];

export default function BottomNav({ items, activePage, onNavigate }) {
  const visibleItems = items.filter((item) => mobileItems.includes(item.id));

  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {visibleItems.map((item) => (
        <button
          className={`bottom-nav__item ${activePage === item.id ? "is-active" : ""}`}
          type="button"
          key={item.id}
          onClick={() => onNavigate(item.id)}
        >
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
