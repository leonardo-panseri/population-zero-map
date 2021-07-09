# Population Zero map
An interactive map for Population Zero game, a survival MMO created and published by Enplex Games LLC.  
Realized using the [Leaflet](https://leafletjs.com/) library and a custom version of [StyledLayerControls](https://github.com/davicustodio/Leaflet.StyledLayerControl) plugin.
The tile images are obtained from a very high resolution image of the in-game map using the [Photoshop Google Maps Tile Cutter](https://github.com/bramus/photoshop-google-maps-tile-cutter)
plugin and then compressed in bulk with [Guetzli](https://github.com/google/guetzli) using a [custom PowerShell script](https://github.com/leonardo-panseri/population-zero-map/blob/master/compress.ps1).
<br>
The final result can be seen on [GitHub pages](https://leonardo-panseri.github.io/population-zero-map/) (please note that markers current locations are just for testing, 
the coordinates for the markers can be found at the start of [map.js](https://github.com/leonardo-panseri/population-zero-map/blob/master/map.js) script).
