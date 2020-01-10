import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { FileState } from '../store/reducers';
import { MapView } from '../components/MapView';
import { selectSensor, unselectSensor, LatLng, updateSensorWaypoints } from '../store/actions';

function mapStateToProps(state: FileState) {
    return {
        position: { lat:43.6532, lng:-79.3832 },
        zoom: 13,
        sensors: state.sensors,
        selectedSensorId: state.selectedSensorId,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSensorSelect: (sensorId: string | null) => dispatch(sensorId !== null ? selectSensor(sensorId) : unselectSensor()),
        onWaypointsUpdated: (path: LatLng[], sensorId: string) => dispatch(updateSensorWaypoints(sensorId, path)),
    }
}

export const MapScreen = connect(mapStateToProps, mapDispatchToProps)(MapView);
