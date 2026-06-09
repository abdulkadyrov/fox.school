import Card from "../components/Card";
import FileUploader from "../components/FileUploader";

export default function SettingsPage({ data, onUpdateSettings, onDownloadBackup, onImportBackup, onResetData }) {
  const settings = data.settings;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Настройки</span>
          <h1>Школа, PDF и данные</h1>
        </div>
      </div>

      <div className="content-grid content-grid--wide">
        <Card>
          <div className="field-grid">
            <label>
              Имя преподавателя
              <input value={settings.teacherName} onChange={(event) => onUpdateSettings({ teacherName: event.target.value })} />
            </label>
            <label>
              Название школы
              <input value={settings.schoolName} onChange={(event) => onUpdateSettings({ schoolName: event.target.value })} />
            </label>
            <label>
              Стиль PDF
              <select value={settings.pdfStyle} onChange={(event) => onUpdateSettings({ pdfStyle: event.target.value })}>
                <option value="pastel">Pastel</option>
                <option value="clean">Clean</option>
                <option value="print">Print</option>
              </select>
            </label>
            <label>
              Длительность урока
              <input
                type="number"
                min="30"
                step="5"
                value={settings.defaultLessonDuration}
                onChange={(event) => onUpdateSettings({ defaultLessonDuration: Number(event.target.value) })}
              />
            </label>
            <label>
              Расписание
              <input value={settings.schedule} onChange={(event) => onUpdateSettings({ schedule: event.target.value })} />
            </label>
          </div>

          <div className="builder-section">
            <h3>Логотип</h3>
            <FileUploader
              compact
              onUploaded={(record) => {
                if (record.dataUrl?.startsWith("data:image")) {
                  onUpdateSettings({ logoDataUrl: record.dataUrl });
                }
              }}
            />
          </div>
        </Card>

        <Card>
          <h2>Баллы и группы</h2>
          <div className="tag-row">
            {settings.scoreTypes.map((type) => (
              <span className="tag tag--soft" key={type}>{type}</span>
            ))}
          </div>
          <div className="plain-list">
            {data.groups.map((group) => (
              <div className="plain-row" key={group.id}>
                <span>{group.name}</span>
                <small>{group.schedule}</small>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Local storage</span>
            <h2>Резервное копирование</h2>
          </div>
        </div>
        <div className="split-actions">
          <button className="button" type="button" onClick={onDownloadBackup}>
            Скачать резервную копию
          </button>
          <label className="button button--ghost">
            Импорт JSON
            <input type="file" accept="application/json" onChange={(event) => onImportBackup(event.target.files?.[0])} />
          </label>
          <button className="button button--soft" type="button" onClick={onResetData}>
            Вернуть демо-данные
          </button>
        </div>
      </Card>
    </div>
  );
}
