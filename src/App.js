import { useEffect, useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import SidePanel from "./components/SidePanel";
import DashboardPage from "./pages/DashboardPage";
import GroupsPage from "./pages/GroupsPage";
import StudentsPage from "./pages/StudentsPage";
import LessonPlannerPage from "./pages/LessonPlannerPage";
import LessonRunPage from "./pages/LessonRunPage";
import HomeworkPage from "./pages/HomeworkPage";
import MaterialsPage from "./pages/MaterialsPage";
import GamesPage from "./pages/GamesPage";
import RatingPage from "./pages/RatingPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { navItems } from "./data/navigation";
import { downloadBackup, loadAppData, readBackupFile, resetAppData, saveAppData } from "./data/storage";
import { fileToDataUrl, makeSafeFileName, copyToClipboard, buildWhatsAppUrl } from "./utils/fileHelpers";
import {
  buildGroupReportPdfTemplate,
  buildHomeworkPdfTemplate,
  buildStudentReportPdfTemplate,
  downloadPdf,
  sharePdf,
} from "./utils/pdfExport";

const ACTIVE_PAGE_KEY = "foxy-teacher:active-page";

export default function App() {
  const [data, setData] = useState(() => loadAppData());
  const [activePage, setActivePage] = useState(() => localStorage.getItem(ACTIVE_PAGE_KEY) || "dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState(data.lessons[0]?.id || "");
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [toast, setToast] = useState("");

  const activeLabel = useMemo(
    () => navItems.find((item) => item.id === activePage)?.label || "Главная",
    [activePage]
  );

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_PAGE_KEY, activePage);
  }, [activePage]);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const updateData = (updater) => {
    setData((currentData) => (typeof updater === "function" ? updater(currentData) : updater));
  };

  const navigate = (page) => setActivePage(page);

  const startLesson = (lessonId) => {
    const fallbackId = data.lessons[0]?.id;
    setCurrentLessonId(lessonId || fallbackId);
    setActivePage("run");
  };

  const updateLesson = (lesson) => {
    updateData((currentData) => ({
      ...currentData,
      lessons: currentData.lessons.map((item) => (item.id === lesson.id ? lesson : item)),
    }));
  };

  const duplicateLesson = (lessonId) => {
    const lesson = data.lessons.find((item) => item.id === lessonId);
    if (!lesson) return;

    const duplicatedLesson = {
      ...lesson,
      id: `lesson-${Date.now()}`,
      title: `${lesson.title} copy`,
      blocks: lesson.blocks.map((block) => ({ ...block, id: `${block.id}-${Date.now()}` })),
    };

    updateData((currentData) => ({
      ...currentData,
      lessons: [...currentData.lessons, duplicatedLesson],
    }));
    showToast("Урок скопирован");
  };

  const addStudentNote = (studentId) => {
    const note = window.prompt("Новая заметка");
    if (!note) return;
    updateData((currentData) => ({
      ...currentData,
      students: currentData.students.map((student) =>
        student.id === studentId ? { ...student, notes: [...student.notes, note] } : student
      ),
    }));
  };

  const addWeakTopic = (studentId) => {
    const topic = window.prompt("Слабая тема", "слабая грамматика");
    if (!topic) return;
    updateData((currentData) => ({
      ...currentData,
      students: currentData.students.map((student) =>
        student.id === studentId && !student.weakTopics.includes(topic)
          ? { ...student, weakTopics: [...student.weakTopics, topic] }
          : student
      ),
    }));
  };

  const uploadStudentPhoto = async (studentId, file) => {
    if (!file) return;
    const photoDataUrl = await fileToDataUrl(file);
    updateData((currentData) => ({
      ...currentData,
      students: currentData.students.map((student) =>
        student.id === studentId ? { ...student, photoDataUrl } : student
      ),
    }));
  };

  const removeStudentPhoto = (studentId) => {
    updateData((currentData) => ({
      ...currentData,
      students: currentData.students.map((student) =>
        student.id === studentId ? { ...student, photoDataUrl: "" } : student
      ),
    }));
  };

  const markActivity = (studentId, points) => {
    updateData((currentData) => ({
      ...currentData,
      students: currentData.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              points: Number(student.points || 0) + points,
              activity: Math.min(100, Number(student.activity || 0) + 2),
            }
          : student
      ),
    }));
    showToast("+5 баллов за активность");
  };

  const addLessonNote = (lessonId) => {
    const note = window.prompt("Заметка к уроку");
    if (!note) return;
    updateData((currentData) => ({
      ...currentData,
      lessons: currentData.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, notes: [...(lesson.notes || []), note] } : lesson
      ),
    }));
  };

  const getHomeworkContext = (homework) => {
    const group = data.groups.find((item) => item.id === homework.groupId);
    const student = data.students.find((item) => item.id === homework.studentId);
    const readableHomework = {
      ...homework,
      materials: homework.materials.map((materialId) => data.materials.find((item) => item.id === materialId)?.title || materialId),
    };
    return { group, student, homework: readableHomework };
  };

  const exportHomework = async (homework) => {
    const context = getHomeworkContext(homework);
    const template = buildHomeworkPdfTemplate({
      ...context,
      teacherName: data.settings.teacherName,
      schoolName: data.settings.schoolName,
    });
    const fileName =
      homework.mode === "individual" && context.student
        ? `${context.student.fullName}_Домашка_${homework.topic}`
        : `${context.group?.name || "Group"}_Домашка_${homework.topic}`;
    await downloadPdf(template, fileName);
  };

  const shareHomework = async (homework) => {
    const context = getHomeworkContext(homework);
    const template = buildHomeworkPdfTemplate({
      ...context,
      teacherName: data.settings.teacherName,
      schoolName: data.settings.schoolName,
    });
    await sharePdf(template, `${context.group?.name || context.student?.fullName}_Домашка_${homework.topic}`, homework.whatsappText);
  };

  const prepareWhatsApp = async (homework) => {
    const { group, student } = getHomeworkContext(homework);
    await copyToClipboard(homework.whatsappText);
    const url =
      homework.mode === "individual" && student
        ? buildWhatsAppUrl(student.parentPhone, homework.whatsappText)
        : group?.whatsappGroup || buildWhatsAppUrl("", homework.whatsappText);
    window.open(url, "_blank", "noopener,noreferrer");
    showToast("Текст WhatsApp скопирован");
  };

  const createHomework = async (homework) => {
    updateData((currentData) => ({
      ...currentData,
      homeworks: [homework, ...currentData.homeworks],
      groups: currentData.groups.map((group) =>
        group.id === homework.groupId ? { ...group, homeworkIds: [homework.id, ...group.homeworkIds] } : group
      ),
    }));
    await exportHomework(homework);
    await copyToClipboard(homework.whatsappText);
    showToast("Домашка создана, PDF скачан, WhatsApp текст скопирован");
  };

  const exportHomeworkWord = (homework) => {
    const { group, student } = getHomeworkContext(homework);
    const html = `
      <html><head><meta charset="utf-8"><title>${homework.title}</title></head>
      <body>
        <h1>${homework.title}</h1>
        <p><strong>Группа:</strong> ${group?.name || ""}</p>
        <p><strong>Ученик:</strong> ${student?.fullName || "Вся группа"}</p>
        <p><strong>Тема:</strong> ${homework.topic}</p>
        <ol>${homework.tasks.map((task) => `<li>${task}</li>`).join("")}</ol>
        <p>${homework.teacherComment}</p>
      </body></html>`;
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${makeSafeFileName(homework.title)}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addMaterial = (material) => {
    updateData((currentData) => ({
      ...currentData,
      materials: [material, ...currentData.materials],
    }));
    showToast("Материал добавлен");
  };

  const saveGameResult = (result) => {
    updateData((currentData) => ({
      ...currentData,
      gameResults: [result, ...currentData.gameResults],
      students: currentData.students.map((student) =>
        student.id === result.studentId
          ? {
              ...student,
              points: Number(student.points || 0) + Number(result.score || 0),
              activity: Math.min(100, Number(student.activity || 0) + 3),
            }
          : student
      ),
    }));
    showToast("Результат игры сохранен в рейтинг");
  };

  const createReport = (report) => {
    updateData((currentData) => ({
      ...currentData,
      reports: [report, ...currentData.reports],
      students: currentData.students.map((student) =>
        student.id === report.studentId ? { ...student, reportIds: [report.id, ...student.reportIds] } : student
      ),
      groups: currentData.groups.map((group) =>
        group.id === report.groupId ? { ...group, reportIds: [report.id, ...group.reportIds] } : group
      ),
    }));
    showToast("Отчет создан");
  };

  const exportReport = async (report) => {
    const group = data.groups.find((item) => item.id === report.groupId);
    const student = data.students.find((item) => item.id === report.studentId);
    const template =
      report.type === "group"
        ? buildGroupReportPdfTemplate({
            report,
            group,
            teacherName: data.settings.teacherName,
            schoolName: data.settings.schoolName,
          })
        : buildStudentReportPdfTemplate({
            report,
            group,
            student,
            teacherName: data.settings.teacherName,
            schoolName: data.settings.schoolName,
          });
    await downloadPdf(template, report.title);
  };

  const prepareReportWhatsApp = async (report) => {
    const group = data.groups.find((item) => item.id === report.groupId);
    const student = data.students.find((item) => item.id === report.studentId);
    const text = `Здравствуйте!\n${report.title}\n${student?.fullName || group?.name}\n${report.recommendation}`;
    await copyToClipboard(text);
    showToast("Текст отчета скопирован");
  };

  const updateSettings = (patch) => {
    updateData((currentData) => ({
      ...currentData,
      settings: { ...currentData.settings, ...patch },
    }));
  };

  const importBackup = async (file) => {
    if (!file) return;
    const importedData = await readBackupFile(file);
    setData(importedData);
    showToast("Резервная копия импортирована");
  };

  const installApp = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case "groups":
        return <GroupsPage data={data} onStartLesson={startLesson} onNavigate={navigate} />;
      case "students":
        return (
          <StudentsPage
            data={data}
            onAddNote={addStudentNote}
            onAddWeakTopic={addWeakTopic}
            onUploadPhoto={uploadStudentPhoto}
            onRemovePhoto={removeStudentPhoto}
          />
        );
      case "planner":
        return (
          <LessonPlannerPage
            data={data}
            onUpdateLesson={updateLesson}
            onDuplicateLesson={duplicateLesson}
            onStartLesson={startLesson}
          />
        );
      case "run":
        return (
          <LessonRunPage
            data={data}
            currentLessonId={currentLessonId}
            onNavigate={navigate}
            onMarkActivity={markActivity}
            onAddLessonNote={addLessonNote}
          />
        );
      case "homework":
        return (
          <HomeworkPage
            data={data}
            onCreateHomework={createHomework}
            onExportHomework={exportHomework}
            onShareHomework={shareHomework}
            onPrepareWhatsApp={prepareWhatsApp}
            onExportWord={exportHomeworkWord}
          />
        );
      case "materials":
        return <MaterialsPage data={data} onAddMaterial={addMaterial} />;
      case "games":
        return <GamesPage data={data} onSaveGameResult={saveGameResult} />;
      case "rating":
        return <RatingPage data={data} />;
      case "reports":
        return (
          <ReportsPage
            data={data}
            onCreateReport={createReport}
            onExportReport={exportReport}
            onPrepareReportWhatsApp={prepareReportWhatsApp}
          />
        );
      case "settings":
        return (
          <SettingsPage
            data={data}
            onUpdateSettings={updateSettings}
            onDownloadBackup={() => downloadBackup(data)}
            onImportBackup={importBackup}
            onResetData={() => {
              const freshData = resetAppData();
              setData(freshData);
              showToast("Демо-данные восстановлены");
            }}
          />
        );
      default:
        return <DashboardPage data={data} onNavigate={navigate} onStartLesson={startLesson} />;
    }
  };

  return (
    <div className="app-shell">
      <SidePanel
        items={navItems}
        activePage={activePage}
        onNavigate={navigate}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <div className="app-main">
        <AppHeader
          settings={data.settings}
          activeLabel={activeLabel}
          onMenuClick={() => setIsMenuOpen(true)}
          onInstall={installApp}
          installReady={Boolean(deferredInstallPrompt)}
        />
        <main>{renderPage()}</main>
      </div>
      <BottomNav items={navItems} activePage={activePage} onNavigate={navigate} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
