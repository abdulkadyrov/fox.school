export const levelFromPoints = (points) => {
  if (points >= 240) return "Master Fox";
  if (points >= 190) return "Word Fox";
  if (points >= 140) return "Grammar Hunter";
  if (points >= 90) return "Fox Starter";
  return "Little Fox";
};

export const starCount = (points) => Math.max(1, Math.min(5, Math.ceil(points / 55)));

export const calculateStudentScore = (student, gameResults = []) => {
  const gamePoints = gameResults
    .filter((result) => result.studentId === student.id)
    .reduce((sum, result) => sum + Number(result.score || 0), 0);

  return Math.round(
    Number(student.points || 0) +
      gamePoints +
      Number(student.activity || 0) * 0.25 +
      Number(student.homeworkRate || 0) * 0.2 +
      Number(student.behavior || 0) * 0.15
  );
};

export const buildRating = (students, gameResults = []) =>
  [...students]
    .map((student) => {
      const totalScore = calculateStudentScore(student, gameResults);
      return {
        ...student,
        totalScore,
        computedLevel: levelFromPoints(totalScore),
        stars: starCount(totalScore),
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

export const getGroupAverageProgress = (group, students) => {
  const groupStudents = students.filter((student) => group.studentIds.includes(student.id));
  if (!groupStudents.length) return group.progress || 0;

  const average =
    groupStudents.reduce(
      (sum, student) => sum + student.attendance + student.activity + student.homeworkRate,
      0
    ) /
    (groupStudents.length * 3);

  return Math.round((average + Number(group.progress || 0)) / 2);
};
