import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import GameCard from "../components/GameCard";
import Icon from "../components/Icon";
import foxGames from "../assets/mascot/fox-games.png";
import { gameCatalog } from "../data/templates";
import { secondsToClock } from "../utils/dateHelpers";

export default function GamesPage({ data, onSaveGameResult }) {
  const [activeGame, setActiveGame] = useState(gameCatalog[1]);
  const [groupId, setGroupId] = useState(data.groups[2]?.id || data.groups[0]?.id);
  const [studentId, setStudentId] = useState("");
  const [topic, setTopic] = useState("Daily routines");
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [tvMode, setTvMode] = useState(false);

  const groupStudents = data.students.filter((student) => student.groupId === groupId);
  const topics = [...new Set(data.aliasWords.map((word) => word.topic))];
  const words = useMemo(
    () => data.aliasWords.filter((word) => word.topic === topic),
    [data.aliasWords, topic]
  );
  const currentWord = words[wordIndex % Math.max(words.length, 1)];

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const nextWord = () => setWordIndex((index) => index + 1);

  const saveResult = () => {
    if (!studentId) return;
    onSaveGameResult({
      id: `game-${Date.now()}`,
      game: activeGame.title,
      groupId,
      studentId,
      date: new Date().toISOString().slice(0, 10),
      topic,
      score,
      time: 90 - secondsLeft,
    });
    setScore(0);
    setSecondsLeft(90);
    setIsRunning(false);
  };

  return (
    <div className={`page games-page ${tvMode ? "is-tv-mode" : ""}`}>
      <section className="games-hero">
        <div>
          <span className="eyebrow">Игры преподавателя</span>
          <h1>Запуск на телефоне, планшете или ТВ</h1>
          <p>Выберите группу, ученика, тему, начислите баллы и сохраните результат в рейтинг.</p>
        </div>
        <img src={foxGames} alt="" />
      </section>

      <div className="card-grid card-grid--games">
        {gameCatalog.map((game) => (
          <GameCard game={game} key={game.id} onOpen={setActiveGame} />
        ))}
      </div>

      <Card className="alias-screen">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Alias</span>
            <h2>{activeGame?.title || "Alias"}</h2>
          </div>
          <button className="button button--ghost" type="button" onClick={() => setTvMode(!tvMode)}>
            Показать на ТВ
          </button>
        </div>

        <div className="field-grid">
          <label>
            Группа
            <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
              {data.groups.map((group) => (
                <option value={group.id} key={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
          <label>
            Ученик / команда
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value="">Выберите</option>
              {groupStudents.map((student) => (
                <option value={student.id} key={student.id}>{student.fullName}</option>
              ))}
            </select>
          </label>
          <label>
            Тема
            <select value={topic} onChange={(event) => setTopic(event.target.value)}>
              {topics.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="alias-board">
          <div className="timer-orb">
            <span>Таймер</span>
            <strong>{secondsToClock(secondsLeft)}</strong>
          </div>
          <div className="word-card">
            <span className="eyebrow">{topic}</span>
            <h2>{currentWord?.word}</h2>
            <div className="tag-row">
              {currentWord?.hints.map((hint) => (
                <span className="tag tag--soft" key={hint}>{hint}</span>
              ))}
            </div>
          </div>
          <div className="score-card">
            <Icon name="rating" size={32} />
            <strong>{score}</strong>
            <span>баллов</span>
          </div>
        </div>

        <div className="split-actions">
          <button className="button button--soft" type="button" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "Пауза" : "Старт"}
          </button>
          <button className="button" type="button" onClick={() => { setScore(score + 1); nextWord(); }}>
            Правильно
          </button>
          <button className="button button--ghost" type="button" onClick={nextWord}>
            Пропустить
          </button>
          <button className="button button--ghost" type="button" onClick={saveResult}>
            Сохранить результат
          </button>
        </div>
      </Card>
    </div>
  );
}
