import { useEffect, useState } from "react";

const emptyGroup = {
  name: "",
  direction: "English School",
  age: "",
  schedule: "",
  currentTopic: "",
  progress: 0,
  maxStudents: 8,
  studentIds: [],
  whatsappGroup: "",
};

export default function GroupForm({ group, students, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyGroup);

  useEffect(() => {
    setForm({
      ...emptyGroup,
      ...(group || {}),
      studentIds: group?.studentIds || [],
    });
  }, [group]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleStudent = (studentId) => {
    setForm((current) => {
      const hasStudent = current.studentIds.includes(studentId);
      const nextStudentIds = hasStudent
        ? current.studentIds.filter((id) => id !== studentId)
        : [...current.studentIds, studentId].slice(0, Number(current.maxStudents || 8));
      return { ...current, studentIds: nextStudentIds };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      name: form.name.trim(),
      age: form.age.trim(),
      schedule: form.schedule.trim(),
      currentTopic: form.currentTopic.trim(),
      progress: Math.max(0, Math.min(100, Number(form.progress || 0))),
      maxStudents: Math.max(1, Math.min(8, Number(form.maxStudents || 8))),
      studentIds: form.studentIds.slice(0, Math.max(1, Math.min(8, Number(form.maxStudents || 8)))),
    });
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label>
          Название
          <input value={form.name} required onChange={(event) => updateField("name", event.target.value)} />
        </label>
        <label>
          Направление
          <select value={form.direction} onChange={(event) => updateField("direction", event.target.value)}>
            <option value="English School">English School</option>
            <option value="Preschool">Preschool</option>
          </select>
        </label>
        <label>
          Возраст
          <input value={form.age} placeholder="6-7 лет" onChange={(event) => updateField("age", event.target.value)} />
        </label>
        <label>
          Расписание
          <input value={form.schedule} placeholder="Пн, Ср 17:00" onChange={(event) => updateField("schedule", event.target.value)} />
        </label>
        <label>
          Текущая тема
          <input value={form.currentTopic} onChange={(event) => updateField("currentTopic", event.target.value)} />
        </label>
        <label>
          Прогресс
          <input
            type="number"
            min="0"
            max="100"
            value={form.progress}
            onChange={(event) => updateField("progress", event.target.value)}
          />
        </label>
        <label>
          Максимум детей
          <input
            type="number"
            min="1"
            max="8"
            value={form.maxStudents}
            onChange={(event) => updateField("maxStudents", event.target.value)}
          />
        </label>
        <label>
          WhatsApp
          <input value={form.whatsappGroup} placeholder="https://wa.me/..." onChange={(event) => updateField("whatsappGroup", event.target.value)} />
        </label>
      </div>

      <div className="builder-section">
        <div>
          <span className="eyebrow">Ученики</span>
          <h3>{form.studentIds.length}/{form.maxStudents || 8}</h3>
        </div>
        <div className="material-picker">
          {students.map((student) => {
            const checked = form.studentIds.includes(student.id);
            const disabled = !checked && form.studentIds.length >= Number(form.maxStudents || 8);
            return (
              <label className="check-pill" key={student.id}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleStudent(student.id)}
                />
                {student.fullName}
              </label>
            );
          })}
          {!students.length && <p className="muted-text">Сначала добавьте учеников.</p>}
        </div>
      </div>

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
