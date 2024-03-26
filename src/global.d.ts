// global.d.ts

interface Window {
    showOpenFilePicker?: (options?: any) => Promise<Array<FileSystemFileHandle>>;
  }