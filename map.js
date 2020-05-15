const p0_crs = L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1/32, 0, 1/32, 0),
});

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
    useCache: true,
    crossOrigin: true
}).addTo(map);


map.on('click', e => {
   console.log(e.latlng)
});
