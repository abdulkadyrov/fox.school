import { useState } from "react";
import Card from "../components/Card";
import GroupCard from "../components/GroupCard";
import GroupForm from "../components/GroupForm";
import Modal from "../components/Modal";
import Icon from "../components/Icon";

export default function GroupsPage({ data, onSaveGroup, onStartLesson, onNavigate }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  const selectedGroupRecord = selectedGroup
    ? data.groups.find((group) => group.id === selectedGroup.id) || selectedGroup
    : null;

  const groupStudents = selectedGroupRecord
    ? data.students.filter((student) => selectedGroupRecord.studentIds.includes(student.id))
    : [];
  const groupMaterials = selectedGroupRecord
    ? data.materials.filter((material) => selectedGroupRecord.materialIds.includes(material.id))
    : [];
  const groupHomeworks = selectedGroupRecord
    ? data.homeworks.filter((homework) => homework.groupId === selectedGroupRecord.id)
    : [];
  const groupReports = selectedGroupRecord
    ? data.reports.filter((report) => report.groupId === selectedGroupRecord.id)
    : [];

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Группы</span>
          <h1>Направления и расписание</h1>
        </div>
        <div className="split-actions split-actions--top">
          <button className="button button--ghost" type="button" onClick={() => onNavigate("planner")}>
            <Icon name="lesson" size={20} /> Программа
          </button>
          <button className="button" type="button" onClick={() => setEditingGroup({})}>
            <Icon name="group" size={20} /> Добавить
          </button>
        </div>
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

      <Modal title={selectedGroupRecord?.name} isOpen={Boolean(selectedGroupRecord)} onClose={() => setSelectedGroup(null)}>
        {selectedGroupRecord && (
          <div className="drawer-content">
            <div className="detail-strip">
              <span>{selectedGroupRecord.direction}</span>
              <strong>{selectedGroupRecord.age}</strong>
              <span>{selectedGroupRecord.schedule}</span>
            </div>

            <Card className="inner-card">
              <div className="section-heading">
                <div>
                  <h3>Текущая тема</h3>
                  <p>{selectedGroupRecord.currentTopic}</p>
                </div>
                <button className="button button--ghost button--compact" type="button" onClick={() => setEditingGroup(selectedGroupRecord)}>
                  Редактировать
                </button>
              </div>
              <div className="progress-line">
                <span style={{ width: `${selectedGroupRecord.progress}%` }} />
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

      <Modal
        title={editingGroup?.id ? "Редактировать группу" : "Новая группа"}
        isOpen={Boolean(editingGroup)}
        onClose={() => setEditingGroup(null)}
      >
        <GroupForm
          group={editingGroup?.id ? editingGroup : null}
          students={data.students}
          onCancel={() => setEditingGroup(null)}
          onSubmit={(group) => {
            onSaveGroup(group);
            setEditingGroup(null);
          }}
        />
      </Modal>
    </div>
  );
}
