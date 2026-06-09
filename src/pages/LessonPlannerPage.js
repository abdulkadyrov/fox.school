import { useMemo, useState } from "react";
import Card from "../components/Card";
import Icon from "../components/Icon";
import LessonBlock from "../components/LessonBlock";
import { lessonBlockTypes } from "../data/templates";
import { minutesToHuman } from "../utils/dateHelpers";

const moveItem = (items, fromIndex, toIndex) => {
  const nextItems = [...items];
  const [removed] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, removed);
  return nextItems;
};

export default function LessonPlannerPage({ data, onUpdateLesson, onDuplicateLesson, onStartLesson }) {
  const [selectedLessonId, setSelectedLessonId] = useState(data.lessons[0]?.id || "");
  const [programMode, setProgramMode] = useState("week");
  const selectedLesson = data.lessons.find((lesson) => lesson.id === selectedLessonId) || data.lessons[0];
  const selectedGroup = data.groups.find((group) => group.id === selectedLesson?.groupId);

  const totalDuration = useMemo(
    () => selectedLesson?.blocks.reduce((sum, block) => sum + Number(block.duration || 0), 0) || 0,
    [selectedLesson]
  );

  const updateBlocks = (blocks) => {
    onUpdateLesson({ ...selectedLesson, blocks });
  };

  const editBlock = (block) => {
    const title = window.prompt("Название блока", block.title);
    if (!title) return;
    const duration = Number(window.prompt("Длительность в минутах", block.duration) || block.duration);
    const description = window.prompt("Описание", block.description) || block.description;
    updateBlocks(
      selectedLesson.blocks.map((item) =>
        item.id === block.id ? { ...item, title, duration, description } : item
      )
    );
  };

  const addBlock = () => {
    const type = window.prompt("Тип блока", lessonBlockTypes[0]) || "практика";
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      title: type,
      duration: 10,
      description: "Новый блок урока",
      materials: [],
      teacherNotes: "",
    };
    updateBlocks([...selectedLesson.blocks, newBlock]);
  };

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Программа</span>
          <h1>Планирование обучения и уроков</h1>
        </div>
        <div className="segmented">
          <button className={programMode === "week" ? "is-active" : ""} type="button" onClick={() => setProgramMode("week")}>Неделя</button>
          <button className={programMode === "month" ? "is-active" : ""} type="button" onClick={() => setProgramMode("month")}>Месяц</button>
        </div>
      </div>

      <div className="content-grid content-grid--wide">
        <Card>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Направления</span>
              <h2>Учебная программа</h2>
            </div>
            <Icon name="lesson" size={30} />
          </div>
          <div className="program-list">
            {data.programs
              .filter((program) => program.period === programMode)
              .map((program) => (
                <article className="program-card" key={program.id}>
                  <h3>{program.title}</h3>
                  <p>{program.direction}</p>
                  <div className="tag-row">
                    {program.topics.map((topic) => (
                      <span className="tag" key={topic}>{topic}</span>
                    ))}
                  </div>
                  <div className="block-preview">
                    {program.lessons.map((lesson) => (
                      <span key={lesson.title}>{lesson.title}</span>
                    ))}
                  </div>
                </article>
              ))}
          </div>
        </Card>

        <Card>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Шаблоны</span>
              <h2>Блоки урока</h2>
            </div>
          </div>
          <div className="tag-row">
            {lessonBlockTypes.map((type) => (
              <span className="tag tag--soft" key={type}>{type}</span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="lesson-planner-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{selectedGroup?.name}</span>
            <h2>Конструктор урока</h2>
          </div>
          <select value={selectedLessonId} onChange={(event) => setSelectedLessonId(event.target.value)}>
            {data.lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>{lesson.title}</option>
            ))}
          </select>
        </div>

        <div className="lesson-summary">
          <span>{selectedLesson?.topic}</span>
          <strong>{minutesToHuman(totalDuration)}</strong>
          <span>{selectedLesson?.blocks.length} блоков</span>
        </div>

        <div className="lesson-block-list">
          {selectedLesson?.blocks.map((block, index) => (
            <LessonBlock
              key={block.id}
              block={block}
              index={index}
              onEdit={editBlock}
              onMove={(fromIndex, toIndex) => updateBlocks(moveItem(selectedLesson.blocks, fromIndex, toIndex))}
            />
          ))}
        </div>

        <div className="split-actions">
          <button className="button button--ghost" type="button" onClick={addBlock}>
            Добавить блок
          </button>
          <button className="button button--soft" type="button" onClick={() => onDuplicateLesson(selectedLesson.id)}>
            Копировать урок
          </button>
          <button className="button" type="button" onClick={() => onStartLesson(selectedLesson.id)}>
            Начать урок
          </button>
        </div>
      </Card>
    </div>
  );
}
