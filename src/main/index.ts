import { app, BrowserWindow, Menu, dialog } from 'electron';
import * as path from 'path'
import { fileOpenChannel } from '../common/constants';

const isMac = process.platform === 'darwin';
const mainUrl = 'file:///' + path.join(__dirname, '../../index.html');

// keep a global reference to the window object
let window: BrowserWindow | null = null;

function createWindowIfNotExists() {
    if (window === null) {
        window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
            },
        });
        window.loadURL(mainUrl);
        window.on('closed', () => {
            // dereference the global window object
            window = null;
        });
    }
}

app.on('ready', createWindowIfNotExists);
app.on('activate', createWindowIfNotExists);

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

const menu = Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                click: async (_, browserWindow) => {
                    const pickedFile = await dialog.showOpenDialog(browserWindow, {
                        properties: ['openFile'],
                    });
                    if (!pickedFile.canceled) {
                        browserWindow.webContents.send(fileOpenChannel, pickedFile.filePaths[0]);
                    }
                }
            },
            {
                label: 'Devtools',
                role: 'toggleDevTools',
            }
        ],
    },
]);
Menu.setApplicationMenu(menu);
