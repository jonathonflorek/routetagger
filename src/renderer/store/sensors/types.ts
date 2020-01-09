export interface Sensor {
    id: string;
    name: string;
    geoLocation: GeoLocation;
    attributes: SensorAttributes | null;
}

export interface SensorAttributes {
    coverageWaypoints: GeoLocation[];
    coverageDistance: number;
    displayWaypoints: GeoLocation[];
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
}
