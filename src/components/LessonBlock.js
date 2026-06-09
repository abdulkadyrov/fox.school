import Icon from "./Icon";
import { minutesToHuman } from "../utils/dateHelpers";

export default function LessonBlock({ block, index, isActive, onEdit, onMove }) {
  return (
    <article
      className={`lesson-block ${isActive ? "is-active" : ""}`}
      draggable
      onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const fromIndex = Number(event.dataTransfer.getData("text/plain"));
        onMove?.(fromIndex, index);
      }}
    >
      <div className="lesson-block__handle" aria-hidden="true">⋮⋮</div>
      <div className="lesson-block__icon">
        <Icon name={block.type === "game" ? "game" : block.type === "homework" ? "homework" : "lesson"} size={24} />
      </div>
      <div className="lesson-block__body">
        <div className="lesson-block__top">
          <h3>{block.title}</h3>
          <span>{minutesToHuman(block.duration)}</span>
        </div>
        <p>{block.description}</p>
        <div className="tag-row">
          {block.materials.map((material) => (
            <span className="tag" key={material}>{material}</span>
          ))}
        </div>
        {block.teacherNotes && <small>{block.teacherNotes}</small>}
      </div>
      <button className="icon-button" type="button" onClick={() => onEdit?.(block)} aria-label="Редактировать блок">
        ✎
      </button>
    </article>
  );
}
