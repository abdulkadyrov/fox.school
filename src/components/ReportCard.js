import Card from "./Card";
import Icon from "./Icon";
import { formatDate } from "../utils/dateHelpers";

export default function ReportCard({ report, group, student, onExport, onWhatsApp }) {
  return (
    <Card className="report-card">
      <div className="report-card__header">
        <Icon name="report" size={28} />
        <div>
          <h3>{report.title}</h3>
          <p>{formatDate(report.date)} · {student?.fullName || group?.name}</p>
        </div>
      </div>
      <p>{report.covered}</p>
      <div className="tag-row">
        {(report.weakTopics || []).map((topic) => (
          <span className="tag tag--warning" key={topic}>{topic}</span>
        ))}
      </div>
      <div className="split-actions">
        <button className="button button--ghost" type="button" onClick={() => onWhatsApp?.(report)}>
          WhatsApp
        </button>
        <button className="button" type="button" onClick={() => onExport?.(report)}>
          Скачать PDF
        </button>
      </div>
    </Card>
  );
}
