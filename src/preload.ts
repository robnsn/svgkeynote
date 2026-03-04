import { contextBridge, ipcRenderer } from 'electron';

export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  message?: string;
  error?: string;
}

export interface FinderResult {
  success: boolean;
  error?: string;
}

const api = {
  convertSVG: (svgPath: string): Promise<ConversionResult> =>
    ipcRenderer.invoke('convert-svg', svgPath),

  openFile: (): Promise<string | null> =>
    ipcRenderer.invoke('open-file'),

  openInFinder: (filePath: string): Promise<FinderResult> =>
    ipcRenderer.invoke('open-in-finder', filePath)
};

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
