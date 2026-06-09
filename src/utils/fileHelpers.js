export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const getFileType = (fileOrName = "") => {
  const type = typeof fileOrName === "string" ? fileOrName : fileOrName.type || fileOrName.name;
  const lower = type.toLowerCase();
  if (lower.includes("pdf")) return "PDF";
  if (lower.includes("video")) return "video";
  if (lower.includes("audio")) return "audio";
  if (lower.includes("image")) return "image";
  if (lower.includes("presentation") || lower.includes("ppt")) return "presentation";
  return "link";
};

export const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

export const makeSafeFileName = (name) =>
  String(name)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_");

export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return true;
};

export const buildWhatsAppUrl = (phone, text) => {
  const digits = String(phone || "").replace(/\D/g, "");
  const encoded = encodeURIComponent(text);
  return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
};
