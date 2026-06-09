import Card from "./Card";
import Icon from "./Icon";

export default function GameCard({ game, onOpen }) {
  return (
    <Card className="game-card" style={{ "--accent": game.accent }}>
      <div className="game-card__icon">
        <Icon name="game" size={28} />
      </div>
      <div>
        <h3>{game.title}</h3>
        <p>{game.description}</p>
      </div>
      <button className="button button--ghost" type="button" onClick={() => onOpen?.(game)}>
        Запустить
      </button>
    </Card>
  );
}
