# Routetagger

This is a utility program for tagging sensor locations with road segments.
Input files are in csv format (delimited by ',' and newlines) with the following columns: id, description, lat, lng.
This program adds a 'waypoints' column containing the waypoints placed by the user.

It expects an instance of `osrm-routed` running at `localhost:5000`.

To run in dev: `npm start` builds and runs it.

## Electron Philosophy

Based on [this](https://stackoverflow.com/a/37669894) answer.

- Electron-specific infrastructure code (menu, app startup, etc.): main process
- Everything else: render process
- Shared constants: `src/common/...`
