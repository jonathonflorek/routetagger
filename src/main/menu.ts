import { Menu, dialog } from 'electron';
import { FILE_OPEN_CHANNEL, FILE_SAVE_CHANNEL } from '../common/constants';

export const menu = Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CommandOrControl+O',
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
                label: 'Save',
                accelerator: 'CommandOrControl+S',
                click: async (_, browserWindow) => {
                    browserWindow.webContents.send(FILE_SAVE_CHANNEL);
                },
            },
            {
                label: 'Devtools',
                role: 'toggleDevTools',
            }
        ],
    },
]);
