import { demoData } from "./demoData";

const STORAGE_KEY = "foxy-teacher:data:v1";
const FILE_DB_NAME = "foxy-teacher-files";
const FILE_STORE = "files";

const clone = (value) => JSON.parse(JSON.stringify(value));

const mergeWithDemo = (stored) => ({
  ...clone(demoData),
  ...stored,
  settings: {
    ...demoData.settings,
    ...(stored?.settings || {}),
  },
});

export const loadAppData = () => {
  if (typeof window === "undefined") return clone(demoData);

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const freshData = clone(demoData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
    return freshData;
  }

  try {
    return mergeWithDemo(JSON.parse(raw));
  } catch (error) {
    console.warn("Failed to parse local app data. Demo data restored.", error);
    return clone(demoData);
  }
};

export const saveAppData = (data) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const resetAppData = () => {
  const freshData = clone(demoData);
  saveAppData(freshData);
  return freshData;
};

export const downloadBackup = (data) => {
  const stampedData = {
    ...data,
    settings: {
      ...data.settings,
      backupDate: new Date().toISOString(),
    },
  };
  const blob = new Blob([JSON.stringify(stampedData, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `foxy-teacher-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const readBackupFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(mergeWithDemo(JSON.parse(String(reader.result))));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const openFileDatabase = () =>
  new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available in this browser"));
      return;
    }

    const request = window.indexedDB.open(FILE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(FILE_STORE)) {
        database.createObjectStore(FILE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withFileStore = async (mode, callback) => {
  const database = await openFileDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE, mode);
    const store = transaction.objectStore(FILE_STORE);
    const result = callback(store);
    transaction.oncomplete = () => {
      database.close();
      resolve(result?.result ?? result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
};

export const saveFileRecord = async (record) =>
  withFileStore("readwrite", (store) => store.put(record));

export const getFileRecord = async (id) =>
  withFileStore("readonly", (store) => store.get(id));

export const deleteFileRecord = async (id) =>
  withFileStore("readwrite", (store) => store.delete(id));
