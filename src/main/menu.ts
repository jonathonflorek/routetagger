import { Menu, dialog } from 'electron';
import { FILE_OPEN_CHANNEL } from '../common/constants';

export const menu = Menu.buildFromTemplate([
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
                        browserWindow.webContents.send(FILE_OPEN_CHANNEL, pickedFile.filePaths[0]);
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
