# Map It

> Any place. Any style. Poster-ready.

Map It is a single-file map poster generator. Search for a city, address, or coordinate, style the map, add captions and markers, then export a high-resolution poster image.

## What It Does

Map It renders interactive vector maps in the browser and turns the current view into a designed poster. The export pipeline composites the map canvas, overlays, captions, frames, badges, and post-processing effects into a final image.

## Features

- Search by city, address, place, or coordinates
- Multiple map color presets
- Manual water, land, road, and label color controls
- 3D pitch, bearing, and building extrusion controls
- Label, road name, boundary, building, and satellite toggles
- Caption, marker, coordinate stamp, and city badge overlays
- Poster frames with optional rounded corners, vignette overlays, and export ratios
- Export styles: Normal, Dither, Halftone, Duotone, Circuit, and Watercolor
- High-resolution PNG export

## Tech

- Mapbox GL JS for browser map rendering
- OpenFreeMap / OpenStreetMap-based vector map data
- Nominatim for location search
- Wikipedia summary API for optional place captions
- Canvas 2D for export compositing and post-processing effects
- No backend, no framework, one main HTML file

Map service credentials are intentionally not documented here. Keep production keys restricted and do not expose private credentials in public documentation.

## Watercolor Effect

The watercolor style is implemented as a canvas post-processing effect. It does not replace the map renderer. The app first renders the map normally, then applies a watercolor pass during preview and export:

- soft wash by blending the map with a blurred copy
- light desaturation and paper-toned color lift
- edge bleed based on local luminance contrast
- pigment bleed that lets color drift slightly outside linework
- separate wetter diffusion for water and softer diffusion for green areas
- rough line variation for drier, less digital edges
- deterministic paper grain and fiber texture
- cached low-resolution noise fields for faster previews and exports
- high-resolution exports process the watercolor pass on a capped work canvas, then scale back to the final poster size
- shared preview/export function so the on-screen preview matches the final PNG

This keeps the project single-file and avoids external texture assets that could taint the export canvas.

## Try It

[mapitapp.cc](https://mapitapp.cc)

## Made By

Design by [Mog](mailto:daftlamb@gmail.com)

Part of the It series of single-purpose creative tools.
