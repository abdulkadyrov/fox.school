import { useState } from "react";
import Card from "../components/Card";
import ReportCard from "../components/ReportCard";

export default function ReportsPage({ data, onCreateReport, onExportReport, onPrepareReportWhatsApp }) {
  const [type, setType] = useState("student");
  const [groupId, setGroupId] = useState(data.groups[0]?.id || "");
  const [studentId, setStudentId] = useState(data.students[0]?.id || "");
  const [comment, setComment] = useState("Рекомендую закрепить тему через короткие задания и карточки.");

  const groupStudents = data.students.filter((student) => student.groupId === groupId);

  const createAutoReport = () => {
    onCreateReport({
      id: `report-${Date.now()}`,
      type,
      groupId,
      studentId: type === "student" ? studentId : "",
      date: new Date().toISOString().slice(0, 10),
      title: type === "student" ? "Автоотчет ученика" : "Автоотчет группы",
      covered: "Повторение темы, практика, игра и домашнее задание.",
      activity: "Активность хорошая, результаты зафиксированы в рейтинге.",
      homework: "Домашнее задание подготовлено для PDF и WhatsApp.",
      behavior: "Рабочая атмосфера.",
      weakTopics: type === "student" ? data.students.find((student) => student.id === studentId)?.weakTopics || [] : ["общий прогресс"],
      strengths: ["устная практика", "игровая активность"],
      recommendation: comment,
      teacherComment: comment,
    });
  };

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Отчеты</span>
          <h1>Для родителей и преподавателя</h1>
        </div>
      </div>

      <div className="content-grid content-grid--wide">
        <Card>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Автоотчет</span>
              <h2>Редактируемый шаблон</h2>
            </div>
          </div>
          <div className="field-grid">
            <label>
              Тип
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="student">Ученик</option>
                <option value="group">Группа</option>
              </select>
            </label>
            <label>
              Группа
              <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
                {data.groups.map((group) => (
                  <option value={group.id} key={group.id}>{group.name}</option>
                ))}
              </select>
            </label>
            {type === "student" && (
              <label>
                Ученик
                <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
                  {groupStudents.map((student) => (
                    <option value={student.id} key={student.id}>{student.fullName}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <label>
            Комментарий учителя
            <textarea rows={4} value={comment} onChange={(event) => setComment(event.target.value)} />
          </label>
          <button className="button button--wide" type="button" onClick={createAutoReport}>
            Создать отчет
          </button>
        </Card>

        <Card>
          <h2>Шаблон включает</h2>
          <div className="tag-row">
            {["что прошли", "активность", "домашка", "поведение", "слабые темы", "сильные стороны", "рекомендация", "комментарий"].map((item) => (
              <span className="tag tag--soft" key={item}>{item}</span>
            ))}
          </div>
        </Card>
      </div>

      <div className="card-grid">
        {data.reports.map((report) => {
          const group = data.groups.find((item) => item.id === report.groupId);
          const student = data.students.find((item) => item.id === report.studentId);
          return (
            <ReportCard
              key={report.id}
              report={report}
              group={group}
              student={student}
              onExport={onExportReport}
              onWhatsApp={onPrepareReportWhatsApp}
            />
          );
        })}
      </div>
    </div>
  );
}
