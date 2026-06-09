import { useMemo, useState } from "react";
import Card from "../components/Card";
import FileUploader from "../components/FileUploader";
import Icon from "../components/Icon";
import { englishFolders, preschoolFolders } from "../data/templates";

export default function MaterialsPage({ data, onAddMaterial }) {
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("all");
  const [groupId, setGroupId] = useState("all");
  const [type, setType] = useState("all");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const materialTypes = [...new Set(data.materials.map((material) => material.type))];
  const filteredMaterials = useMemo(
    () =>
      data.materials.filter((material) => {
        const matchesQuery = `${material.title} ${material.description}`.toLowerCase().includes(query.toLowerCase());
        const matchesDirection = direction === "all" || material.direction === direction;
        const matchesGroup = groupId === "all" || material.groupId === groupId;
        const matchesType = type === "all" || material.type === type;
        return matchesQuery && matchesDirection && matchesGroup && matchesType;
      }),
    [data.materials, direction, groupId, query, type]
  );

  const addLink = () => {
    if (!linkTitle || !linkUrl) return;
    onAddMaterial({
      id: `material-${Date.now()}`,
      title: linkTitle,
      direction: direction === "all" ? "English" : direction,
      folder: "links",
      type: linkUrl.includes("youtube") ? "video" : "link",
      groupId: groupId === "all" ? "" : groupId,
      url: linkUrl,
      attachedTo: [],
      description: "Добавленная ссылка",
    });
    setLinkTitle("");
    setLinkUrl("");
  };

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Материалы</span>
          <h1>Файлы, ссылки и папки</h1>
        </div>
      </div>

      <div className="folder-board">
        <Card>
          <h2>Preschool</h2>
          <div className="tag-row">
            {preschoolFolders.map((folder) => (
              <span className="tag tag--soft" key={folder}>{folder}</span>
            ))}
          </div>
        </Card>
        <Card>
          <h2>English</h2>
          <div className="tag-row">
            {englishFolders.map((folder) => (
              <span className="tag tag--soft" key={folder}>{folder}</span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="filter-bar">
          <input value={query} placeholder="Поиск" onChange={(event) => setQuery(event.target.value)} />
          <select value={direction} onChange={(event) => setDirection(event.target.value)}>
            <option value="all">Все направления</option>
            <option value="Preschool">Preschool</option>
            <option value="English">English</option>
          </select>
          <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
            <option value="all">Все группы</option>
            {data.groups.map((group) => (
              <option value={group.id} key={group.id}>{group.name}</option>
            ))}
          </select>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">Все типы</option>
            {materialTypes.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="add-material-grid">
          <FileUploader
            onUploaded={(record) =>
              onAddMaterial({
                id: `material-${Date.now()}`,
                title: record.name,
                direction: direction === "all" ? "English" : direction,
                folder: "uploads",
                type: record.type,
                groupId: groupId === "all" ? "" : groupId,
                url: record.id,
                attachedTo: [],
                description: "Локальный файл",
              })
            }
          />
          <div className="link-form">
            <input value={linkTitle} placeholder="Название ссылки" onChange={(event) => setLinkTitle(event.target.value)} />
            <input value={linkUrl} placeholder="https://..." onChange={(event) => setLinkUrl(event.target.value)} />
            <button className="button" type="button" onClick={addLink}>Добавить ссылку</button>
          </div>
        </div>
      </Card>

      <div className="card-grid">
        {filteredMaterials.map((material) => (
          <Card className="material-card" key={material.id}>
            <div className="section-heading">
              <Icon name={material.type === "PDF" ? "pdf" : material.type === "audio" ? "audio" : material.type === "video" ? "video" : "material"} size={30} />
              <span className="tag">{material.type}</span>
            </div>
            <h3>{material.title}</h3>
            <p>{material.description}</p>
            <div className="tag-row">
              <span className="tag tag--soft">{material.direction}</span>
              <span className="tag tag--soft">{material.folder}</span>
            </div>
            <div className="split-actions">
              <button className="button button--ghost" type="button">К уроку</button>
              <button className="button button--ghost" type="button">К домашке</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
