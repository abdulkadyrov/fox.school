import { useEffect, useState } from "react";
import { getTodayIso } from "../utils/dateHelpers";
import { lessonBlockTypes } from "../data/templates";

const createBlock = (type = "разминка") => ({
  id: `block-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  title: type,
  duration: 10,
  description: "",
  materials: [],
  teacherNotes: "",
});

const defaultBlocks = () => [
  createBlock("разминка"),
  createBlock("новая тема"),
  createBlock("практика"),
  createBlock("игра"),
  createBlock("домашнее задание"),
];

const emptyLesson = {
  title: "",
  groupId: "",
  date: getTodayIso(),
  startTime: "17:00",
  duration: 60,
  topic: "",
  goal: "",
  status: "planned",
  blocks: [],
};

const toMaterialsText = (materials = []) => materials.join(", ");
const splitMaterials = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function LessonForm({ lesson, groups, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...emptyLesson, blocks: defaultBlocks() });

  useEffect(() => {
    setForm({
      ...emptyLesson,
      ...(lesson || {}),
      groupId: lesson?.groupId || lesson?.groupId === "" ? lesson.groupId : groups[0]?.id || "",
      blocks: lesson?.blocks?.length ? lesson.blocks : defaultBlocks(),
    });
  }, [lesson, groups]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateBlock = (blockId, patch) => {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
    }));
  };

  const addBlock = () => {
    setForm((current) => ({
      ...current,
      blocks: [...current.blocks, createBlock("практика")],
    }));
  };

  const removeBlock = (blockId) => {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== blockId),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const blocks = form.blocks.map((block) => ({
      ...block,
      duration: Math.max(1, Number(block.duration || 1)),
      materials: block.materials || [],
    }));
    const duration = blocks.reduce((sum, block) => sum + Number(block.duration || 0), 0);

    onSubmit({
      ...form,
      id: form.id || `lesson-${Date.now()}`,
      title: form.title.trim() || form.topic.trim() || "Новый урок",
      topic: form.topic.trim(),
      goal: form.goal.trim(),
      duration,
      blocks,
    });
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label>
          Название урока
          <input value={form.title} required onChange={(event) => updateField("title", event.target.value)} />
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
          Дата
          <input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
        </label>
        <label>
          Время
          <input type="time" value={form.startTime} onChange={(event) => updateField("startTime", event.target.value)} />
        </label>
        <label>
          Тема
          <input value={form.topic} onChange={(event) => updateField("topic", event.target.value)} />
        </label>
        <label>
          Цель
          <input value={form.goal || ""} onChange={(event) => updateField("goal", event.target.value)} />
        </label>
      </div>

      <div className="builder-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Блоки</span>
            <h3>{form.blocks.length} этапов</h3>
          </div>
          <button className="button button--ghost button--compact" type="button" onClick={addBlock}>
            Добавить
          </button>
        </div>

        <div className="lesson-form-blocks">
          {form.blocks.map((block, index) => (
            <article className="lesson-form-block" key={block.id}>
              <div className="lesson-form-block__top">
                <strong>{index + 1}</strong>
                <select value={block.type} onChange={(event) => updateBlock(block.id, { type: event.target.value, title: event.target.value })}>
                  {lessonBlockTypes.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={block.duration}
                  aria-label="Минуты"
                  onChange={(event) => updateBlock(block.id, { duration: event.target.value })}
                />
                <button className="icon-button" type="button" onClick={() => removeBlock(block.id)} aria-label="Удалить блок">
                  ×
                </button>
              </div>
              <input value={block.title} placeholder="Название" onChange={(event) => updateBlock(block.id, { title: event.target.value })} />
              <textarea rows={2} value={block.description} placeholder="Описание" onChange={(event) => updateBlock(block.id, { description: event.target.value })} />
              <input
                value={toMaterialsText(block.materials)}
                placeholder="Материалы через запятую"
                onChange={(event) => updateBlock(block.id, { materials: splitMaterials(event.target.value) })}
              />
              <input
                value={block.teacherNotes || ""}
                placeholder="Заметка преподавателя"
                onChange={(event) => updateBlock(block.id, { teacherNotes: event.target.value })}
              />
            </article>
          ))}
        </div>
      </div>

      <div className="split-actions">
        <button className="button" type="submit">
          Сохранить урок
        </button>
        <button className="button button--ghost" type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
