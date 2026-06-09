import Icon from "./Icon";
import { fileToDataUrl, formatFileSize, getFileType } from "../utils/fileHelpers";
import { saveFileRecord } from "../data/storage";

export default function FileUploader({ onUploaded, compact = false }) {
  const handleFile = async (file) => {
    if (!file) return;

    const id = `file-${Date.now()}`;
    const dataUrl = await fileToDataUrl(file);
    const record = {
      id,
      name: file.name,
      size: file.size,
      type: getFileType(file),
      mimeType: file.type,
      dataUrl,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveFileRecord(record);
    } catch (error) {
      console.warn("IndexedDB unavailable, file kept as data url only.", error);
    }

    onUploaded?.(record);
  };

  return (
    <label className={`file-uploader ${compact ? "file-uploader--compact" : ""}`}>
      <Icon name="material" size={24} />
      <span>Загрузить файл</span>
      <small>PDF, видео, аудио, картинки</small>
      <input
        type="file"
        accept="application/pdf,image/*,video/*,audio/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          handleFile(file);
          event.target.value = "";
        }}
      />
      <output>{compact ? "" : formatFileSize(0)}</output>
    </label>
  );
}
