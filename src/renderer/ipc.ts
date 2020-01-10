import { ipcRenderer } from 'electron';
import { Dispatch } from 'redux';
import { FILE_OPEN_CHANNEL } from '../common/constants';
import { selectFile, Action } from './store/actions';

export function registerIpcDispatch(dispatch: Dispatch<Action>) {
    ipcRenderer.on(
        FILE_OPEN_CHANNEL,
        (_, fileName: string) => {
            dispatch(selectFile(fileName));
        });
}
