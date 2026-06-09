import { useMemo, useState } from "react";
import Card from "../components/Card";
import Modal from "../components/Modal";
import StudentCard from "../components/StudentCard";
import { buildRating } from "../utils/scoreHelpers";

export default function StudentsPage({ data, onAddNote, onAddWeakTopic, onUploadPhoto, onRemovePhoto }) {
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const rating = useMemo(() => buildRating(data.students, data.gameResults), [data.students, data.gameResults]);
  const filteredStudents =
    groupFilter === "all" ? data.students : data.students.filter((student) => student.groupId === groupFilter);

  const selectedGroup = selectedStudent
    ? data.groups.find((group) => group.id === selectedStudent.groupId)
    : null;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Ученики</span>
          <h1>Карточки, фото и слабые темы</h1>
        </div>
        <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
          <option value="all">Все группы</option>
          {data.groups.map((group) => (
            <option value={group.id} key={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      <div className="card-grid">
        {filteredStudents.map((student) => {
          const group = data.groups.find((item) => item.id === student.groupId);
          const rank = rating.findIndex((item) => item.id === student.id) + 1;
          return (
            <StudentCard
              key={student.id}
              student={student}
              group={group}
              rank={rank}
              onSelect={setSelectedStudent}
              onAddWeakTopic={onAddWeakTopic}
              onUploadPhoto={onUploadPhoto}
              onRemovePhoto={onRemovePhoto}
            />
          );
        })}
      </div>

      <Modal title={selectedStudent?.fullName} isOpen={Boolean(selectedStudent)} onClose={() => setSelectedStudent(null)}>
        {selectedStudent && (
          <div className="drawer-content">
            <div className="detail-strip">
              <span>{selectedStudent.age} лет</span>
              <strong>{selectedStudent.grade}</strong>
              <span>{selectedGroup?.name}</span>
            </div>

            <Card className="inner-card">
              <h3>Контакт родителя</h3>
              <p>{selectedStudent.parentPhone}</p>
            </Card>

            <div className="metric-grid">
              <Card className="inner-card"><span>Посещаемость</span><strong>{selectedStudent.attendance}%</strong></Card>
              <Card className="inner-card"><span>Поведение</span><strong>{selectedStudent.behavior}%</strong></Card>
              <Card className="inner-card"><span>Активность</span><strong>{selectedStudent.activity}%</strong></Card>
              <Card className="inner-card"><span>Домашки</span><strong>{selectedStudent.homeworkRate}%</strong></Card>
            </div>

            <Card className="inner-card">
              <div className="section-heading">
                <h3>Заметки</h3>
                <button className="button button--ghost button--compact" type="button" onClick={() => onAddNote(selectedStudent.id)}>
                  Добавить
                </button>
              </div>
              {selectedStudent.notes.map((note) => (
                <p className="note-line" key={note}>{note}</p>
              ))}
            </Card>

            <Card className="inner-card">
              <div className="section-heading">
                <h3>Слабые темы</h3>
                <button className="button button--soft button--compact" type="button" onClick={() => onAddWeakTopic(selectedStudent.id)}>
                  Отметить
                </button>
              </div>
              <div className="tag-row">
                {selectedStudent.weakTopics.map((topic) => (
                  <span className="tag tag--warning" key={topic}>{topic}</span>
                ))}
              </div>
            </Card>

            <Card className="inner-card">
              <h3>История отчетов</h3>
              {data.reports
                .filter((report) => report.studentId === selectedStudent.id)
                .map((report) => (
                  <div className="plain-row" key={report.id}>
                    <span>{report.title}</span>
                    <small>{report.date}</small>
                  </div>
                ))}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
