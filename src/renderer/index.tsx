import { ipcRenderer } from 'electron'
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { fileOpenChannel, fileSaveChannel } from '../common/constants';

ReactDom.render(<>Hello Express</>, document.getElementById('react-root'))

ipcRenderer.on(fileOpenChannel, (_, fileName: string) => alert(fileName + ' opened'));
ipcRenderer.on(fileSaveChannel, (_, fileName: string) => alert(fileName + ' saved'));
