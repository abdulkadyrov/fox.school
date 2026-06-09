import Card from "../components/Card";
import Icon from "../components/Icon";
import foxTeacher from "../assets/mascot/fox-teacher.png";
import foxTrophy from "../assets/mascot/fox-trophy.png";
import { formatLessonTime, getTodayIso, minutesToHuman } from "../utils/dateHelpers";
import { buildRating } from "../utils/scoreHelpers";

export default function DashboardPage({ data, onNavigate, onStartLesson }) {
  const todayLessons = data.lessons.filter((lesson) => lesson.date === getTodayIso());
  const nextLesson = todayLessons[0] || data.lessons[0];
  const rating = buildRating(data.students, data.gameResults);
  const homeworkTodo = data.homeworks.filter((homework) => homework.createdAt === getTodayIso()).length;

  const stats = [
    { label: "Сегодня", value: todayLessons.length, icon: "timer", page: "run" },
    { label: "Группы", value: data.groups.length, icon: "group", page: "groups" },
    { label: "Ученики", value: data.students.length, icon: "student", page: "students" },
    { label: "Домашки", value: homeworkTodo, icon: "homework", page: "homework" },
    { label: "Материалы", value: data.materials.length, icon: "material", page: "materials" },
    { label: "Рейтинг", value: rating[0]?.totalScore || 0, icon: "rating", page: "rating" },
  ];

  return (
    <div className="page dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <span className="eyebrow">TeacherOS / Foxy Teacher</span>
          <h1>Добрый день, {data.settings.teacherName}</h1>
          <p>Сегодня в фокусе: уроки, игра, результат, домашка и сообщение родителям.</p>
          <div className="quick-actions">
            <button className="button" type="button" onClick={() => onNavigate("planner")}>
              <Icon name="lesson" size={20} /> Создать урок
            </button>
            <button className="button button--soft" type="button" onClick={() => onNavigate("homework")}>
              <Icon name="homework" size={20} /> Создать домашку
            </button>
            <button className="button button--ghost" type="button" onClick={() => onNavigate("materials")}>
              Материалы
            </button>
            <button className="button button--ghost" type="button" onClick={() => onNavigate("games")}>
              Игры
            </button>
            <button className="button button--ghost" type="button" onClick={() => onNavigate("reports")}>
              Отчет
            </button>
          </div>
        </div>
        <img src={foxTeacher} alt="" />
      </section>

      <div className="stat-grid">
        {stats.map((stat) => (
          <button className="stat-card" type="button" key={stat.label} onClick={() => onNavigate(stat.page)}>
            <Icon name={stat.icon} size={26} />
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </button>
        ))}
      </div>

      <div className="content-grid content-grid--wide">
        <Card className="today-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Сегодня</span>
              <h2>Занятия</h2>
            </div>
            <button className="button button--ghost button--compact" type="button" onClick={() => onNavigate("planner")}>
              План
            </button>
          </div>
          <div className="timeline-list">
            {todayLessons.map((lesson) => {
              const group = data.groups.find((item) => item.id === lesson.groupId);
              return (
                <button className="timeline-item" type="button" key={lesson.id} onClick={() => onStartLesson(lesson.id)}>
                  <time>{lesson.startTime}</time>
                  <div>
                    <strong>{lesson.title}</strong>
                    <span>{group?.name} · {minutesToHuman(lesson.duration)}</span>
                  </div>
                  <Icon name="timer" size={24} />
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="next-lesson-card" tone="mint">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Ближайший урок</span>
              <h2>{nextLesson?.title}</h2>
            </div>
            <Icon name="lesson" size={32} />
          </div>
          <p>{formatLessonTime(nextLesson?.date, nextLesson?.startTime)}</p>
          <div className="block-preview">
            {nextLesson?.blocks.slice(0, 4).map((block) => (
              <span key={block.id}>{block.title}</span>
            ))}
          </div>
          <button className="button button--wide" type="button" onClick={() => onStartLesson(nextLesson?.id)}>
            Начать урок
          </button>
        </Card>
      </div>

      <div className="content-grid">
        <Card>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Топ</span>
              <h2>Рейтинг</h2>
            </div>
            <img className="mini-mascot" src={foxTrophy} alt="" />
          </div>
          <div className="rating-list">
            {rating.slice(0, 4).map((student, index) => (
              <div className="rating-row" key={student.id}>
                <span>#{index + 1}</span>
                <strong>{student.fullName}</strong>
                <em>{student.totalScore}</em>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="section-heading">
            <div>
              <span className="eyebrow">WhatsApp</span>
              <h2>Готово к отправке</h2>
            </div>
            <Icon name="homework" size={30} />
          </div>
          {data.homeworks.slice(0, 3).map((homework) => (
            <div className="plain-row" key={homework.id}>
              <span>{homework.title}</span>
              <button className="button button--ghost button--compact" type="button" onClick={() => onNavigate("homework")}>
                Открыть
              </button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
