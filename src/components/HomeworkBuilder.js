import { useMemo, useState } from "react";
import FileUploader from "./FileUploader";
import { homeworkModes, homeworkRecommendations } from "../data/templates";
import { makeSafeFileName } from "../utils/fileHelpers";

const emptyTask = "";

export default function HomeworkBuilder({ groups, students, materials, onCreate, initialGroupId = "" }) {
  const [mode, setMode] = useState("group");
  const [groupId, setGroupId] = useState(initialGroupId || groups[0]?.id || "");
  const [studentId, setStudentId] = useState("");
  const [topic, setTopic] = useState("Present Simple");
  const [tasks, setTasks] = useState(["Повторить слова", "Сделать упражнение"]);
  const [words, setWords] = useState("wake up, go to school, play");
  const [teacherComment, setTeacherComment] = useState("");
  const [materialIds, setMaterialIds] = useState([]);

  const selectedGroup = groups.find((group) => group.id === groupId);
  const groupStudents = students.filter((student) => student.groupId === groupId);
  const selectedStudent = students.find((student) => student.id === studentId);

  const recommendations = useMemo(() => {
    if (!selectedStudent) return [];
    return selectedStudent.weakTopics.flatMap((topicName) => homeworkRecommendations[topicName] || []);
  }, [selectedStudent]);

  const whatsappText = useMemo(() => {
    if (mode === "individual" && selectedStudent) {
      return `Здравствуйте!\nДомашнее задание для ${selectedStudent.fullName}.\nТема: ${topic}.\nНужно выполнить задания из PDF и повторить слова.`;
    }

    return `Здравствуйте!\nДомашнее задание для группы ${selectedGroup?.name || ""}.\nТема: ${topic}.\nНужно выполнить задания из PDF и повторить слова.`;
  }, [mode, selectedGroup, selectedStudent, topic]);

  const pdfFileName =
    mode === "individual" && selectedStudent
      ? `${makeSafeFileName(selectedStudent.fullName)}_Домашка_${makeSafeFileName(topic)}`
      : `${makeSafeFileName(selectedGroup?.name || "Group")}_Домашка_${makeSafeFileName(topic)}`;

  const createHomework = () => {
    const homework = {
      id: `homework-${Date.now()}`,
      title: `Домашка: ${topic}`,
      mode,
      groupId,
      studentId: mode === "group" ? "" : studentId,
      topic,
      dueDate: new Date().toISOString().slice(0, 10),
      tasks: tasks.filter(Boolean),
      words: words.split(",").map((word) => word.trim()).filter(Boolean),
      materials: materialIds,
      teacherComment,
      whatsappText,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCreate?.(homework, pdfFileName);
  };

  return (
    <div className="homework-builder">
      <div className="field-grid">
        <label>
          Режим
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            {homeworkModes.map((item) => (
              <option value={item.value} key={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          Группа
          <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
            {groups.map((group) => (
              <option value={group.id} key={group.id}>{group.name}</option>
            ))}
          </select>
        </label>
        {mode !== "group" && (
          <label>
            Ученик
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value="">Выберите ученика</option>
              {groupStudents.map((student) => (
                <option value={student.id} key={student.id}>{student.fullName}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Тема
          <input value={topic} onChange={(event) => setTopic(event.target.value)} />
        </label>
      </div>

      <div className="builder-section">
        <div className="section-heading">
          <h3>Задания</h3>
          <button className="button button--ghost button--compact" type="button" onClick={() => setTasks([...tasks, emptyTask])}>
            Добавить
          </button>
        </div>
        {tasks.map((task, index) => (
          <input
            key={`${index}-${tasks.length}`}
            value={task}
            placeholder={`Задание ${index + 1}`}
            onChange={(event) => setTasks(tasks.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
          />
        ))}
      </div>

      <label>
        Список слов
        <textarea value={words} onChange={(event) => setWords(event.target.value)} rows={3} />
      </label>

      {recommendations.length > 0 && (
        <div className="recommendation-box">
          <strong>Рекомендации</strong>
          <div className="tag-row">
            {recommendations.map((item) => (
              <button
                className="tag tag--button"
                type="button"
                key={item}
                onClick={() => setTasks([...tasks, item])}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="builder-section">
        <div className="section-heading">
          <h3>Материалы</h3>
          <FileUploader
            compact
            onUploaded={(record) => {
              setMaterialIds([...materialIds, record.name]);
            }}
          />
        </div>
        <div className="material-picker">
          {materials
            .filter((material) => !groupId || material.groupId === groupId || !material.groupId)
            .map((material) => (
              <label className="check-pill" key={material.id}>
                <input
                  type="checkbox"
                  checked={materialIds.includes(material.id)}
                  onChange={(event) => {
                    setMaterialIds(
                      event.target.checked
                        ? [...materialIds, material.id]
                        : materialIds.filter((id) => id !== material.id)
                    );
                  }}
                />
                {material.title}
              </label>
            ))}
        </div>
      </div>

      <label>
        Комментарий преподавателя
        <textarea value={teacherComment} onChange={(event) => setTeacherComment(event.target.value)} rows={3} />
      </label>

      <div className="preview-panel">
        <span className="eyebrow">PDF preview</span>
        <h3>{pdfFileName}.pdf</h3>
        <p>{whatsappText}</p>
      </div>

      <button className="button button--wide" type="button" onClick={createHomework}>
        Подготовить PDF и WhatsApp
      </button>
    </div>
  );
}
