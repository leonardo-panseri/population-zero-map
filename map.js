/*
 * Object representing all markers present on the map
 */
const markers = {
    icon_base: "images/markers/",
    shadow: {
        icon: "material_shadow.png",
        size: [27,17]
    },
    materials: {
        "Blue Essence": {
            icon: "blue_essence.png",
            size: [30,40],
            coords: [[1000,3000],[1000,4000]]
        },
        "Bractus Pieces": {
            icon: "bractus_pieces.png",
            size: [30,40],
            coords: [[1500,3000],[1500,4000]]
        },
        "Bractus Resin": {
            icon: "bractus_resin.png",
            size: [30,40],
            coords: [[2000,3000],[2000,4000]]
        },
        "Cryopod Battery": {
            icon: "cryopod_battery.png",
            size: [30,40],
            coords: [[2500,3000],[2500,4000]]
        },
        "Hull Fragment": {
            icon: "hull_fragment.png",
            size: [30,40],
            coords: [[3000,3000],[3000,4000]]
        },
        "Limestone": {
            icon: "limestone.png",
            size: [30,40],
            coords: [[3500,3000],[3500,4000]]
        },
        "Peat": {
            icon: "peat.png",
            size: [30,40],
            coords: [[4000,3000],[4000,4000]]
        },
        "Salt": {
            icon: "salt.png",
            size: [30,40],
            coords: [[4500,3000],[4500,4000]]
        },
        "Spiral Stem": {
            icon: "spiral_stem.png",
            size: [30,40],
            coords: [[5000,3000],[5000,4000]]
        },
        "Thorium": {
            icon: "thorium.png",
            size: [30,40],
            coords: [[5500,3000],[5500,4000]]
        },
        "Void Sample": {
            icon: "void_sample.png",
            size: [30,40],
            coords: [[6000,3000],[6000,4000]]
        },
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

/*
 * Custom control overlay for displaying an info div
 */
L.Control.InfoControl = L.Control.extend({
    onAdd: function(map) {
        let div = L.DomUtil.create('div');
        L.DomUtil.addClass(div, 'leaflet-control-info hidden');

        div.innerHTML = "<h2><img id='leaflet-control-info-icon' src='images/info.png' alt='Info'><span>Gathered by:</span></h2>" +
            "<hr><ul>" +
                "<li><img src='images/gather_pickaxe.png' alt='Pickaxe'>Pickaxe</li>" +
                "<li><img src='images/gather_knife.png' alt='Pickaxe'>Knife</li>" +
                "<li><img src='images/gather_hand.png' alt='Pickaxe'>Hand</li>" +
            "</ul>";

        return div;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
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

// Add info overlay
const infoControl = new L.Control.InfoControl({position: 'bottomleft'}).addTo(map);
const icon = document.getElementById('leaflet-control-info-icon');
icon.addEventListener('click', () => {
    infoControl.getContainer().classList.toggle('hidden');
});

// Load markers and marker controls
const overlays = [];

const materialLayers = {};
for(let key in markers['materials']) {
    let material = markers['materials'][key];
    let layerGroup = L.layerGroup();
    for(let coords in material['coords']) {
        coords = material['coords'][coords];
        layerGroup.addLayer(
            L.marker(coords, {
                icon: L.icon({
                    iconUrl: markers['icon_base'] + material['icon'],
                    iconSize: material['size'],
                    iconAnchor: [15,40],
                    shadowUrl: markers['icon_base'] + markers['shadow']['icon'],
                    shadowSize: markers['shadow']['size'],
                    shadowAnchor: [1,16]
                }),
                alt: key
            }));
    }

    materialLayers[key] = layerGroup;
}

overlays.push({
    groupName: 'Materials',
    expanded: true,
    layers: materialLayers
});

// Add control for layers
L.Control.styledLayerControl(null, overlays, {
    collapsed: false,
    group_togglers: {
        show: true,
        labelAll: 'All',
        labelNone: 'None'
    },
    container_width: "200px"
}).addTo(map);

// On click open a popup displaying the quadrant name
const quadrantPopup = L.popup();
map.on('click', e => {
    if(isInBounds(e.latlng)) {
        quadrantPopup
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

// If a GET parameter named debug is found add a marker to get precise coordinates
if(window.location.search.search("debug") !== -1) {
    L.marker([3000,3000], {draggable: true}).bindPopup("").addTo(map)
        .on('moveend', e => {
            let marker = e.target;
            marker.getPopup().setContent(marker.getLatLng().toString());
            marker.openPopup();
        });
}
