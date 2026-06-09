import foxTeacher from "../assets/mascot/fox-teacher.png";

export default function AppHeader({ settings, activeLabel, onMenuClick, onInstall, installReady }) {
  return (
    <header className="app-header">
      <button className="icon-button app-header__menu" type="button" onClick={onMenuClick} aria-label="Открыть меню">
        ☰
      </button>
      <div className="brand">
        <img src={settings.logoDataUrl || foxTeacher} alt="" />
        <div>
          <strong>{settings.schoolName || "Foxy Teacher"}</strong>
          <span>{activeLabel}</span>
        </div>
      </div>
      <div className="app-header__actions">
        {installReady && (
          <button className="button button--ghost" type="button" onClick={onInstall}>
            Установить
          </button>
        )}
        <div className="teacher-pill">{settings.teacherName || "Teacher"}</div>
      </div>
    </header>
  );
}
