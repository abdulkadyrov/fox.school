import { useMemo, useState } from "react";
import Card from "../components/Card";
import Icon from "../components/Icon";
import foxTrophy from "../assets/mascot/fox-trophy.png";
import { buildRating } from "../utils/scoreHelpers";

export default function RatingPage({ data }) {
  const [scope, setScope] = useState("overall");
  const [groupId, setGroupId] = useState("all");

  const rating = useMemo(() => {
    const baseStudents =
      groupId === "all" ? data.students : data.students.filter((student) => student.groupId === groupId);
    return buildRating(baseStudents, data.gameResults);
  }, [data.students, data.gameResults, groupId]);

  return (
    <div className="page rating-page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Рейтинг</span>
          <h1>Баллы, звезды и уровни</h1>
        </div>
        <div className="segmented">
          <button className={scope === "week" ? "is-active" : ""} type="button" onClick={() => setScope("week")}>Неделя</button>
          <button className={scope === "month" ? "is-active" : ""} type="button" onClick={() => setScope("month")}>Месяц</button>
          <button className={scope === "overall" ? "is-active" : ""} type="button" onClick={() => setScope("overall")}>Общий</button>
        </div>
      </div>

      <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
        <option value="all">Все группы</option>
        {data.groups.map((group) => (
          <option value={group.id} key={group.id}>{group.name}</option>
        ))}
      </select>

      <section className="leader-card">
        <div>
          <span className="eyebrow">Топ ученик</span>
          <h2>{rating[0]?.fullName}</h2>
          <p>{rating[0]?.computedLevel} · {rating[0]?.totalScore} баллов</p>
        </div>
        <img src={foxTrophy} alt="" />
      </section>

      <Card>
        <div className="rating-table">
          {rating.map((student, index) => {
            const group = data.groups.find((item) => item.id === student.groupId);
            return (
              <div className="rating-table__row" key={student.id}>
                <span className="rank">#{index + 1}</span>
                <div className="avatar avatar--mini" style={{ "--avatar": student.avatarColor }}>{student.fullName[0]}</div>
                <div>
                  <strong>{student.fullName}</strong>
                  <small>{group?.name} · {student.computedLevel}</small>
                </div>
                <span className="stars">{"★".repeat(student.stars)}</span>
                <em>{student.totalScore}</em>
                <Icon name="rating" size={22} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
