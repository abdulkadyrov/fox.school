export const getTodayIso = () => new Date().toISOString().slice(0, 10);

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
};

export const formatLessonTime = (dateString, timeString) => {
  const date = formatDate(dateString);
  return timeString ? `${date}, ${timeString}` : date;
};

export const minutesToHuman = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} мин`;
  if (!rest) return `${hours} ч`;
  return `${hours} ч ${rest} мин`;
};

export const secondsToClock = (seconds) => {
  const positive = Math.max(0, seconds);
  const minutes = Math.floor(positive / 60);
  const rest = positive % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
};

export const getWeekLabel = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatDate(start.toISOString().slice(0, 10))} - ${formatDate(end.toISOString().slice(0, 10))}`;
};
