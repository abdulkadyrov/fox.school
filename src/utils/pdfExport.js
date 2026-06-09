import { makeSafeFileName } from "./fileHelpers";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PDF_WIDTH = 595.28;
const PDF_HEIGHT = 841.89;

const encoder = new TextEncoder();

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const wrapText = (text, maxChars = 62) => {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (nextLine.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
};

const svgText = ({ x, y, lines, size = 22, color = "#333044", weight = 500, lineHeight = 1.32 }) =>
  lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * size * lineHeight}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(line)}</text>`
    )
    .join("");

const foxMark = (x, y, scale = 1) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M18 28L33 5L39 35L18 28Z" fill="#F49A5C"/>
    <path d="M82 28L67 5L61 35L82 28Z" fill="#F49A5C"/>
    <path d="M16 48C16 22 32 10 50 10C68 10 84 22 84 48C84 74 68 92 50 92C32 92 16 74 16 48Z" fill="#F6A15E"/>
    <path d="M29 57C36 74 43 81 50 81C57 81 64 74 71 57C66 81 58 92 50 92C42 92 34 81 29 57Z" fill="#FFF8F0"/>
    <circle cx="40" cy="45" r="3.2" fill="#333044"/>
    <circle cx="60" cy="45" r="3.2" fill="#333044"/>
    <path d="M46 56H54L50 62L46 56Z" fill="#333044"/>
  </g>
`;

const buildTemplateSvg = ({ title, subtitle, meta = [], sections = [], accent = "#8F7CF6" }) => {
  let y = 208;
  const metaRows = meta
    .map(
      (item, index) => `
        <g transform="translate(${68 + (index % 2) * 330} ${index < 2 ? 126 : 169})">
          <rect width="286" height="34" rx="8" fill="#FFFFFF" stroke="#E9E2FF"/>
          <text x="16" y="22" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#767087">${escapeXml(item.label)}</text>
          <text x="116" y="22" font-family="Arial, sans-serif" font-size="15" font-weight="500" fill="#333044">${escapeXml(item.value)}</text>
        </g>
      `
    )
    .join("");

  const sectionMarkup = sections
    .map((section) => {
      const heading = svgText({
        x: 68,
        y,
        lines: [section.heading],
        size: 20,
        color: accent,
        weight: 800,
      });
      y += 34;

      const bodyLines = Array.isArray(section.body) ? section.body : wrapText(section.body, 74);
      const body = bodyLines
        .flatMap((line) => wrapText(line, 74))
        .map((line, index) => {
          const prefix = section.list ? "• " : "";
          return `<text x="78" y="${y + index * 26}" font-family="Arial, sans-serif" font-size="18" font-weight="500" fill="#333044">${escapeXml(prefix + line)}</text>`;
        })
        .join("");
      y += Math.max(1, bodyLines.length) * 26 + 28;

      return `<g>${heading}${body}</g>`;
    })
    .join("");

  return `
    <svg width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" fill="#F8F6FF"/>
      <rect x="42" y="42" width="710" height="1039" rx="8" fill="#FFFFFF" stroke="#E9E2FF"/>
      <rect x="42" y="42" width="710" height="18" fill="${accent}"/>
      <circle cx="693" cy="97" r="34" fill="#FFF1DF"/>
      ${foxMark(646, 52, 0.9)}
      <text x="68" y="98" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#333044">${escapeXml(title)}</text>
      <text x="68" y="129" font-family="Arial, sans-serif" font-size="18" font-weight="500" fill="#767087">${escapeXml(subtitle)}</text>
      ${metaRows}
      <line x1="68" y1="190" x2="726" y2="190" stroke="#E9E2FF" stroke-width="2"/>
      ${sectionMarkup}
      <rect x="68" y="1001" width="658" height="46" rx="8" fill="#F8F6FF" stroke="#E9E2FF"/>
      <text x="88" y="1030" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#333044">Foxy Teacher</text>
      <text x="562" y="1030" font-family="Arial, sans-serif" font-size="17" font-weight="500" fill="#767087">Подпись преподавателя</text>
    </svg>
  `;
};

const svgToJpegBytes = (svg) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const canvas = document.createElement("canvas");
    canvas.width = PAGE_WIDTH;
    canvas.height = PAGE_HEIGHT;
    const context = canvas.getContext("2d");

    image.onload = () => {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
      context.drawImage(image, 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const base64 = dataUrl.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      resolve(bytes);
    };

    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

const concatBytes = (chunks, totalLength) => {
  const output = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
};

const createPdfFromJpeg = (jpegBytes) => {
  const chunks = [];
  const offsets = [0];
  let offset = 0;

  const push = (chunk) => {
    const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
    chunks.push(bytes);
    offset += bytes.length;
  };

  const object = (number, body) => {
    offsets[number] = offset;
    push(`${number} 0 obj\n`);
    body.forEach(push);
    push("\nendobj\n");
  };

  push("%PDF-1.4\n");
  object(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
  object(2, ["<< /Type /Pages /Kids [3 0 R] /Count 1 >>"]);
  object(3, [
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`,
  ]);

  const contentStream = `q\n${PDF_WIDTH} 0 0 ${PDF_HEIGHT} 0 0 cm\n/Im0 Do\nQ`;
  object(4, [`<< /Length ${encoder.encode(contentStream).length} >>\nstream\n`, contentStream, "\nendstream"]);
  object(5, [
    `<< /Type /XObject /Subtype /Image /Width ${PAGE_WIDTH} /Height ${PAGE_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
    jpegBytes,
    "\nendstream",
  ]);

  const xrefOffset = offset;
  push("xref\n0 6\n");
  push("0000000000 65535 f \n");
  for (let index = 1; index <= 5; index += 1) {
    push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob([concatBytes(chunks, offset)], { type: "application/pdf" });
};

export const createPdfBlob = async (templateData) => {
  const svg = buildTemplateSvg(templateData);
  const jpegBytes = await svgToJpegBytes(svg);
  return createPdfFromJpeg(jpegBytes);
};

export const downloadPdf = async (templateData, fileName) => {
  const blob = await createPdfBlob(templateData);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${makeSafeFileName(fileName)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
  return blob;
};

export const sharePdf = async (templateData, fileName, text) => {
  const blob = await createPdfBlob(templateData);
  const file = new File([blob], `${makeSafeFileName(fileName)}.pdf`, { type: "application/pdf" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: fileName, text });
    return true;
  }

  await downloadPdf(templateData, fileName);
  return false;
};

export const buildHomeworkPdfTemplate = ({ homework, group, student, teacherName, schoolName }) => ({
  title: "Домашнее задание",
  subtitle: schoolName,
  accent: "#8F7CF6",
  meta: [
    { label: "Группа", value: group?.name || "Индивидуально" },
    { label: "Ученик", value: student?.fullName || "Вся группа" },
    { label: "Дата", value: homework?.createdAt || "" },
    { label: "Тема", value: homework?.topic || homework?.title || "" },
  ],
  sections: [
    { heading: "Задания", body: homework?.tasks || [], list: true },
    { heading: "Слова", body: homework?.words?.join(", ") || "Нет списка слов" },
    { heading: "Материалы", body: homework?.materials?.join(", ") || "Материалы не прикреплены" },
    { heading: "Комментарий", body: homework?.teacherComment || "Удачной практики!" },
    { heading: "Преподаватель", body: teacherName || "" },
  ],
});

export const buildStudentReportPdfTemplate = ({ report, student, group, teacherName, schoolName }) => ({
  title: "Отчет ученика",
  subtitle: schoolName,
  accent: "#F49A5C",
  meta: [
    { label: "Ученик", value: student?.fullName || "" },
    { label: "Группа", value: group?.name || "" },
    { label: "Дата", value: report?.date || "" },
    { label: "Педагог", value: teacherName || "" },
  ],
  sections: [
    { heading: "Что прошли", body: report?.covered || "" },
    { heading: "Активность", body: report?.activity || "" },
    { heading: "Домашка", body: report?.homework || "" },
    { heading: "Слабые темы", body: report?.weakTopics || [], list: true },
    { heading: "Рекомендация", body: report?.recommendation || "" },
    { heading: "Комментарий", body: report?.teacherComment || "" },
  ],
});

export const buildGroupReportPdfTemplate = ({ report, group, teacherName, schoolName }) => ({
  title: "Отчет группы",
  subtitle: schoolName,
  accent: "#6BD6BC",
  meta: [
    { label: "Группа", value: group?.name || "" },
    { label: "Дата", value: report?.date || "" },
    { label: "Прогресс", value: `${group?.progress || 0}%` },
    { label: "Педагог", value: teacherName || "" },
  ],
  sections: [
    { heading: "Темы недели", body: report?.covered || "" },
    { heading: "Активность", body: report?.activity || "" },
    { heading: "Домашние задания", body: report?.homework || "" },
    { heading: "Рейтинг и прогресс", body: report?.strengths || [], list: true },
    { heading: "Рекомендация", body: report?.recommendation || "" },
    { heading: "Комментарий", body: report?.teacherComment || "" },
  ],
});
