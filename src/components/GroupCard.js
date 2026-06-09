import Card from "./Card";
import Icon from "./Icon";
import { getGroupAverageProgress } from "../utils/scoreHelpers";

export default function GroupCard({ group, students, materials, onOpen, onStartLesson }) {
  const groupStudents = students.filter((student) => group.studentIds.includes(student.id));
  const progress = getGroupAverageProgress(group, students);

  return (
    <Card className="group-card">
      <div className="group-card__header">
        <div>
          <span className="eyebrow">{group.direction}</span>
          <h3>{group.name}</h3>
          <p>{group.age} · {group.schedule}</p>
        </div>
        <Icon name="group" size={34} />
      </div>

      <div className="progress-line" aria-label={`Прогресс ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <dl className="mini-stats">
        <div>
          <dt>Ученики</dt>
          <dd>{groupStudents.length}/{group.maxStudents}</dd>
        </div>
        <div>
          <dt>Тема</dt>
          <dd>{group.currentTopic}</dd>
        </div>
        <div>
          <dt>Материалы</dt>
          <dd>{materials.filter((material) => group.materialIds.includes(material.id)).length}</dd>
        </div>
      </dl>

      <div className="avatar-stack">
        {groupStudents.map((student) => (
          <span className="avatar avatar--mini" key={student.id} style={{ "--avatar": student.avatarColor }}>
            {student.fullName[0]}
          </span>
        ))}
      </div>

      <div className="split-actions">
        <button className="button button--ghost" type="button" onClick={() => onOpen?.(group)}>
          Открыть
        </button>
        <button className="button" type="button" onClick={() => onStartLesson?.(group)}>
          Начать урок
        </button>
      </div>
    </Card>
  );
}
