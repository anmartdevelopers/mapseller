var map;
var zoomLvl =10;
var lat = '-37.81361100000001';
var lng = '144.96305600000005';
var MAX_DESTINATION_COUNT = 40;
var selectOrientation = 'potrait';
var selectedSize = 'PDF';
var _DEBUG_ = (location.hostname === "localhost" || location.hostname === "127.0.0.1");
var oldBounds;
var Cities= [];
var DOWNLOADSVG = false;
var isOkToLeaveSite = false;
var manualRouteClicked = false;
var pointCount = 1;
var doNotFitToBound = false;
var filtered_cities = () => {
    return Cities.filter(c => !c.archieved);
}
var isFlighPath = false;
// mappox api access token
mapboxgl.accessToken = 'pk.eyJ1IjoidGhpanNzb25kYWciLCJhIjoiY2phOHI2MXNuMDh3dzMzanVhZXlzanU4byJ9.L3vNl1ehNadAt1JWPJqgiA';

// setting the style for the overlay functions
const OVERLAY_DEFAULTS ={
    topRight:{
        fontFamily:'HKGrotesk-Medium',
        lineHeight:33,
        fontSize:18,
        letterSpacing:3.75,
        iconSpacing:5,
        iconHeight:24,
        Weight:500,
        color:undefined,
    }
}

// dates function
const currYear = new Date().getFullYear();
const app = {
    overlay:{
        title:{text:'KENYA', fontFamily:'HKGrotesk-Medium'},
        Subtitle:{text:'May - July'+ currYear, fontFamily:'HKGrotesk-Medium'},
        time:{vissible:true,text:'3:20:19',icon:'images/icons/time@1.5x.svg', ...OVERLAY_DEFAULTS.topRight},
        meters: { visible: false, text: '3994m', icon: 'images/icons/meters@1.5x.svg', ...OVERLAY_DEFAULTS.topRight },
        kms: { visible: true, text: '32.6 km', icon: 'images/icons/kms@1.5x.svg', ...OVERLAY_DEFAULTS.topRight },

        showTopRight: true,
        paddingTop: 18,
        paddingRight: 18,
    },
    mapContainer:{
        width:468,
        height:662,
    },
    thumbnail: {
        width:448,
        height:642,
    },
    style:{
        penwidth:2,
        loopBack:false,
        ...StyleSheet.blue,
    },
    
    styles:STYLES,

    POS:[
        { position: 'right', offset: [-1.3, 0] },
        { position: 'bottom', offset: [0, 1.3] },
        { position: 'left', offset: [1.3, 0] },
        { position: 'top', offset: [0, -1.3] },
    ],

    fonts: {},
    annotations: {},
    gpx: {}
}

const loadFont = cached((url) => opentype.load(url),(url) => url, app.fonts)

async function selectFontForText(fonts,text,fallback=null) {
    //console.log(getCharacterEncodes(text));
    for(const url of foonts){
        const font = await loadFont(url)
        const gs = font.stringToGlyphs(txt)
        if (gs.every((c) => c.index)) {
            return font
        }
    }
    return fallback && await loadFont(fallback)
}

async function drawSvg(width,height,isLandscapee,title,subtitle,time,meters,kms,color,fonts) {
    // Remove svg if it already exists
    if (SVG('#mapCover')) {
        SVG('#mapCover').remove();
    }
    // Create new svg
    var draw =SVG().attr('id','mapCover').attr('preserveAspectRatio','none').attr('style','z-index:1; position:absolute;').attr('pointer-events','none').addTo('#map-container');
    draw.viewbox(0,0,width,height).size(width,height);

    var linear = draw.gradient('linear', function (add) {
        add.stop({offset:0, color, opacity:1})
        add.stop({offset:1, color, opacity:0})
    });
    draw.rect(287,width).move(0.0,height).transform({rotate:-90,origin:'top left'}).fill(linear);

    //weighted geometric mean size of svg
    const meanSize =0.871 * (height * width) ** 0.5

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

// Location Detection of the city
function deleteLocation(city_name) {
    for (var i = filtered_cities().length - 1; i >= 0; --i) {
        if (filtered_cities()[i].city_name == city_name) {
            filtered_cities()[i].archived = true;
            completeRedraw();
            break;
        }
    }
}

function changeOrder(direction,city_name) {
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

// Destination poup styling
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
    // Styling the rout destination under section one row of adding destinations
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
        text: "Hold on Buddy As we process you Map ⌚️."
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
        const response = await fetch('https://poster.myholidaymap.com/map.php', { method: 'POST', body })
        if (!response.ok) {
            throw new Error(`response failed ${response.statusText}`)
        }

        const data = await response.json();
        if (!data.pid && data.pid !== 0) {
            throw new Error('pid is missing');
        }

        const sizeToProductId = { S: 90, M: 91, L: 92, XL: 93, PDF: 715 }
        const productId = sizeToProductId[selectedSize] || 715

        const url = new URL('http://myholidaymap.com/checkout/')
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
