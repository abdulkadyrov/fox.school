import { makeSafeFileName } from "./fileHelpers";
import { downloadPdf } from "./pdfExport";

const today = () => new Date().toISOString().slice(0, 10);

const lessonPack = (lesson, group) => ({
  id: `print-lesson-${lesson.id}`,
  type: "lesson",
  label: "Урок",
  title: lesson.title,
  subtitle: group?.name || "Группа",
  source: lesson.topic,
  accent: "#53D6BE",
  items: lesson.blocks.map((block) => ({
    title: block.title,
    meta: `${block.duration} мин`,
    body: block.description,
    extra: block.materials.join(", "),
  })),
});

const homeworkPack = (homework, group, student) => ({
  id: `print-homework-${homework.id}`,
  type: "homework",
  label: "Домашка",
  title: homework.title,
  subtitle: student?.fullName || group?.name || "Материал",
  source: homework.topic,
  accent: "#FBBF24",
  items: [
    ...homework.tasks.map((task, index) => ({
      title: `Задание ${index + 1}`,
      meta: homework.topic,
      body: task,
      extra: "",
    })),
    {
      title: "Слова",
      meta: `${homework.words?.length || 0}`,
      body: homework.words?.join(", ") || "Список слов не задан",
      extra: homework.teacherComment,
    },
  ],
});

const aliasPack = (topic, words) => ({
  id: `print-game-${makeSafeFileName(topic)}`,
  type: "game",
  label: "Игра",
  title: `Alias: ${topic}`,
  subtitle: "Карточки",
  source: "Alias",
  accent: "#34D399",
  items: words.map((word) => ({
    title: word.word,
    meta: topic,
    body: word.hints.join(" · "),
    extra: "Объяснить без прямого перевода",
  })),
});

const ratingPack = (gameResults, students) => ({
  id: "print-game-results",
  type: "game",
  label: "Баллы",
  title: "Игровые результаты",
  subtitle: "Для журнала",
  source: today(),
  accent: "#53D6BE",
  items: gameResults.slice(0, 12).map((result) => ({
    title: students.find((student) => student.id === result.studentId)?.fullName || "Ученик",
    meta: `${result.game} · ${result.score}`,
    body: result.topic,
    extra: result.date,
  })),
});

export const buildPrintPacks = (data) => {
  const lessonPacks = data.lessons.map((lesson) =>
    lessonPack(lesson, data.groups.find((group) => group.id === lesson.groupId))
  );

  const homeworkPacks = data.homeworks.map((homework) =>
    homeworkPack(
      homework,
      data.groups.find((group) => group.id === homework.groupId),
      data.students.find((student) => student.id === homework.studentId)
    )
  );

  const aliasTopics = [...new Set(data.aliasWords.map((word) => word.topic))];
  const gamePacks = aliasTopics.map((topic) =>
    aliasPack(topic, data.aliasWords.filter((word) => word.topic === topic))
  );

  return [
    ...lessonPacks,
    ...homeworkPacks,
    ...gamePacks,
    ...(data.gameResults.length ? [ratingPack(data.gameResults, data.students)] : []),
  ];
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const printHtml = (pack, settings) => `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(pack.title)}</title>
    <style>
      @page { size: A4; margin: 14mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        color: #1F2937;
        background: #F9FFFD;
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: center;
        border-bottom: 2px solid #DFF8F3;
        padding-bottom: 16px;
        margin-bottom: 18px;
      }
      h1 { margin: 0; font-size: 32px; }
      h2 { margin: 0 0 8px; font-size: 20px; }
      p { margin: 0; line-height: 1.45; color: #64748B; }
      .badge {
        display: inline-flex;
        border-radius: 999px;
        background: #DFF8F3;
        color: #0F766E;
        padding: 8px 12px;
        font-weight: 800;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .card {
        min-height: 136px;
        border: 1px solid #DCEDEA;
        border-radius: 18px;
        background: #FFFFFF;
        padding: 16px;
        break-inside: avoid;
      }
      .meta {
        display: inline-flex;
        margin-bottom: 10px;
        border-radius: 999px;
        background: ${pack.accent};
        color: #FFFFFF;
        padding: 5px 10px;
        font-size: 12px;
        font-weight: 800;
      }
      footer {
        margin-top: 18px;
        color: #64748B;
        font-size: 13px;
      }
      @media print {
        body { background: #FFFFFF; }
      }
    </style>
  </head>
  <body>
    <header>
      <div>
        <span class="badge">${escapeHtml(pack.label)}</span>
        <h1>${escapeHtml(pack.title)}</h1>
        <p>${escapeHtml(pack.subtitle)} · ${escapeHtml(pack.source)}</p>
      </div>
      <strong>${escapeHtml(settings.schoolName || "Foxy Teacher")}</strong>
    </header>
    <main class="grid">
      ${pack.items
        .map(
          (item) => `
            <article class="card">
              <span class="meta">${escapeHtml(item.meta)}</span>
              <h2>${escapeHtml(item.title)}</h2>
              <p>${escapeHtml(item.body)}</p>
              ${item.extra ? `<p>${escapeHtml(item.extra)}</p>` : ""}
            </article>
          `
        )
        .join("")}
    </main>
    <footer>${escapeHtml(settings.teacherName || "Teacher")} · ${today()}</footer>
  </body>
</html>`;

export const downloadPrintHtml = (pack, settings) => {
  const blob = new Blob([printHtml(pack, settings)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${makeSafeFileName(pack.title)}_print.html`;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadPrintPdf = async (pack, settings) =>
  downloadPdf(
    {
      title: pack.title,
      subtitle: pack.subtitle,
      accent: pack.accent,
      meta: [
        { label: "Тип", value: pack.label },
        { label: "Источник", value: pack.source },
        { label: "Школа", value: settings.schoolName || "Foxy Teacher" },
        { label: "Дата", value: today() },
      ],
      sections: [
        {
          heading: "Материалы",
          body: pack.items.map((item) => `${item.title}: ${item.body}`),
          list: true,
        },
      ],
    },
    `${pack.title}_print`
  );
