import lessonIcon from "../assets/icons/lesson.svg";
import groupIcon from "../assets/icons/group.svg";
import studentIcon from "../assets/icons/student.svg";
import homeworkIcon from "../assets/icons/homework.svg";
import reportIcon from "../assets/icons/report.svg";
import ratingIcon from "../assets/icons/rating.svg";
import materialIcon from "../assets/icons/material.svg";
import videoIcon from "../assets/icons/video.svg";
import pdfIcon from "../assets/icons/pdf.svg";
import audioIcon from "../assets/icons/audio.svg";
import gameIcon from "../assets/icons/game.svg";
import timerIcon from "../assets/icons/timer.svg";

const icons = {
  lesson: lessonIcon,
  group: groupIcon,
  student: studentIcon,
  homework: homeworkIcon,
  report: reportIcon,
  rating: ratingIcon,
  material: materialIcon,
  video: videoIcon,
  pdf: pdfIcon,
  audio: audioIcon,
  game: gameIcon,
  timer: timerIcon,
};

export default function Icon({ name, label, size = 24 }) {
  return (
    <img
      className="icon"
      src={icons[name] || lessonIcon}
      alt={label || ""}
      aria-hidden={label ? "false" : "true"}
      style={{ width: size, height: size }}
    />
  );
}
