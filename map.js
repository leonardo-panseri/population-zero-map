/* A coordinate reference system that maps 1 pixel to 1 map unit
   The tiles are 256x256px, so Leaflet CRS.Simple uses by default latitude and longitude 0 to 256
   The tiles cover an 8192x8192px area, so the scale factor is 1/32
   The coordinates start from the top left corner and are represented in the code as [y,x]
*/
const p0_crs = L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1/32, 0, 1/32, 0),
});

// Bounds of the map, cutting out unnecessary tiles
const bounds = [[362,0], [7832,8192]];
const map = L.map('map', {
    crs: p0_crs,
    maxBounds: bounds
}).fitBounds(bounds);

L.tileLayer('images/map/{z}/{x}/{y}.jpg', {
    minZoom: 2,
    maxZoom: 5,
    noWrap: true,
    bounds: bounds,
    // useCache: true,
    // crossOrigin: true
}).addTo(map);

// If a GET parameter named debug is found add a marker to get precise coordinates
if(window.location.search.search("debug") !== -1) {
    L.marker([3000,3000], {draggable: true}).bindPopup("").addTo(map)
        .on('moveend', e => {
            let marker = e.target;
            marker.getPopup().setContent(marker.getLatLng().toString());
            marker.openPopup();
        });
}

//Test marker
L.marker([2000,2000], {icon: L.icon({iconUrl: 'images/markers/salt.png',
        iconSize: [70, 69]})}).addTo(map);

// On click open a popup displaying the quadrant name
map.on('click', e => {
    if(isInBounds(e.latlng)) {
        L.popup()
            .setLatLng(e.latlng)
            .setContent('<p>Quadrant: ' + getQuadrant(e.latlng) + '</p>')
            .openOn(map);
    }
});

// Transform map coordinates in quadrant name
function getQuadrant(latlng) {
    // The quadrants are 370x370px and the first quadrant starts at [395,16]
    let y = Math.floor((latlng.lat-395)/370);
    let x = Math.floor((latlng.lng-16)/370) + 1;

    // Get the ASCII code of the capital letter representing the quadrant
    y = Math.abs(y-19) + 65;

    return String.fromCharCode(y) + " " + x;
}

function isInBounds(latlng) {
    return latlng.lat > bounds[0][0] && latlng.lng > bounds[0][1] &&
        latlng.lat < bounds[1][0] && latlng.lng < bounds[1][1];
}
