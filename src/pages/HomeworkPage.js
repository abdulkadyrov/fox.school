import Card from "../components/Card";
import HomeworkBuilder from "../components/HomeworkBuilder";
import Icon from "../components/Icon";
import { formatDate } from "../utils/dateHelpers";

export default function HomeworkPage({
  data,
  onCreateHomework,
  onExportHomework,
  onShareHomework,
  onPrepareWhatsApp,
  onExportWord,
}) {
  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Домашние задания</span>
          <h1>Конструктор PDF и WhatsApp</h1>
        </div>
      </div>

      <div className="content-grid content-grid--wide">
        <Card>
          <HomeworkBuilder
            groups={data.groups}
            students={data.students}
            materials={data.materials}
            onCreate={onCreateHomework}
          />
        </Card>

        <Card>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Предпросмотр</span>
              <h2>Последние домашки</h2>
            </div>
            <Icon name="homework" size={30} />
          </div>
          <div className="homework-list">
            {data.homeworks.map((homework) => {
              const group = data.groups.find((item) => item.id === homework.groupId);
              const student = data.students.find((item) => item.id === homework.studentId);
              return (
                <article className="homework-item" key={homework.id}>
                  <div>
                    <h3>{homework.title}</h3>
                    <p>{student?.fullName || group?.name} · {formatDate(homework.createdAt)}</p>
                  </div>
                  <div className="tag-row">
                    <span className="tag">{homework.mode}</span>
                    <span className="tag tag--soft">{homework.topic}</span>
                  </div>
                  <ol>
                    {homework.tasks.slice(0, 3).map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ol>
                  <div className="split-actions">
                    <button className="button button--ghost" type="button" onClick={() => onPrepareWhatsApp(homework)}>
                      WhatsApp
                    </button>
                    <button className="button button--ghost" type="button" onClick={() => onExportWord(homework)}>
                      Word
                    </button>
                    <button className="button button--soft" type="button" onClick={() => onShareHomework(homework)}>
                      Поделиться
                    </button>
                    <button className="button" type="button" onClick={() => onExportHomework(homework)}>
                      PDF
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
