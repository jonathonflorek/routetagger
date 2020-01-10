import * as React from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { LatLng } from '../../common/types';
import { SensorWaypointView } from './SensorWaypointView';

interface SensorViewProps {
    id: string;
    title: string;
    position: LatLng;
    waypointPositions: LatLng[];
    geometryPositions: LatLng[];
    isSelected: boolean;

    onSensorSelect(id: string | null): void;
    onWaypointsUpdated(waypointPositions: LatLng[], id: string): void;
}

export class SensorView extends React.PureComponent<SensorViewProps> {
    public render() {
        const zIndexOffset = this.props.isSelected ? 1 : 0;
        const geometryLineColor = this.props.isSelected ? 'blue' : 'green';
        const geometryLineWeight = this.props.isSelected ? 12 : 3;
        return <>
            <Marker
                icon={this.getSensorIcon()}
                position={this.props.position}
                zIndexOffset={zIndexOffset}
                onclick={this.onclick}
            >
                <Popup closeButton={false} >{this.props.title}</Popup>
            </Marker>
            {this.props.geometryPositions.length > 1 ? <Polyline
                positions={this.props.geometryPositions}
                color={geometryLineColor}
                weight={geometryLineWeight}
            /> : undefined}
            {this.props.isSelected ? this.props.waypointPositions.map((position, index) => (
                <SensorWaypointView
                    key={index}
                    index={index}
                    position={position}

                    onMoved={this.onWaypointMoved}
                    onRemoved={this.onWaypointRemoved}
                />
            )) : undefined}
        </>
    }

    private onWaypointMoved = (newPosition: LatLng, index: number) => {
        const newWaypoints = this.props.waypointPositions.map((way, i) => i !== index ? way : newPosition);
        this.props.onWaypointsUpdated(newWaypoints, this.props.id);
    }

    private onWaypointRemoved = (index: number) => {
        const newWaypoints = this.props.waypointPositions.filter((_, i) => i !== index);
        this.props.onWaypointsUpdated(newWaypoints, this.props.id);
    }

    private onclick = () => {
        if (this.props.isSelected) {
            this.props.onSensorSelect(null);
        } else {
            this.props.onSensorSelect(this.props.id);
        }
    }

    private getSensorIcon() {
        return divIcon({
            iconAnchor: [0, 24],
            popupAnchor: [0, -36],
            html: `<span class="routetagger-pin routetagger-pin-${this.getStatus()}"/>`
        });
    }

    private getStatus() {
        if (this.props.isSelected) {
            return 'pending';
        }
        if (this.props.waypointPositions.length === 0) {
            return 'default';
        }
        if (this.props.waypointPositions.length === 1) {
            return 'error';
        }
        return 'done';
    }
}
