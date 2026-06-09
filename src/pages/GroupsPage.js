import { useState } from "react";
import Card from "../components/Card";
import GroupCard from "../components/GroupCard";
import Modal from "../components/Modal";
import Icon from "../components/Icon";

export default function GroupsPage({ data, onStartLesson, onNavigate }) {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const groupStudents = selectedGroup
    ? data.students.filter((student) => selectedGroup.studentIds.includes(student.id))
    : [];
  const groupMaterials = selectedGroup
    ? data.materials.filter((material) => selectedGroup.materialIds.includes(material.id))
    : [];
  const groupHomeworks = selectedGroup
    ? data.homeworks.filter((homework) => homework.groupId === selectedGroup.id)
    : [];
  const groupReports = selectedGroup
    ? data.reports.filter((report) => report.groupId === selectedGroup.id)
    : [];

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Группы</span>
          <h1>Направления и расписание</h1>
        </div>
        <button className="button" type="button" onClick={() => onNavigate("planner")}>
          <Icon name="lesson" size={20} /> Программа
        </button>
      </div>

      <div className="card-grid card-grid--groups">
        {data.groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            students={data.students}
            materials={data.materials}
            onOpen={setSelectedGroup}
            onStartLesson={() => {
              const lesson = data.lessons.find((item) => item.groupId === group.id);
              onStartLesson(lesson?.id);
            }}
          />
        ))}
      </div>

      <Modal title={selectedGroup?.name} isOpen={Boolean(selectedGroup)} onClose={() => setSelectedGroup(null)}>
        {selectedGroup && (
          <div className="drawer-content">
            <div className="detail-strip">
              <span>{selectedGroup.direction}</span>
              <strong>{selectedGroup.age}</strong>
              <span>{selectedGroup.schedule}</span>
            </div>

            <Card className="inner-card">
              <h3>Текущая тема</h3>
              <p>{selectedGroup.currentTopic}</p>
              <div className="progress-line">
                <span style={{ width: `${selectedGroup.progress}%` }} />
              </div>
            </Card>

            <div className="content-grid">
              <Card className="inner-card">
                <h3>Ученики</h3>
                {groupStudents.map((student) => (
                  <div className="plain-row" key={student.id}>
                    <span>{student.fullName}</span>
                    <small>{student.points} баллов</small>
                  </div>
                ))}
              </Card>
              <Card className="inner-card">
                <h3>Материалы</h3>
                {groupMaterials.map((material) => (
                  <div className="plain-row" key={material.id}>
                    <span>{material.title}</span>
                    <small>{material.type}</small>
                  </div>
                ))}
              </Card>
            </div>

            <div className="content-grid">
              <Card className="inner-card">
                <h3>Домашние задания</h3>
                {groupHomeworks.map((homework) => (
                  <div className="plain-row" key={homework.id}>
                    <span>{homework.title}</span>
                    <small>{homework.topic}</small>
                  </div>
                ))}
              </Card>
              <Card className="inner-card">
                <h3>Отчеты</h3>
                {groupReports.map((report) => (
                  <div className="plain-row" key={report.id}>
                    <span>{report.title}</span>
                    <small>{report.date}</small>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
