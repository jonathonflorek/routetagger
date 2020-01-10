import * as React from 'react';
import { Marker } from 'react-leaflet';
import { divIcon, DragEndEvent } from 'leaflet';
import { LatLng } from '../../common/types';

export interface SensorWaypointViewProps {
    index: number;
    position: LatLng;

    onMoved(newPosition: LatLng, index: number): void;
    onRemoved(index: number): void;
}

export class SensorWaypointView extends React.PureComponent<SensorWaypointViewProps> {
    public render() {
        return <>
            <Marker
                icon={this.getWaypointIcon()}
                position={this.props.position}
                draggable={true}
                ondragend={this.ondragend}
                onclick={this.onclick}
            />
        </>;
    }

    private ondragend = (event: DragEndEvent) => {
        this.props.onMoved(event.target.getLatLng(), this.props.index);
    }

    private onclick = () => {
        this.props.onRemoved(this.props.index);
    }
    
    private getWaypointIcon() {
        return divIcon({
            iconAnchor: [0, 24],
            popupAnchor: [0, -36],
            html: `
                <span class="routetagger-pin routetagger-pin-route">
                    <span class="routetagger-pin-route-text">${this.props.index}</span>
                </span>
            `
        });
    }
}
