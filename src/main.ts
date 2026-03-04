import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { convertSVGToKeynoteFile } from './index';
import { existsSync } from 'fs';

let mainWindow: BrowserWindow | null = null;
let pendingFilePath: string | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    minWidth: 500,
    minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true
    }
  });

  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, './index.html')}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Wait for window to be ready before processing pending file
  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingFilePath) {
      const filePath = pendingFilePath;
      pendingFilePath = null;
      // Send the file path to the renderer process
      mainWindow?.webContents.send('file-dropped', filePath);
    }
  });

  // Handle drag and drop
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'o') {
      event.preventDefault();
      openFile();
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Handle files dropped on the app icon in the macOS dock
 * This is fired when the user drops files on the app icon
 */
app.on('open-file', (event, filePath) => {
  event.preventDefault();

  // Check if it's an SVG file
  if (!filePath.endsWith('.svg')) {
    return;
  }

  pendingFilePath = filePath;

  // If window is already open, send the file immediately
  if (mainWindow) {
    mainWindow.webContents.send('file-dropped', filePath);
    mainWindow.focus();
  } else {
    // Otherwise create the window and it will be sent on ready
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('convert-svg', async (event, svgPath: string) => {
  try {
    if (!existsSync(svgPath)) {
      return { success: false, error: 'File not found' };
    }

    // Generate output path in the same directory as the SVG
    const directory = path.dirname(svgPath);
    const fileName = path.basename(svgPath, '.svg');
    const outputPath = path.join(directory, `${fileName}.key`);

    await convertSVGToKeynoteFile(svgPath, outputPath);

    return {
      success: true,
      outputPath,
      message: `Keynote file created: ${fileName}.key`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

ipcMain.handle('open-file', async () => {
  return openFile();
});

async function openFile() {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'SVG Files', extensions: ['svg'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }

  return null;
}

ipcMain.handle('open-in-finder', async (event, filePath: string) => {
  const { shell } = await import('electron');
  try {
    shell.showItemInFolder(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
