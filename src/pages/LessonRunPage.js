import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Icon from "../components/Icon";
import LessonBlock from "../components/LessonBlock";
import { minutesToHuman, secondsToClock } from "../utils/dateHelpers";

export default function LessonRunPage({ data, currentLessonId, onNavigate, onMarkActivity, onAddLessonNote }) {
  const lesson = data.lessons.find((item) => item.id === currentLessonId) || data.lessons[0];
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [blockSecondsLeft, setBlockSecondsLeft] = useState((lesson?.blocks[0]?.duration || 0) * 60);

  const group = data.groups.find((item) => item.id === lesson?.groupId);
  const groupStudents = data.students.filter((student) => group?.studentIds.includes(student.id));
  const activeBlock = lesson?.blocks[activeBlockIndex];
  const nextBlock = lesson?.blocks[activeBlockIndex + 1];

  useEffect(() => {
    setActiveBlockIndex(0);
    setIsPaused(true);
    setBlockSecondsLeft((lesson?.blocks[0]?.duration || 0) * 60);
  }, [lesson?.id]);

  useEffect(() => {
    if (isPaused || !activeBlock) return undefined;
    const interval = window.setInterval(() => {
      setBlockSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isPaused, activeBlock]);

  const remainingTotal = useMemo(() => {
    const rest = lesson?.blocks
      .slice(activeBlockIndex + 1)
      .reduce((sum, block) => sum + Number(block.duration || 0) * 60, 0);
    return blockSecondsLeft + (rest || 0);
  }, [lesson, activeBlockIndex, blockSecondsLeft]);

  const goNext = () => {
    const nextIndex = Math.min(activeBlockIndex + 1, lesson.blocks.length - 1);
    setActiveBlockIndex(nextIndex);
    setBlockSecondsLeft((lesson.blocks[nextIndex]?.duration || 0) * 60);
    setIsPaused(true);
  };

  return (
    <div className="page lesson-run-page">
      <section className="run-hero">
        <div>
          <span className="eyebrow">{group?.name}</span>
          <h1>{lesson?.title}</h1>
          <p>{minutesToHuman(lesson?.duration || 0)} · {lesson?.topic}</p>
        </div>
        <div className="timer-orb">
          <span>Всего</span>
          <strong>{secondsToClock(remainingTotal)}</strong>
        </div>
      </section>

      <div className="content-grid content-grid--wide">
        <Card className="current-block-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Текущий блок</span>
              <h2>{activeBlock?.title}</h2>
            </div>
            <div className="timer-chip">
              <Icon name="timer" size={22} />
              {secondsToClock(blockSecondsLeft)}
            </div>
          </div>
          <p>{activeBlock?.description}</p>
          <div className="tag-row">
            {activeBlock?.materials.map((material) => (
              <span className="tag" key={material}>{material}</span>
            ))}
          </div>
          <div className="split-actions">
            <button className="button" type="button" onClick={goNext} disabled={activeBlockIndex >= lesson.blocks.length - 1}>
              Следующий этап
            </button>
            <button className="button button--soft" type="button" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? "Старт" : "Пауза"}
            </button>
            <button className="button button--ghost" type="button" onClick={() => onNavigate("materials")}>
              Материалы
            </button>
            <button className="button button--ghost" type="button" onClick={() => onNavigate("games")}>
              Игра
            </button>
            <button className="button button--ghost" type="button" onClick={() => onAddLessonNote(lesson.id)}>
              Заметка
            </button>
          </div>
        </Card>

        <Card>
          <span className="eyebrow">Следующий блок</span>
          <h2>{nextBlock?.title || "Финиш"}</h2>
          <p>{nextBlock?.description || "Урок готов к завершению и отчету."}</p>
          <div className="lesson-block-list lesson-block-list--compact">
            {lesson?.blocks.map((block, index) => (
              <LessonBlock block={block} index={index} key={block.id} isActive={index === activeBlockIndex} />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Активность</span>
            <h2>Отметить ученика</h2>
          </div>
        </div>
        <div className="activity-grid">
          {groupStudents.map((student) => (
            <button className="activity-button" type="button" key={student.id} onClick={() => onMarkActivity(student.id, 5)}>
              <span className="avatar avatar--mini" style={{ "--avatar": student.avatarColor }}>{student.fullName[0]}</span>
              <strong>{student.fullName}</strong>
              <small>+5</small>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
