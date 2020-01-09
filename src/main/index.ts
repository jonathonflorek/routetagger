import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path'
import { menu } from './menu';

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

Menu.setApplicationMenu(menu);
