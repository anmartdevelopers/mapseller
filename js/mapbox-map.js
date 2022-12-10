//  Created by Nauman Qazi (itsnomihere@gmail.com)
//  Copyright (c) 2016 Nauman Qazi. All rights reserved.
var map;
var zoomLvl = 10;
var lat = '-37.81361100000001';
var lng = '144.96305600000005';
var MAX_DESTINATION_COUNT = 40;
var selectedOrientation = 'portrait';
var selectedSize = "PDF";
var _DEBUG_ = (location.hostname === "localhost" || location.hostname === "127.0.0.1");
var oldBounds;
var cities = [];
var DOWNLOADSVG = false;
var isOkToLeaveSite = false;
var manualRouteClicked = false;
var pointCount = 1;
var donNotFitToBound = false;
var filtered_cities = () => {
    return cities.filter(c => !c.archived);
}
var isFlightPath = false;
mapboxgl.accessToken = 'pk.eyJ1IjoidGhpanNzb25kYWciLCJhIjoiY2phOHI2MXNuMDh3dzMzanVhZXlzanU4byJ9.L3vNl1ehNadAt1JWPJqgiA';

const OVERLAY_DEFAULTS = {
    topRight: {
        fontFamily: 'HKGrotesk-Medium',
        lineHeight: 33,
        fontSize: 18,
        letterSpacing: 3.75,
        iconSpacing: 5,
        iconHeight: 24,
        weight: 500,
        color: undefined,
    }
}
const currYear = new Date().getFullYear();
const app = {
    overlay: {
        title: { text: 'KENYA', fontFamily: 'HKGrotesk-Medium' },
        subtitle: { text: 'JAN - DEC ' + currYear, fontFamily: 'HKGrotesk-Medium' },

        time: { visible: true, text: '3:49:12', icon: 'images/icons/time@1.5x.svg', ...OVERLAY_DEFAULTS.topRight },
        meters: { visible: false, text: '3994m', icon: 'images/icons/meters@1.5x.svg', ...OVERLAY_DEFAULTS.topRight },
        kms: { visible: true, text: '32.6 km', icon: 'images/icons/kms@1.5x.svg', ...OVERLAY_DEFAULTS.topRight },

        showTopRight: true,
        paddingTop: 18,
        paddingRight: 18,
    },

    mapContainer: {
        width: 468,
        height: 662,
    },

    thumbnail: {
        width: 448,
        height: 642,
    },

    style: {
        penWidth: 2,
        loopBack: false,
        ...STYLES.blue,
    },
    styles: STYLES,

    pos: [
        { position: 'right', offset: [-1.3, 0] },
        { position: 'bottom', offset: [0, 1.3] },
        { position: 'left', offset: [1.3, 0] },
        { position: 'top', offset: [0, -1.3] },
    ],

    fonts: {},
    annotations: {},
    gpx: {}
}


const loadFont = cached((url) => opentype.load(url), (url) => url, app.fonts)

async function selectFontForText(fonts, text, fallback = null) {
    // console.log(getCharacterEncodes(text))

    for (const url of fonts) {
        const font = await loadFont(url)
        const gs = font.stringToGlyphs(text)
        if (gs.every((c) => c.index)) {
            return font
        }
    }

    return fallback && await loadFont(fallback)
}

async function drawSvg(width, height, isLandscape, title, subtitle, time, meters, kms, color, fonts) {
    //remove svg if it already exists
    if (SVG('#mapCover')) {
        SVG('#mapCover').remove();
    }

    //create new svg
    var draw = SVG().attr('id', 'mapCover').attr('preserveAspectRatio', 'none').attr('style', 'z-index:1; position:absolute;').attr('pointer-events', 'none').addTo('#map-container');
    draw.viewbox(0, 0, width, height)
        .size(width, height);

    var linear = draw.gradient('linear', function(add) {
        add.stop({ offset: 0, color: color, opacity: 1 })
        add.stop({ offset: 1, color: color, opacity: 0 })
    });
    draw.rect(287, width).move(0.0, height).transform({ rotate: -90, origin: 'top left' }).fill(linear);

    // weighted geometric mean size of svg
    const meanSize = 0.871 * (height * width) ** 0.5

    const smallFontSize = Math.ceil(meanSize / 28)
        // const middle = font.descender / font.unitsPerEm * fontSize;
    const smallLetterSpacing = meanSize / 85 / smallFontSize

    // calculate position from the bottom of canvas to the bottom subtitle
    const padding = isLandscape ? 0.056 : 0.039
    let y = height - padding * height

    if (subtitle && subtitle.text) {
        const font = await selectFontForText(fonts.subtitle, subtitle.text, fonts.subtitle[0])
        const { width: w, height: h, d } = svgTextToPath({
            text: subtitle.text,
            fontSize: smallFontSize,
            options: { hinting: true, letterSpacing: smallLetterSpacing },
            font,
        });

        y -= h

        draw.path(d)
            .attr('id', 'tripDetailText')
            .fill({ color: subtitle.color })
            .stroke({ color: subtitle.color, width: 1 }) // , linecap: 'round', linejoin: 'round'
            .transform({ translate: [(width - w) / 2, y] });
    }

    y -= smallFontSize;

    if (title && title.text) {
        const text = title.text;
        const font = await selectFontForText(fonts.title, text, fonts.title[0])

        const len = text.length
        const fontSize = Math.ceil(len < 13 ? (meanSize / 14) : (meanSize / 14) - ((len - 13) * 1.25));
        const letterSpacing = Math.max(4, Math.ceil(len < 13 ? meanSize / 52 : meanSize / 52 - (len - 13) / .75)) / fontSize;
        // const middle = font.descender / font.unitsPerEm * fontSize;

        const { width: w, height: h, d } = svgTextToPath({
            text: text,
            fontSize,
            options: { hinting: true, letterSpacing },
            font,
        });

        y -= h;

        draw.path(d)
            .attr('id', 'tripNameText')
            .fill({ color: title.color })
            .stroke({ color: title.color, width: 1 }) // , linecap: 'round', linejoin: 'round'
            .transform({ translate: [(width - w) / 2, y] });
    }

    const stats = [
        { key: "time", ...time },
        { key: "km", ...kms },
        { key: "meter", ...meters },
    ].filter(x => x.visible);

    if (stats.length) {
        var radial = draw.gradient('radial', function(add) {
            add.stop({ offset: 0, color: color, opacity: 1 })
            add.stop({ offset: 0.824489, color: color, opacity: 0.5 })
            add.stop({ offset: 1, color: color, opacity: 0 })
        });

        draw.rect(400, 400.0).move((width - 200), -200).fill(radial);

        var positions = [12, 43, 74];
        const statLetterSpacing = 1.1 * smallLetterSpacing

        const drawText = async(text, row) => {
            const font = await selectFontForText(fonts.stat, text, fonts.stat[0])
            const { width: w, height: h, d } = svgTextToPath({
                text: text,
                fontSize: smallFontSize,
                options: { hinting: true, letterSpacing: statLetterSpacing },
                font,
            });

            draw.path(d)
                .fill({ color: title.color })
                .stroke({ color: title.color, width: 1 })
                .transform({ translate: [width - 107, positions[row] + h / 2] });
        };

        for (const [j, stat] of stats.entries()) {
            await drawText(stat.text, j)

            switch (stat.key) {
                case "time":
                    draw.path("M358.854 14.051C353.851 14.051 349.791 18.066 349.791 23.0146C349.791 27.9633 353.851 31.9782 358.854 31.9782C363.858 31.9782 367.917 27.9633 367.917 23.0146C367.917 18.066 363.858 14.051 358.854 14.051Z").fill({ opacity: 0.0 }).stroke({ color: title.color, width: 1.51049, linecap: 'round', linejoin: 'round' }).transform({ translate: [-348.854 + (width - 148), -14.051 + 3.0 + positions[j]] });
                    draw.path("M358.855 17.0389V23.7616H363.387").stroke({ color: title.color, width: 1.51049, linecap: 'round', linejoin: 'round' }).fill({ opacity: 0.0 }).transform({ translate: [-348.854 + (width - 148), -14.051 + 3.0 + positions[j]] });
                    break;
                case "km":
                    draw.path("M350.036 50.067H351.744V53.488L354.951 50.067H357.194L353.79 53.488L357.368 58.3742H355.137L352.572 54.7448L351.744 55.5958V58.3742H350.036V50.067ZM365.407 50.067H367.903V58.3742H366.286V52.7553C366.286 52.5937 366.288 52.3683 366.291 52.079C366.295 51.7859 366.297 51.5605 366.297 51.4027L364.725 58.3742H363.04L361.478 51.4027C361.478 51.5605 361.48 51.7859 361.484 52.079C361.488 52.3683 361.49 52.5937 361.49 52.7553V58.3742H359.872V50.067H362.397L363.908 56.5989L365.407 50.067Z").fill(title.color).transform({ translate: [-350.036 + (width - 148), -50.067 + 8.0 + positions[j]] });
                    break;
                case "meter":
                    draw.path("M348.38 91.043L348.237 90.964C348.129 91.1602 348.133 91.3983 348.249 91.5903C348.364 91.7821 348.573 91.8985 348.797 91.8987H348.797H368.749H368.749V91.7354C368.919 91.7356 369.075 91.6469 369.16 91.5025L348.38 91.043ZM348.38 91.043L354.081 80.739C354.158 80.598 354.304 80.5061 354.466 80.4956L354.455 80.3327C354.455 80.3327 354.456 80.3327 354.456 80.3327C354.673 80.3185 354.883 80.4151 355.012 80.5896L357.497 83.943L360.577 77.8698M348.38 91.043L369.301 91.5855C369.416 91.3902 369.417 91.1489 369.303 90.9529L369.303 90.9529L361.702 77.8385L361.698 77.8312L361.698 77.8314C361.575 77.6421 361.365 77.5263 361.139 77.5211L361.131 77.521L361.131 77.5212C360.896 77.5276 360.683 77.6608 360.577 77.8698M348.38 91.043L348.237 90.9639L353.938 80.6603L348.38 91.043ZM360.577 77.8698L360.723 77.9436M360.577 77.8698L360.578 77.8697L360.723 77.9436M360.723 77.9436C360.801 77.7889 360.96 77.6892 361.135 77.6844C361.308 77.6883 361.468 77.7769 361.561 77.9204L360.723 77.9436ZM367.647 90.6355L361.186 79.4871L355.532 90.6355H367.647ZM349.873 90.6355H354.103L356.855 85.2106L354.576 82.1369L349.873 90.6355Z").fill(title.color).stroke({ color: title.color, width: '0.33' }).transform({ translate: [-348.38 + (width - 148), -91.043 + 17.0 + positions[j]] });
                    break;
                default:
                    break;
            }
        }

    }

}

async function updateOverlay(options) {
    if (!map) {
        return
    }

    const fonts = {
        title: [
            'fonts/hk-grotesk/HKGrotesk-Medium.woff',
        ],
        subtitle: [
            'fonts/hk-grotesk/HKGrotesk-Regular.woff',
        ],
        stat: [
            'fonts/hk-grotesk/HKGrotesk-Regular.woff',
        ],
    }

    const { overlayTitleColor, overlaySubtitleColor } = app.style;
    const isLandscape = selectedOrientation === 'landscape';

    const { overlay, style: { gradient } } = app;

    // 448 and 642 to match the map size
    let { width, height } = app.thumbnail;
    if (isLandscape) {
        [width, height] = [height, width];
    }

    await drawSvg(
        width,
        height,
        isLandscape, { text: overlay.title.text, color: overlayTitleColor }, { text: overlay.subtitle.text, color: overlaySubtitleColor },
        overlay.time,
        overlay.meters,
        overlay.kms,
        gradient.stop,
        fonts
    );
}

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // IE 12 => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function deleteLocation(city_name) {
    for (var i = filtered_cities().length - 1; i >= 0; --i) {
        if (filtered_cities()[i].city_name == city_name) {
            filtered_cities()[i].archived = true;
            completeRedraw();
            break;
        }
    }
}

function changeOrder(direction, city_name) {
    for (var i = cities.length - 1; i >= 0; --i) {
        if (cities[i].city_name == city_name) {
            const j = i + direction
            if (cities[j]) {
                const tmp = cities[i];
                cities[i] = cities[j];
                cities[j] = tmp;
                completeRedraw();
            }
            break;
        }
    }
}

function getCity(layer_id) {
    var city_name = layer_id.replace("points_", "");

    for (var j = cities.length - 1; j >= 0; --j) {
        if (cities[j].city_name == city_name) {
            return cities[j];
        }
    }
    return 0;

}

function changePosition(city_name) {
    var layer_id = "points_" + city_name;
    if (map.getLayer(layer_id)) {
        const { pos } = app;
        for (var i = 0; i < pos.length; i++) {
            if (pos[i].position == map.getLayoutProperty(layer_id, 'text-anchor')) {
                var nextP = pos[(i + 1) % 4];
                map.setLayoutProperty(layer_id, 'text-anchor', nextP.position);
                map.setLayoutProperty(layer_id, 'text-offset', nextP.offset);
                for (var j = cities.length - 1; j >= 0; --j) {
                    if (cities[j].city_name == city_name) {
                        cities[j].city_anchor = nextP.position;
                        cities[j].city_offset = nextP.offset;
                        break;
                    }
                }
                break;
            }
        }
    }
}


function changeName(city_name) {
    var layer_id = "points_" + city_name;
    var allFeature = map.querySourceFeatures(`source_point_${city_name}`);

    if (allFeature.length > 0 && map.getLayer(layer_id)) {
        for (var j = cities.length - 1; j >= 0; --j) {
            if (cities[j].city_name == city_name) {
                var new_city_name = prompt("Please enter the location name", cities[j].city_name);
                if (new_city_name !== null && new_city_name !== "") {
                    cities[j].city_alias = new_city_name;
                    allFeature[0].properties.title = cities[j].city_alias;
                    completeRedraw();
                }
                break;
            }
        }
    }

}

function changeFontSize(delta, city_name) {
    var layer_id = "points_" + city_name;
    if (map.getLayer(layer_id)) {
        var text_size = delta + map.getLayoutProperty(layer_id, 'text-size');
        map.setLayoutProperty(layer_id, 'text-size', text_size);
        for (var j = cities.length - 1; j >= 0; --j) {
            if (cities[j].city_name == city_name) {
                cities[j].city_textsize = text_size;
                break;
            }
        }
    }

    city_name = city_name.replace(new RegExp(' ', 'g'), '_');
    $('#tsize_' + city_name).text(text_size + 'pt');
}

async function handleGPXFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // use the 1st file from the list
    for (var file in files) {
        app.gpx.data = await loadGpxFile(files[file]);
        app.gpx.fileName = files[file].name
        break;
    }

    completeRedraw();
}

async function completeRedraw(options) {
    const { fitBounds = true } = options || {}
    const filteredCities = filtered_cities()

    document.getElementById('gpx-section').style.display = app.gpx.fileName ? "none" : "block";
    document.getElementById('locationName').innerHTML = '';
    if (app.gpx.fileName) {
        document.getElementById('locationName').innerHTML += `
                <li>
                    <span>${app.gpx.fileName}</span>
                        <div class="pull-right">
                            <img onclick="deleteGpxFile()" src="images/cancel.png">
                        </div>
                </li>
                `;
    }
    document.getElementById('locationName').innerHTML += filteredCities
        .map((currentCity, i) => {
            const cityName = currentCity.city_name
            const cityAlias = currentCity.city_alias.length > 0 ? currentCity.city_alias : cityName

            const cityPath = i > 0 && (currentCity.city_flight_path ? 'flight' : 'car')
            const travelPathImg = !manualRouteClicked && cityPath ? `<img class='travel_${cityPath}_path' />` : ''

            return `
            <li>
                <div class="updown">
                <img class="up" onclick="changeOrder(-1, '${cityName}')" src="images/up.png">
                <img class="down" onclick="changeOrder(1, '${cityName}')" src="images/down.png">
                <img src="images/destination-map.png">
                <span>${cityAlias}</span>
                    <div class="pull-down">
                    ${travelPathImg}
                    <span id='tsize_${cityName.replace(new RegExp(' ', 'g'), '_')}'>16 pt</span>
                    <span onclick="changeFontSize(1,'${cityName}')"> + </span>
                        <span onclick="changeFontSize(-1,'${cityName}')"> - </span>
                        <img onclick="changePosition('${cityName}')" src="images/rotator.png" class="rotator">
                        <i onclick="changeName('${cityName}')" class="fa fa-pencil"></i>
                        <i onclick="deleteLocation('${cityName}')" class="fa fa-close"></i>
                    </div>
                </div>
            </li>
            `
        })
        .join('\n')

    const style = map.getStyle()
    const token = mapboxgl.accessToken
    app.annotations = await annotationLayers(token, filteredCities, app.gpx.data, app.style)

    const deletedSources = {}
    for (const layer of style.layers) {
        if (layer.id.match(/(markers|points|route|arc).*/)) {
            map.removeLayer(layer.id)

            if (layer.source && layer.source.startsWith('gpx_track')) {
                deletedSources[layer.source] = 1;
            }
        }
    }

    for (const source of Object.keys(deletedSources)) {
        map.removeSource(source);
    }

    // document.getElementById('distancelbl').innerHTML = `${(distance / 1000).toFixed(2)}KM`
    const bounds = new mapboxgl.LngLatBounds()
    const { sources, layers } = app.annotations

    for (const layer of layers) {
        const id = layer.source
        const existing = map.getSource(id)
        const source = sources[id] || existing
        if (!source) {
            console.warn(`source not found '${id}' for layer ${layer.id}`)
            continue
        }

        if (id.startsWith('gpx_track')) {
            if (!existing) {
                const { coordinates } = source.data.features[0].geometry
                for (const coord of coordinates) {
                    bounds.extend(coord)
                }
                map.addSource(layer.source, source)
            }
            map.addLayer(layer)
            continue
        }

        const isSourcePoint = id.startsWith('source_point')
        if (isSourcePoint) {
            bounds.extend(source.data.geometry.coordinates)
        }

        if (!existing || !isSourcePoint) {
            if (existing) {
                // might not remove the source, but won't throw,
                // check again if exists and rename if needed
                map.removeSource(id)
                layer.source = map.getSource(id) ? `${id}_${Date.now()}` : id
            }

            map.addSource(layer.source, source)
        }

        map.addLayer(layer)
    }

    if (!donNotFitToBound && fitBounds && (app.gpx.data || filteredCities.length > 1) && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 100 })
    }

}

function mapScreenshot(map) {
    return new Promise((resolve, reject) => {
        map.once('idle', () => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = map.getCanvas().toDataURL()
        })
        map.triggerRepaint()
    })
}

function blobToDataURL(blob) {
    return new Promise(resolve => {
        var a = new FileReader();
        a.onload = (e) => resolve(e.target.result)
        a.readAsDataURL(blob);
    })
}

function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve))
}

function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width
    canvas.height = height
    return canvas
}

async function createThumbnail(map, isLandscape) {
    let { width, height } = app.thumbnail;
    if (isLandscape) {
        [width, height] = [height, width];
    }
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    const svg = document.getElementById('mapCover')
    ctx.drawImage(await mapScreenshot(map), 0, 0, width, height)
    ctx.drawImage(await svgToImg(svg), 0, 0, width, height);
    return canvas
}

function downloadSVGAsPNG(e) {
    const canvas = document.createElement("canvas");
    const svg = document.querySelector('svg');
    const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
    const w = parseInt(svg.getAttribute('width'));
    const h = parseInt(svg.getAttribute('height'));
    const img_to_download = document.createElement('img');
    img_to_download.src = 'data:image/svg+xml;base64,' + base64doc;
    img_to_download.onload = function() {
        canvas.setAttribute('width', w);
        canvas.setAttribute('height', h);
        const context = canvas.getContext("2d");
        //context.clearRect(0, 0, w, h);
        context.drawImage(img_to_download, 0, 0, w, h);
        const dataURL = canvas.toDataURL('image/png');
        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(canvas.msToBlob(), "download.png");
            e.preventDefault();
        } else {
            const a = document.createElement('a');
            const my_evt = new MouseEvent('click');
            a.download = 'download.png';
            a.href = dataURL;
            a.dispatchEvent(my_evt);
        }
    }
}

async function createPrintMap(zoom, center, bearing, pitch, noRedirect) {
    'use strict';

    $.LoadingOverlay("show", {
        image: "",
        textResizeFactor: 0.3,
        fontawesome: "fa fa-cog fa-spin",
        text: "We are working on your banner Hold on buddy ⌚️."
    });

    try {
        const ratio = 12
        const isLandscape = selectedOrientation === "landscape";
        const { style } = app
        const { title, subtitle } = app.overlay
        const {
            gradient,
            statGradient,
            overlayTitleColor,
            overlaySubtitleColor
        } = style

        // city labels might not be in sync with what's displayed on the map,
        // e.g. after clicking changePosition
        const annotations = await annotationLayers(mapboxgl.accessToken, filtered_cities(), app.gpx.data, style)
        annotations.sources = map.getStyle().sources;
        // generate thumbnail
        const thumbnail = await createThumbnail(map, isLandscape)
        const thumbnailImage = canvasToBlob(thumbnail)
        const { width, height } = thumbnail
        let overlay = createCanvas(width * ratio, height * ratio)
        isOkToLeaveSite = true;

        const overlayInfo = {
            ...app.overlay,
            width: overlay.width,
            height: overlay.height
        }

        const svg = document.querySelector('svg');
        const overlaySvgString = svg.outerHTML;

        if (DOWNLOADSVG === true) {
            downloadSVGAsPNG();
        }


        // icons might be objects with html img elements, not json serializable
        for (const [key, entry] of Object.entries(overlayInfo)) {
            const icon = entry.icon;
            if (icon && typeof icon === 'object') {
                overlayInfo[key] = {...entry, icon: icon.url }
            }
        }

        // additional data
        const citiesData = cities.map((x) => ({...x, city_source: {} }))
        const orderData = {
            zoom,
            bearing,
            ratio,
            pitch,
            width,
            height,
            style: style.styleName,
            overlayTitleColor: style.overlayTitleColor,
            overlaySubtitleColor: style.overlaySubtitleColor,
            layersConfig: style,
            isLandscape,
            tcrTripName: title.text,
            tcrTripDetails: subtitle.text,
            overlay: overlayInfo,
            center: center.toArray(),
            mapBounds: map.getBounds().toArray(),
            svgData: overlaySvgString
        }

        const body = new FormData();

        body.append('data', JSON.stringify(orderData))
        body.append('cities', JSON.stringify(citiesData))
        body.append('layers', JSON.stringify(annotations))
        body.append('overlay', "data:null")
        body.append('thumbnail', await thumbnailImage)
        const response = await fetch('https://poster.mapseller.com/map.php', { method: 'POST', body })
        if (!response.ok) {
            throw new Error(`response failed ${response.statusText}`)
        }

        const data = await response.json();
        if (!data.pid && data.pid !== 0) {
            throw new Error('pid is missing');
        }

        const sizeToProductId = { S: 90, M: 91, L: 92, XL: 93, PDF: 715 }
        const productId = sizeToProductId[selectedSize] || 715

        const url = new URL('http://mapseller.com/checkout/')
        const params = url.searchParams
        params.set('add-to-cart', productId)
        params.set('style', style)
        params.set('header', title.text)
        params.set('subheader', subtitle.text)
        params.set('pid', data.pid)

        if (noRedirect) {
            console.log(data, url.toString())
            return
        }

        window.open(url.toString(), "_self");
    } catch (error) {
        console.log(error);

    } finally {
        $.LoadingOverlay("hide");
    }
}

function printClick_resize() {
    var b = map.getBounds();


    var container = document.getElementById("map-container");

    container.style.width = '3508px';
    container.style.height = "4962px";
    map.resize();
    map.fitBounds(b);
    //setTimeout(download, 5000);
    setTimeout(() => {
        console.log(map.getCanvas().toDataURL())
    }, 5000);
}

function downloadImage(blob) {
    var link = document.createElement('a');
    link.download = 'filename.png';
    link.href = URL.createObjectURL(blob);
    $.LoadingOverlay("hide");
    link.click();
}

function printClick(download) {

    var center = map.getCenter();
    var bearing = map.getBearing();
    var pitch = map.getPitch();


    var zoom = map.getZoom(); // * (width/original_w);

    console.log(center + ' ' + bearing + ' ' + pitch + ' ' + zoom + ' ' + map.getStyle());

    createPrintMap(zoom, center,
        bearing, pitch);


}


function openHelp(){
    window.open('https://www.myholidaymap.com/import-your-travel-route-gpx-automatically/', '_blank');
  }
  function openManualRouteHelp(){
    notie.alert({text: 'Click on the Map make the route.', position: 'bottom'});
  
  }

function manualRouteClick(){
    var elm = $("#manualRouteBtn");
    if (!manualRouteClicked) {
        elm.addClass("active");
        manualRouteClicked = true;
        isFlightPath = true;
        donNotFitToBound = true;
        notie.alert({text: 'Click on the Map make the route.', position: 'bottom'});

    } else {
        elm.removeClass("active");
        manualRouteClicked = false;
        isFlightPath = false;
        donNotFitToBound = false;
    }
}

$(document).ready(function() {
    if (detectIE()) {
        notie.alert({ type: 'error', text: 'Our site use advanced web feature and works best on Desktop Chrome or Firefox.'});
    }

    // notie.alert({text: 'Now Drag the names.', position: 'bottom'});

    document.getElementById('upload').addEventListener('change', handleGPXFileSelect, false);

    const beforeUnloadListener = (event) => {
        if(isOkToLeaveSite === false && (filtered_cities().length || app.gpx.data)) {
            event.preventDefault();
            return event.returnValue = "Are you sure you want to exit?";
        }
      };

    addEventListener("beforeunload", beforeUnloadListener, {capture: true});

    $("#travel_car").addClass('active');
    setDimensions();
    /** MapBox Map initialization and EventListener */
    try {
        // Geolocation
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                lng = position.coords.longitude;
                lat = position.coords.latitude;
            });
        }
        map = new mapboxgl.Map({
            container: 'map-container',
            style: app.style.url,
            zoom: zoomLvl,
            pitch: 0,
            center: [lng, lat],
            preserveDrawingBuffer: true,
            zoomControl: false
        });
        var geocoder = new MapboxGeocoder({
            language: 'en',
            flyTo: false,
            accessToken: mapboxgl.accessToken
        });

        document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
        map.doubleClickZoom.disable()

        var option = { showCompass: false, showZoom: false }
        map.addControl(new mapboxgl.NavigationControl(option));
        //map.zoomControl.disable();

        // Add geolocate control to the map.
        //map.addControl(new mapboxgl.GeolocateControl({
        //  positionOptions: {
        //    enableHighAccuracy: true
        // },
        // trackUserLocation: true
        //}));
        map.on('load', function() {
            // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
            // makes a selection and add a symbol that matches the result.
            geocoder.on('result', onGeoCoder);
            updateOverlay()
        });
        //map.scrollZoom.disable();

        map.on('style.load', function() {
            //map.getCanvas().width = '7017px';
            //map.getCanvas().height = '9933px';

            if (filtered_cities().length || app.gpx.data) {
                completeRedraw(map);
            }
        });

        // When the cursor enters a feature in the point layer, prepare for dragging.

        var canvas = map.getCanvasContainer();

        function onMove(e) {
            var coords = e.lngLat;

            // Set a UI indicator for dragging.
            canvas.style.cursor = 'grabbing';
            const geojson = {
                'type': 'FeatureCollection',
                'features': [
                {
                'type': 'Feature',
                'geometry': {
                'type': 'Point',
                'coordinates': [0, 0]
                }
                }
                ]
                };
            geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
            map.getSource(selectedFeatures[0].layer.source).setData(geojson);
        }

        function onUp(e) {
            canvas.style.cursor = '';

            // Unbind mouse/touch events
            map.off('mousemove', onMove);
            map.off('touchmove', onMove);
        }
        map.on('mousedown', function(e) {
            if(!manualRouteClicked){
                findTouchedLabel(e)
            } else {
                addManualRoute(e);
            }
        });

        var selectedFeatures;

        function findTouchedLabel(e) {
            // Update the Point feature in `geojson` coordinates
            // and call setData to the source layer `point` on it.
            selectedFeatures = map.queryRenderedFeatures(e.point);

            if (!selectedFeatures.length || !selectedFeatures[0].layer.layout ||
                selectedFeatures[0].layer.type !== 'symbol') {
                return;
            }

            // Prevent the default map drag behavior.
            e.preventDefault();

            map.on('mousemove', onMove);
            map.once('mouseup', onUp);
        }
        /*map.on('click', function (e) {
            var features = map.queryRenderedFeatures(e.point);

            if (!features.length || !features[0].layer.layout) {
                return;
            }
            // Populate the popup and set its coordinates
            // based on the feature found.
            var layer_id = features[0].layer.id;
            const { pos } = app
            var x = 0;
            var y = 1;
            var offset = 0.5;
            for (var j = cities.length - 1; j >= 0; --j) {
                if (layer_id.indexOf(cities[j].city_name) !== -1) {
                    for (var i = 0; i < pos.length; i++) {
                        if (pos[i].position === cities[j].city_anchor) {
                            switch (pos[i].position) {
                                case 'right':
                                    cities[j].city_offset[x] = cities[j].city_offset[x] - offset;
                                    break;
                                case 'bottom':
                                    cities[j].city_offset[y] = cities[j].city_offset[y] + offset;
                                    break;
                                case 'left':
                                    cities[j].city_offset[x] = cities[j].city_offset[x] + offset;
                                    break;
                                case 'top':
                                    cities[j].city_offset[y] = cities[j].city_offset[y] - offset;
                                    break;
                            }
                            map.setLayoutProperty(layer_id, 'text-offset', cities[j].city_offset);
                            break;
                        }
                    }
                    break;
                }
            }

        });*/
    } catch (e) {
        var mapContainer = document.getElementById('map-container');
        mapContainer.parentNode.removeChild(mapContainer);
        notie.alert({ type: 'error', text: 
        'This application uses the WebGL feature. Normally, refreshing the browser should fix this problem. If the problem persists, send us a message at https://www.myholidaymap.com. '});
        console.log('This site requires WebGL, but your browser doesn\'t seem' +
            ' to support it: ' + e.message);
        return;
    }
    toggleStat($("#icon_date_txt_show"), app.overlay.time.visible);
    toggleStat($("#icon_dist_txt_show"), app.overlay.meters.visible);
    toggleStat($("#icon_tri_txt_show"), app.overlay.kms.visible);
    /** Document Resize */
    $(window).resize(function() {
        setDimensions(map);
        if (map) {
            map.resize();
            updateOverlay();
        }
    });
    /** UI EventListener */
    /*
        document.querySelector("#colorWell").addEventListener("change", (event) => {
            penColor = event.target.value;
        console.log(penColor);
    }, false);
        document.querySelector("#penWidth").addEventListener("change", (event) => {
            penWidth = parseInt(event.target.value, 10);
    }, false);
    */
    function toggleStat(elm, visibility) {
        if (!visibility) {
            elm.addClass("disable-stats");
            elm.removeClass("enable-stats");
        } else {
            elm.removeClass("disable-stats");
            elm.addClass("enable-stats");
        }

    }
    $("#icon_date_txt_show").on('click', () => {
        app.overlay.time.visible ^= 1;
        toggleStat($("#icon_date_txt_show"), app.overlay.time.visible);
        updateOverlay()
    });
    $("#icon_dist_txt_show").on('click', () => {
        app.overlay.meters.visible ^= 1;
        toggleStat($("#icon_dist_txt_show"), app.overlay.meters.visible);
        updateOverlay()
    });
    $("#icon_tri_txt_show").on('click', () => {
        app.overlay.kms.visible ^= 1;
        toggleStat($("#icon_tri_txt_show"), app.overlay.kms.visible);
        updateOverlay()
    });
    $("#icon_date_txt").on("input", () => {
        app.overlay.time.text = $("#icon_date_txt").val().trim();
        updateOverlay();
    });
    $("#icon_dist_txt").on("input", () => {
        app.overlay.meters.text = $("#icon_dist_txt").val().trim();
        updateOverlay();
    });
    $("#icon_tri_txt").on("input", () => {
        app.overlay.kms.text = $("#icon_tri_txt").val().trim();
        updateOverlay();
    });

    $("#btnToggleIcons").on('click', (value) => {
        app.overlay.showTopRight ^= 1;
        updateOverlay()
    });

    $("#tripName_txt").on('input', () => {
        app.overlay.title.text = $("#tripName_txt").val().trim();
        updateOverlay()
    });
    $("#tripDetail_txt").on('input', () => {
        app.overlay.subtitle.text = $("#tripDetail_txt").val().trim()
        updateOverlay()
    });

    $("ul.styler li").on("click", function() {
        mapboxgl.accessToken = 'pk.eyJ1IjoidGhpanNzb25kYWciLCJhIjoiY2phOHI2MXNuMDh3dzMzanVhZXlzanU4byJ9.L3vNl1ehNadAt1JWPJqgiA';

        $("ul.styler li").each((i, e) => {
            $(e).removeClass("active");
        });
        var className = $(this).attr("class");
        $(this).addClass("active");

        const style = app.styles[className]
        if (style) {
            app.style = {...app.style, ...style }
            updateOverlay()
            map.setStyle(style.url)
        } else {
            console.log(`unknown style: '${className}'`)
        }
    });
    $("ul.sizes li").on("click", function() {

        $("ul.sizes li").each((i, e) => {
            $(e).removeClass("active");
        });
        $(this).addClass("active");
        selectedSize = $(this).find("span.big.size").text().trim();
        console.log("Selected size: " + selectedSize);
    });
    $("ul.portraIte-landscape li").on("click", function() {

        $("ul.portraIte-landscape li").each((i, e) => {
            $(e).removeClass("active");
        });
        selectedOrientation = $(this).attr("class");
        $(this).addClass("active");
        setDimensions();
        map.resize();
        updateOverlay()
    });
    $("#btnPrint").click(function() {
        try {
            printClick(false);
        } catch (e) {
            notie.alert({ type: 'error', text: 'Our site use advanced web feature and works best on Desktop Chrome or Firefox.'});
        }

    });
    $("#travel_flight").click(function() {
        isFlightPath = true;
        $("#travel_flight").addClass('active');
        $("#travel_car").removeClass('active');

    });
    $("#travel_car").click(function() {
        isFlightPath = false;
        $("#travel_car").addClass('active');
        $("#travel_flight").removeClass('active');
    });
    $("#btnDownload").click(function() {
        printClick(true);
    });
    $('#looped_map').change(function() {
        app.style.loopBack = document.getElementById('looped_map').checked
        completeRedraw(map);
    });

    function checkStartDate() {
        var date = document.getElementById('trvlStrtDate').value;
        var input = document.getElementById("trvlEndDate");
        input.setAttribute("min", date);
        if (document.getElementById("trvlStrtDate").value) {
            document.getElementById("trvlEndDate").disabled = false;
        } else {
            document.getElementById("trvlEndDate").value = '';
            document.getElementById("trvlEndDate").disabled = true;
        }
    }

    function newFun() {
        document.getElementById('lbl4').hidden = false;
        document.getElementById('trvlStrtDate').hidden = true;
        document.getElementById('trvlEndDate').hidden = true;
        var strDt = document.getElementById('trvlStrtDate').value;
        var strArr = strDt.split('-');
        var endDt = document.getElementById('trvlEndDate').value;
        var endArr = endDt.split('-');
        document.getElementById('tcrStrtDate').innerHTML = strArr[2] + '/' + strArr[1] + '/' + strArr[0];
        document.getElementById('tcrEndDate').innerHTML = endArr[2] + '/' + endArr[1] + '/' + endArr[0];
    }

    function emptyIfEnd() {
        if (document.getElementById("trvlStrtDate")) {
            document.getElementById("trvlEndDate").disabled = false;
        } else {
            document.getElementById("trvlEndDate").disabled = true;
        }
    }

    function setTicker(id) {
        if (id && id.checked) {
            document.getElementById('state-legend').hidden = false;
        } else {
            document.getElementById('state-legend').hidden = true;
        }
    }
    function addManualRoute(e){
        var result_resp = {};
        result_resp.result = {};
        result_resp.result.place_name_en = 'P' + pointCount++;
        result_resp['result'].text = result_resp.result.place_name_en;
        result_resp['result'].geometry = {};
        result_resp['result'].geometry .coordinates= [];
        result_resp['result'].geometry.coordinates[0] = e.lngLat.lng;
        result_resp['result'].geometry.coordinates[1] = e.lngLat.lat;
        
        autocompleter(result_resp);

    }

    function onGeoCoder(result_resp){
        if(manualRouteClicked){
            var elm = $("#manualRouteBtn");
            elm.removeClass("active");
            manualRouteClicked = false;
            isFlightPath = false;
        }
        donNotFitToBound = false;
        autocompleter(result_resp);
    }
    /** autocomplete for places and city names */
    function autocompleter(result_resp) {
        const filteredCities = filtered_cities()

        if (filteredCities.length >= MAX_DESTINATION_COUNT) {
            notie.alert({text: 'Only up to 40 locations allowed.', time: 7});
            $('.geocoder-icon.geocoder-icon-close').click();
            return;
        }

        let city_info = result_resp.result.place_name_en
        if (city_info) {
            city_info = city_info.replace(/["']/g, '')
        }

        if (filteredCities.length > 0 && city_info === filteredCities[filteredCities.length - 1].city_info) {
            return
        }

        var city_name = result_resp['result'].text.replace(/["']/g, ""); //autocomplete.getPlace().geometry.location.lat();
        var city_long = result_resp['result'].geometry.coordinates[0]; //autocomplete.getPlace().geometry.location.lng();
        var city_lat = result_resp['result'].geometry.coordinates[1]; //autocomplete.getPlace().name;
        var city_offset = [1.3, 0];
        var city_anchor = "left";
        var city_source = {};
        var city_textsize = 16;
        var city_flight_path = isFlightPath;
        var city_alias = result_resp['result'].text;
        var archived = false;
        var found = false;
        for (var i = cities.length - 1; i >= 0; --i) {
            if (cities[i].city_name == city_name) {
                cities[i].archived = false;
                cities[i].city_flight_path = city_flight_path;
                found = true;
                break;
            }
        }
        if (!found) {
            cities.push({
                city_info,
                city_long,
                city_lat,
                city_name,
                city_offset,
                city_anchor,
                city_source,
                city_textsize,
                city_flight_path,
                city_alias,
                archived
            });
        }
        //document.getElementById('geocoder').value = '';
        if (!donNotFitToBound && filtered_cities().length === 1) {
            map.flyTo({
                center: new mapboxgl.LngLat(city_long, city_lat),
                zoom: zoomLvl
            });
        }
        completeRedraw(map);
        $('.geocoder-icon.geocoder-icon-close').click();
        var elem = document.getElementById('locationName');
        elem.scrollTop = elem.scrollHeight;

    }

    function setDimensions(map) {
        var mapHeight;
        var mapContainer = $(document.getElementById('map-container'));
        if ($(window).width() >= 576)
            mapHeight = Math.ceil($(window).height() - $('nav').height() - mapContainer.offset().top + 10);
        else {
            mapHeight = Math.ceil($(window).height());
        }
        var mapWidth = Math.ceil(mapHeight * 0.706);
        if (mapWidth > mapContainer.parent().width()) {
            mapWidth = Math.ceil(mapContainer.parent().width());
            mapHeight = Math.ceil(mapWidth / 0.706);
        }
        mapWidth = app.mapContainer.width;
        mapHeight = app.mapContainer.height;
        mapContainer.css({
            'width': selectedOrientation === 'portrait' ? mapWidth : mapHeight + 'px ',
            'height': selectedOrientation === 'portrait' ? mapHeight : mapWidth + 'px'
        });
        if ($(window).width() < 576) {
            var viewportHeight = parseInt($('map').css('marginTop')) + parseInt(mapContainer.css('marginBottom')) + mapHeight + 50;
            $('.right-area').css('height', viewportHeight + 'px');
        } else
            $('.right-area').css('height', '');

        var leftAreaHeight = mapHeight + 50;
        $('.left-area').css('minHeight', leftAreaHeight + 'px');
    }

    console.log({ version: 'Thursday Nov 19 08:18:18 UTC 2020' })
});