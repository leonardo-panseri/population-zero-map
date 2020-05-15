const markers = {
    "icon_base": "images/markers/",
    "materials": {
        "Salt": {
            "icon": "salt.png",
            "size": [30,40],
            "coords": [[3000,3000],[3000,4000]]
        },
        "Hull Fragment": {
            "icon": "hull_fragment.png",
            "size": [30,40],
            "coords": [[2000,3000]]
        },
        "Bractus Resin": {
            "icon": "bractus_resin.png",
            "size": [30,40],
            "coords": [[4000,3000],[4000,3500],[4000,4000]]
        }
    }
};

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

// Load markers
const overlay_materials = {};
for(let key in markers['materials']) {
    let material = markers['materials'][key];
    let layerGroup = L.layerGroup();
    for(let coords in material['coords']) {
        coords = material['coords'][coords];
        layerGroup.addLayer(
            L.marker(coords, {icon: L.icon({
                iconUrl: markers['icon_base'] + material['icon'],
                iconSize: material['size']
            })}));
    }

    layerGroup.addTo(map);
    overlay_materials[key] = layerGroup;
}

// Add control for layers
L.control.layers(null, overlay_materials).addTo(map);

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
