import * as React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { LatLng } from "../../common/types";
import { SensorView } from './SensorView';

interface Sensor {
    id: string;
    description: string;
    position: LatLng;
    waypoints: LatLng[];
    geometry: LatLng[];
}

export interface MapViewProps {
    position: LatLng;
    zoom: number;

    sensors: {[sensorId: string]: Sensor};
    selectedSensorId?: string;

    onSensorSelect(sensorId: string | null): void;
    onWaypointsUpdated(path: LatLng[], sensorId: string): void;
}

export class MapView extends React.PureComponent<MapViewProps> {
    public render() {
        return <>
            <Map
                center={this.props.position}
                zoom={this.props.zoom}
                onclick={this.onclick}
            >
                <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
                />
                {Object.values(this.props.sensors).map(sensor => (
                    <SensorView
                        key={sensor.id}
                        id={sensor.id}
                        isSelected={sensor.id === this.props.selectedSensorId}
                        title={sensor.id + ' ' + sensor.description}
                        position={sensor.position}
                        waypointPositions={sensor.waypoints}
                        geometryPositions={sensor.geometry}
                        onSensorSelect={this.props.onSensorSelect}
                        onWaypointsUpdated={this.props.onWaypointsUpdated}
                    />
                ))}
            </Map>
        </>;
    }

    private onclick = (event: LeafletMouseEvent) => {
        if (this.props.selectedSensorId !== undefined) {
            const oldWaypoints = this.props.sensors[this.props.selectedSensorId].waypoints;

            // max 2 endpoints
            if (oldWaypoints.length > 1) {
                return;
            }

            const newWaypoints = oldWaypoints.concat(event.latlng);
            this.props.onWaypointsUpdated(newWaypoints, this.props.selectedSensorId);
        }
    }
}
