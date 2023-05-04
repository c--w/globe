var g_countries;

function polygonClick(polygon, event, { lat, lng, altitude }) {
    console.log(polygon);
    let obj = world.scene().children[3].children[0].children[4].children.filter(item => item.__data.data.properties == polygon.properties);
    console.log(obj);
    guess(obj);
}

const world = Globe({ animateIn: false })
    (document.getElementById('globeViz'))
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .pointOfView({ altitude: 2 }, 2000)
    .polygonCapColor(feat => 'rgba(255, 255, 0, 0.2)')
    .polygonAltitude(0.005)
    .polygonSideColor(() => 'rgba(200, 200, 200, 0.5)')
    .onPolygonClick(polygonClick)
    .polygonLabel(({ properties: d }) => `<b>${d.admin} (${d.iso_a2})</b> <br />Population: <i>${Math.round(+d.pop_est / 1e4) / 1e2}M</i>`)

var g_countries_geo;
fetch('/custom.geo.json').then(res => res.json()).then(countries => {
    g_countries_geo = countries;
    g_countries = g_countries_geo.features.filter(d => d.properties.iso_a2 !== 'AQ').map(c => c.properties.admin);
    world.polygonsData(countries.features.filter(d => d.properties.iso_a2 !== 'AQ'));
    initGame();
});

var g_country;
function initGame() {
    g_country = chooseRandom(g_countries_geo.features);
}

function guess(objs) {
    let country = objs[0].__data.data;
    let color;
    if (g_country.properties.admin == country.properties.admin) {
        document.querySelector('#distance').innerHTML=g_country.properties.admin + " - You found it!";
        color = new THREE.Color("hsl(0, 100%, 100%)");
    } else {
//        let d = dist(getCenter(g_country.bbox), getCenter(country.bbox))
        let d = dist([g_country.properties.label_x, g_country.properties.label_y], [country.properties.label_x, country.properties.label_y])
        d = Math.floor(d / 1000);
        document.querySelector('#distance').innerHTML=d + ' km';
        var hue = Math.floor((1 - d / 20000) * 240);
        color = new THREE.Color("hsl(" + hue + ", 100%, 50%)");
    }
    objs.forEach(obj => {
        obj.children[0].material[1].color.set(color);
        obj.children[0].material[1].opacity = 0.8;
    })
}

function reset() {
    let color = new THREE.Color("hsl(60, 100%, 50%)");
    world.scene().children[3].children[0].children[4].children.forEach(obj => {
        obj.children[0].material[1].color.set(color);
        obj.children[0].material[1].opacity = 0.2;
    })
    g_country = chooseRandom(g_countries_geo.features);
}
function getCenter(bbox) {
    return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
}
function chooseRandom(a) {
    return a[Math.floor(Math.random() * a.length)];
}
