import { useMemo, useState } from "react";
import Card from "../components/Card";
import Modal from "../components/Modal";
import StudentCard from "../components/StudentCard";
import StudentForm from "../components/StudentForm";
import { buildRating } from "../utils/scoreHelpers";

export default function StudentsPage({ data, onAddNote, onAddWeakTopic, onSaveStudent, onUploadPhoto, onRemovePhoto }) {
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const rating = useMemo(() => buildRating(data.students, data.gameResults), [data.students, data.gameResults]);
  const filteredStudents =
    groupFilter === "all" ? data.students : data.students.filter((student) => student.groupId === groupFilter);
  const selectedStudentRecord = selectedStudent
    ? data.students.find((student) => student.id === selectedStudent.id) || selectedStudent
    : null;

  const selectedGroup = selectedStudentRecord
    ? data.groups.find((group) => group.id === selectedStudentRecord.groupId)
    : null;

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Ученики</span>
          <h1>Карточки, фото и слабые темы</h1>
        </div>
        <div className="split-actions split-actions--top">
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
            <option value="all">Все группы</option>
            {data.groups.map((group) => (
              <option value={group.id} key={group.id}>{group.name}</option>
            ))}
          </select>
          <button className="button" type="button" onClick={() => setEditingStudent({ groupId: groupFilter === "all" ? "" : groupFilter })}>
            Добавить
          </button>
        </div>
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

      <Modal title={selectedStudentRecord?.fullName} isOpen={Boolean(selectedStudentRecord)} onClose={() => setSelectedStudent(null)}>
        {selectedStudentRecord && (
          <div className="drawer-content">
            <div className="detail-strip">
              <span>{selectedStudentRecord.age} лет</span>
              <strong>{selectedStudentRecord.grade}</strong>
              <span>{selectedGroup?.name}</span>
            </div>

            <Card className="inner-card">
              <div className="section-heading">
                <div>
                  <h3>Контакт родителя</h3>
                  <p>{selectedStudentRecord.parentPhone || "Не указан"}</p>
                </div>
                <button className="button button--ghost button--compact" type="button" onClick={() => setEditingStudent(selectedStudentRecord)}>
                  Редактировать
                </button>
              </div>
            </Card>

            <div className="metric-grid">
              <Card className="inner-card"><span>Посещаемость</span><strong>{selectedStudentRecord.attendance}%</strong></Card>
              <Card className="inner-card"><span>Поведение</span><strong>{selectedStudentRecord.behavior}%</strong></Card>
              <Card className="inner-card"><span>Активность</span><strong>{selectedStudentRecord.activity}%</strong></Card>
              <Card className="inner-card"><span>Домашки</span><strong>{selectedStudentRecord.homeworkRate}%</strong></Card>
            </div>

            <Card className="inner-card">
              <div className="section-heading">
                <h3>Заметки</h3>
                <button className="button button--ghost button--compact" type="button" onClick={() => onAddNote(selectedStudentRecord.id)}>
                  Добавить
                </button>
              </div>
              {(selectedStudentRecord.notes || []).map((note) => (
                <p className="note-line" key={note}>{note}</p>
              ))}
            </Card>

            <Card className="inner-card">
              <div className="section-heading">
                <h3>Слабые темы</h3>
                <button className="button button--soft button--compact" type="button" onClick={() => onAddWeakTopic(selectedStudentRecord.id)}>
                  Отметить
                </button>
              </div>
              <div className="tag-row">
                {(selectedStudentRecord.weakTopics || []).map((topic) => (
                  <span className="tag tag--warning" key={topic}>{topic}</span>
                ))}
              </div>
            </Card>

            <Card className="inner-card">
              <h3>История отчетов</h3>
              {data.reports
                .filter((report) => report.studentId === selectedStudentRecord.id)
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

      <Modal
        title={editingStudent?.id ? "Редактировать ученика" : "Новый ученик"}
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
      >
        <StudentForm
          student={editingStudent?.id ? editingStudent : editingStudent}
          groups={data.groups}
          onCancel={() => setEditingStudent(null)}
          onSubmit={(student) => {
            onSaveStudent(student);
            setEditingStudent(null);
          }}
        />
      </Modal>
    </div>
  );
}
