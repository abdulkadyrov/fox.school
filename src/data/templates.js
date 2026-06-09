export const preschoolFolders = ["буквы", "цифры", "логика", "моторика", "развитие речи", "раскраски", "прописи"];

export const englishFolders = [
  "grammar",
  "vocabulary",
  "reading",
  "listening",
  "speaking",
  "tests",
  "videos",
  "songs",
  "flashcards",
];

export const lessonBlockTypes = [
  "разминка",
  "повторение",
  "новая тема",
  "слова",
  "грамматика",
  "чтение",
  "практика",
  "игра",
  "видео",
  "аудио",
  "итог",
  "домашнее задание",
];

export const homeworkRecommendations = {
  "плохо читает": [
    "Прочитать короткий текст 2 раза вслух.",
    "Подчеркнуть знакомые буквы или слова.",
    "Сделать карточки с 5 словами для повторения.",
  ],
  "слабая грамматика": [
    "Пройти упражнение на форму предложения.",
    "Сделать 6 примеров по образцу.",
    "Посмотреть короткое видео-объяснение и выписать правило.",
  ],
  "не знает слова": [
    "Повторить слова через карточки.",
    "Составить 5 предложений с новыми словами.",
    "Разделить слова на группы и проговорить вслух.",
  ],
  "путает времена": [
    "Сравнить 6 предложений в разных временах.",
    "Подчеркнуть маркеры времени.",
    "Сделать мини-таблицу: Present / Past / Future.",
  ],
};

export const homeworkModes = [
  { value: "group", label: "Общая" },
  { value: "individual", label: "Индивидуальная" },
  { value: "mixed", label: "Смешанная" },
];

export const gameCatalog = [
  {
    id: "quiz",
    title: "Quiz",
    description: "Вопросы по теме с быстрым начислением баллов.",
    accent: "#8F7CF6",
  },
  {
    id: "alias",
    title: "Alias",
    description: "Объяснить слово без прямого перевода.",
    accent: "#F49A5C",
  },
  {
    id: "guess-word",
    title: "Угадай слово",
    description: "Слово, подсказки и командные ответы.",
    accent: "#6BD6BC",
  },
  {
    id: "pairs",
    title: "Найди пару",
    description: "Матчинг картинок, слов и правил.",
    accent: "#F8C65A",
  },
  {
    id: "true-false",
    title: "Правда или ложь",
    description: "Быстрая проверка грамматики и фактов.",
    accent: "#FF8F8F",
  },
  {
    id: "build-word",
    title: "Собери слово",
    description: "Буквы, слоги и порядок.",
    accent: "#8F7CF6",
  },
  {
    id: "flashcards",
    title: "Карточки",
    description: "Слова, картинки и повторение.",
    accent: "#6BD6BC",
  },
  {
    id: "wheel",
    title: "Колесо фортуны",
    description: "Случайная тема, ученик или задание.",
    accent: "#F49A5C",
  },
];

export const pdfTemplateLabels = {
  homework: "Домашнее задание",
  studentReport: "Отчет ученика",
  groupReport: "Отчет группы",
};
