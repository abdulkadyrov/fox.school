import Card from "./Card";
import Icon from "./Icon";
import { starCount } from "../utils/scoreHelpers";

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export default function StudentCard({ student, group, rank, onSelect, onAddWeakTopic, onUploadPhoto, onRemovePhoto }) {
  return (
    <Card className="student-card">
      <button className="student-card__main" type="button" onClick={() => onSelect?.(student)}>
        <div className="avatar" style={{ "--avatar": student.avatarColor }}>
          {student.photoDataUrl ? <img src={student.photoDataUrl} alt={student.fullName} /> : initials(student.fullName)}
        </div>
        <div>
          <h3>{student.fullName}</h3>
          <p>{student.age} лет · {student.grade} · {group?.name}</p>
        </div>
      </button>

      <div className="student-card__metrics">
        <span><Icon name="rating" size={18} /> #{rank}</span>
        <span>{student.points} баллов</span>
        <span>{"★".repeat(starCount(student.points))}</span>
      </div>

      <div className="tag-row">
        {student.weakTopics.map((topic) => (
          <span className="tag tag--warning" key={topic}>{topic}</span>
        ))}
      </div>

      <div className="student-card__actions">
        <label className="button button--ghost button--compact">
          Фото
          <input type="file" accept="image/*" onChange={(event) => onUploadPhoto?.(student.id, event.target.files?.[0])} />
        </label>
        {student.photoDataUrl && (
          <button className="button button--ghost button--compact" type="button" onClick={() => onRemovePhoto?.(student.id)}>
            Удалить
          </button>
        )}
        <button className="button button--soft button--compact" type="button" onClick={() => onAddWeakTopic?.(student.id)}>
          Слабая тема
        </button>
      </div>
    </Card>
  );
}
