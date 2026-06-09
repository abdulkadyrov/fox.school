import { useEffect, useMemo, useState } from "react";
import { fileToDataUrl } from "../utils/fileHelpers";

const emptyStudent = {
  fullName: "",
  age: "",
  grade: "",
  groupId: "",
  parentPhone: "",
  notes: [],
  attendance: "",
  behavior: "",
  activity: "",
  homeworkRate: "",
  weakTopics: [],
  strengths: [],
  points: "",
  level: "Little Fox",
  photoDataUrl: "",
  avatarColor: "#53D6BE",
};

const splitList = (value) =>
  String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function StudentForm({ student, groups, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyStudent);
  const [notesText, setNotesText] = useState("");
  const [weakTopicsText, setWeakTopicsText] = useState("");
  const [strengthsText, setStrengthsText] = useState("");

  useEffect(() => {
    const nextStudent = { ...emptyStudent, ...(student || {}) };
    setForm(nextStudent);
    setNotesText((nextStudent.notes || []).join("\n"));
    setWeakTopicsText((nextStudent.weakTopics || []).join(", "));
    setStrengthsText((nextStudent.strengths || []).join(", "));
  }, [student]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === form.groupId),
    [form.groupId, groups]
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    const photoDataUrl = await fileToDataUrl(file);
    updateField("photoDataUrl", photoDataUrl);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      fullName: form.fullName.trim(),
      grade: form.grade.trim(),
      parentPhone: form.parentPhone.trim(),
      age: Number(form.age || 0),
      points: Number(form.points || 0),
      attendance: Math.max(0, Math.min(100, Number(form.attendance || 0))),
      behavior: Math.max(0, Math.min(100, Number(form.behavior || 0))),
      activity: Math.max(0, Math.min(100, Number(form.activity || 0))),
      homeworkRate: Math.max(0, Math.min(100, Number(form.homeworkRate || 0))),
      notes: splitList(notesText),
      weakTopics: splitList(weakTopicsText),
      strengths: splitList(strengthsText),
    });
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      <div className="field-grid">
        <div className="photo-picker">
          <div className="avatar avatar--form" style={{ "--avatar": form.avatarColor }}>
            {form.photoDataUrl ? <img src={form.photoDataUrl} alt="" /> : (form.fullName || "FT").slice(0, 2)}
          </div>
          <div className="split-actions">
            <label className="button button--ghost button--compact">
              Фото
              <input type="file" accept="image/*" onChange={(event) => uploadPhoto(event.target.files?.[0])} />
            </label>
            {form.photoDataUrl && (
              <button className="button button--ghost button--compact" type="button" onClick={() => updateField("photoDataUrl", "")}>
                Удалить
              </button>
            )}
          </div>
        </div>
        <label>
          ФИО
          <input value={form.fullName} required onChange={(event) => updateField("fullName", event.target.value)} />
        </label>
        <label>
          Группа
          <select value={form.groupId} onChange={(event) => updateField("groupId", event.target.value)}>
            <option value="">Без группы</option>
            {groups.map((group) => (
              <option value={group.id} key={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Возраст
          <input type="number" min="3" max="18" value={form.age} placeholder="Возраст" onChange={(event) => updateField("age", event.target.value)} />
        </label>
        <label>
          Класс
          <input value={form.grade} placeholder="4 класс" onChange={(event) => updateField("grade", event.target.value)} />
        </label>
        <label>
          Телефон родителя
          <input value={form.parentPhone} placeholder="+7..." onChange={(event) => updateField("parentPhone", event.target.value)} />
        </label>
        <label>
          Баллы
          <input type="number" min="0" value={form.points} placeholder="0" onChange={(event) => updateField("points", event.target.value)} />
        </label>
      </div>

      {selectedGroup && (
        <div className="preview-panel">
          <span className="eyebrow">Группа</span>
          <strong>{selectedGroup.name}</strong>
          <small>{selectedGroup.studentIds.length}/{selectedGroup.maxStudents} учеников</small>
        </div>
      )}

      <div className="metric-grid">
        <label>
          Посещаемость
          <input type="number" min="0" max="100" value={form.attendance} placeholder="%" onChange={(event) => updateField("attendance", event.target.value)} />
        </label>
        <label>
          Поведение
          <input type="number" min="0" max="100" value={form.behavior} placeholder="%" onChange={(event) => updateField("behavior", event.target.value)} />
        </label>
        <label>
          Активность
          <input type="number" min="0" max="100" value={form.activity} placeholder="%" onChange={(event) => updateField("activity", event.target.value)} />
        </label>
        <label>
          Домашки
          <input type="number" min="0" max="100" value={form.homeworkRate} placeholder="%" onChange={(event) => updateField("homeworkRate", event.target.value)} />
        </label>
      </div>

      <label>
        Заметки
        <textarea rows={3} value={notesText} onChange={(event) => setNotesText(event.target.value)} />
      </label>
      <label>
        Слабые темы
        <textarea rows={2} value={weakTopicsText} onChange={(event) => setWeakTopicsText(event.target.value)} />
      </label>
      <label>
        Сильные стороны
        <textarea rows={2} value={strengthsText} onChange={(event) => setStrengthsText(event.target.value)} />
      </label>

      <div className="split-actions">
        <button className="button" type="submit">
          Сохранить
        </button>
        <button className="button button--ghost" type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
