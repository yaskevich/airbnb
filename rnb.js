var defLayerName = "JawgMaps"
var osm_attr = '&copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> | <a href="https://www.jawg.io/en/" target="_blank">JawgMaps<a>';
var def = L.tileLayer('https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=As2pQo4ZwpsqvWrp50BfEsgrY3HuwvPop4KJWhul88Y2wKof1QfYu5IOFOjSPSws', {
    maxZoom: 19,
    minZoom: 6,
    opacity: 1,
    attribution: osm_attr
});

var baseLayers = {
    "OSM": L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 6,
        opacity: 1,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    "OSM (no lbl)": L.tileLayer('https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 6,
        opacity: 1,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    "Watercolor": L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
        maxZoom: 19,
        minZoom: 6,
        opacity: 1,
        attribution: 'Map tiles</a> by <a target="_blank" href="http://stamen.com">Stamen Design</a>, under <a target="_blank" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_blank" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
    }),
    "River (OSM)": L.tileLayer('https://{s}.tile.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 6,
        opacity: 1,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
};
baseLayers[defLayerName] = def;

var overlays = {};

var map = L.map('map', {
    zoomControl: false,
    center: [55.75, 37.616667],
    zoom: 10,
    layers: [def],
});
L.control.layers(Object.assign(baseLayers), overlays).addTo(map);


var svgLayer = L.svg();
svgLayer.addTo(map);

var svg = d3.select("#map").select("svg");
var g = d3.select("#map").select("svg").select('g');
g.style("z-index", "999");

var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
    return d.min;
});
svg.call(tip);

d3.json("data.json", function(htls) {

    htls.forEach(function(d) {
        d.LatLng = new L.LatLng(d.lat, d.lon)
    })

    var colors = d3.scaleQuantize()
        .domain([0, 2])
        .range(['#f1eef6', '#d7b5d8', '#df65b0', '#dd1c77', '#980043']);

    var cls = ['#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'];

    var feature = g.selectAll("circle")
        .data(htls)
        .enter().append("circle")
        .style("stroke", "pink")
        .style("fill", function(d) {
            return colors(parseFloat(d.min));
        })
        .attr("r", 5)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
		.on('click' , function(d){ 
			console.log(d);
		});
    map.on("viewreset", update);
    map.on("zoomend", update);
    update();

    function update() {
        console.log("update zoom");
        feature.attr("transform",
            function(d) {
                return "translate(" +
                    map.latLngToLayerPoint(d.LatLng).x + "," +
                    map.latLngToLayerPoint(d.LatLng).y + ")";
            }
        )
    }
})

var customControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom info');
        return container;
    },
    update: function(props) {
        this._container.innerHTML = props;
    }
});

var info = new customControl();
map.addControl(info);
info.update(defLayerName);
map.on('baselayerchange', function(e) {
    info.update(e.name);
});

var layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0];