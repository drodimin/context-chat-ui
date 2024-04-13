// global.d.ts

interface Window {
    showOpenFilePicker?: (options?: any) => Promise<Array<FileSystemFileHandle>>;
    createWritable
  }

  interface FileSystemFileHandle {
    createWritable: () => Promise<FileSystemWritableFileStream>;
  }