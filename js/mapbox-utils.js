const STYLES = {
    red: {
      url: "mapbox://styles/thijssondag/ck6eylpl67c971iqh6m0cbt6s",
      penColor: "#8D241B",
      markerColor: "#BC5148",
      overlayTitleColor: "#FFFFFF",
      overlaySubtitleColor: "#FFF8F8",
      styleName: "ck6eylpl67c971iqh6m0cbt6s",
      gradient: {
        start: "rgba(218, 185, 185, 0)",
        stop: "rgba(218, 185, 185, 1)",
      },
      statGradient: [
        [0.0, 'rgba(218, 185, 185, 0.8)'],
        [1.0, 'rgba(255,255,255,0)'],
      ] 
    },
    blue: {
      url: "mapbox://styles/thijssondag/ck6f13i3z02fa1imqofgdxshs",
      penColor: "#376B67",
      markerColor: "#609B96",
      overlayTitleColor: "#FFFFFF",
      overlaySubtitleColor: "#FFF8F8",
      styleName: "ck6f13i3z02fa1imqofgdxshs",
      gradient: {
        start: "rgba(169, 208, 205, 0)",
        stop: "rgba(169, 208, 205, 1)",
      },
      statGradient: [
        [0.0, 'rgba(169, 208, 205, 0.8)'],
        [1.0, 'rgba(255,255,255,0)'],
      ]
    },
    darkblue: {
      url: "mapbox://styles/thijssondag/ck6e2njsx6ihl1iqh84r7pfa1",
      penColor: "#ddbb65",
      markerColor: "#ddbb65",
      overlayTitleColor: "#ddbb65",
      overlaySubtitleColor: "#ddbb65",
      styleName: "ck6e2njsx6ihl1iqh84r7pfa1",
      gradient: {
        start: "rgba(54, 71, 99, 0)",
        stop: "rgba(54, 71, 99, 1)",
      },
      statGradient: [
        [0.0, 'rgba(54, 71, 99, 0.2)'],
        [1.0, 'rgba(255,255,255,0)'],
      ]
    },
    lightblue: {
      url: "mapbox://styles/thijssondag/ck6dzdd5z0z2l1jmkuleu2cqp",
      penColor: "#F26D5B",
      markerColor: "#F26D5B",
      overlayTitleColor: "#FFFFFF",
      overlaySubtitleColor: "#FFF8F8",
      styleName: "ck6dzdd5z0z2l1jmkuleu2cqp",
      gradient: {
        start: "rgba(160, 199, 238, 0)",
        stop: "rgba(160, 199 ,238, 1)",
      },
      statGradient: [
        [0.0, 'rgba(150,194,237,0.8)'],
        //[0.7966, 'rgba(190,217,244,0.51)'],
        [1.0, 'rgba(255,255,255,0)'],
      ]
    },
    mintgreen: {
      url: "mapbox://styles/thijssondag/ck6f0hxhs2jm21iq5kqokx7u8",
      penColor: "#376B67",
      markerColor: "#609B96",
      overlayTitleColor: "#125913",
      overlaySubtitleColor: "#125913",
      styleName: "ck6f0hxhs2jm21iq5kqokx7u8",
      gradient: {
        start: "rgba(202, 237, 216, 0)",
        stop: "rgba(202, 237, 216, 1)",
      },
      statGradient: [
        [0.0, 'rgba(202, 237, 216, 0.8)'],
        [1.0, 'rgba(255,255,255,0)'],
      ]
    },
    green: {
      url: "mapbox://styles/thijssondag/ck6f1wkxy1yx31imtlwp7w08o",
      penColor: "#376B67",
      markerColor: "#609B96",
      overlayTitleColor: "#FFFFFF",
      overlaySubtitleColor: "#FFFFFF",
      styleName: "ck6f1wkxy1yx31imtlwp7w08o",
      gradient: {
        start: "rgba(170, 208, 191, 0)",
        stop: "rgba(170, 208, 191, 1)",
      },
      statGradient: [
        [0.0, 'rgba(170, 208, 191, 0.8)'],
        [1.0, 'rgba(255,255,255,0)'],
      ]
    },
    grey: {
      url: "mapbox://styles/thijssondag/ck6f2xosk1vll1imzg042pv4x",
      penColor: "#F26D5B",
      markerColor: "#F26D5B",
      overlayTitleColor: "#3C3C3C",
      overlaySubtitleColor: "#3C3C3C",
      styleName: "ck6f2xosk1vll1imzg042pv4x",
      gradient: {
        start: "rgba(239, 240, 240, 0)",
        stop: "rgba(239, 240, 240, 1)",
      },
      statGradient: [
        [0.0, 'rgba(239, 240, 240, 0.8)'],
        [1.0, 'rgba(255,255,255,0)'],
      ]
    },
    natural: {
      url: "mapbox://styles/thijssondag/ck6f2hac10p0y1ir5dr4w9wqu",
      penColor: "#2B554F",
      markerColor: "#2B554F",
      overlayTitleColor: "#2B554F",
      overlaySubtitleColor: "#2B554F",
      styleName: "ck6f2hac10p0y1ir5dr4w9wqu",
      gradient: {
        start: "rgba(241, 236, 229, 0)",
        stop: "rgba(241, 236, 229, 1)",
      },
      statGradient: [
        [0.0, 'rgba(241, 236, 229, 0.8)'],
        [1.0, 'rgba(255,255,255,0)'],
      ]
    },
    purple: {
      url: "mapbox://styles/thijssondag/ck6f22h0v1usa1imzskjvcnqo",
      penColor: "#2E294E",
      markerColor: "#2E294E",
      overlayTitleColor: "#2E294E",
      overlaySubtitleColor: "#2E294E",
      styleName: "ck6f22h0v1usa1imzskjvcnqo",
      gradient: {
        start: "rgba(234, 224, 250, 0)",
        stop: "rgba(234, 224, 250, 1)",
      },
      statGradient: [
        [0.0, 'rgba(234, 224, 250, 0.8)'],
        [1.0, 'rgba(255,255,255,0)'],
      ]
    },
  };
  
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = src;
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
    })
  }
  
  function svgToImg(element) {
    const svg = element.outerHTML
    let data = btoa(unescape(encodeURIComponent(svg)))
    return loadImage(`data:image/svg+xml;base64,${data}`)
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  function cached(fn, key, cache) {
    cache = cache || {}
    key = key || ((...args) => JSON.stringify(args))
  
    return async (...args) => {
      const k = key(...args)
      if (!Object.prototype.hasOwnProperty.call(cache, k)) {
        cache[k] = await fn(...args)
      }
      return cache[k]
    }
  }
  
  function cityLayers(cities, sources, config) {
    const {
      penWidth,
      penColor,
      markerColor,
      styleName
    } = config
    const layers = []
  
    for (const city of cities) {
      const title = city.city_alias.length > 0 ? city.city_alias : city.city_name
      const source = `source_point_${city.city_name}`
      const layerIdSuffix = city.city_name
  
      if (!city.city_source[styleName] || !sources[source]) {
        const coord = [city.city_long, city.city_lat]
        const point = turf.point(coord, {
          title,
          'marker-symbol': 'circle'
        })
  
        sources[source] = {
          type: 'geojson',
          data: point
        }
        city.city_source[styleName] = true
      }
  
      layers.push({
        id: `markers_${layerIdSuffix}`,
        type: 'circle',
        source,
        paint: {
          'circle-radius': penWidth * 1.5,
          'circle-color': markerColor,
        },
      })
    }
  
    
    for (const city of cities) {
      const title = city.city_alias.length > 0 ? city.city_alias : city.city_name
      const source = `source_point_s_${city.city_name}`
      const layerIdSuffix = city.city_name
  
      if (!city.city_source[styleName] || !sources[source]) {
        const coord = [city.city_long, city.city_lat]
        const point = turf.point(coord, {
          title
        })
        
        sources[source] = {
          type: 'geojson',
          data: point
        }
        city.city_source[styleName] = true
      }
  
      layers.push({
        id: `points_${layerIdSuffix}`,
        type: 'symbol',
        source,
        layout: {
          'text-field': title,
          'text-font': ['HK Grotesk Regular'],
          'text-anchor': city.city_anchor,
          'text-offset': city.city_offset,
          'text-size': city.city_textsize,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': penColor,
        },
      })
    }
  
    return layers
  }
  
  function routeLayers(routes, sources, config) {
    const {
      penWidth,
      penColor
    } = config
    const layers = []
  
    routes.forEach(({
      type,
      geometry
    }, i) => {
      const source = `source_line_${type}_${i}`
      sources[source] = {
        type: 'geojson',
        data: turf.feature(geometry)
      }
  
      layers.push({
        id: `route_${type}_${i}`,
        type: 'line',
        source,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': penColor,
          'line-width': penWidth,
          'line-dasharray': [1, 2],
        },
      })
    })
  
    return layers
  }
  
  async function fetchRoute(coordinates, accessToken) {
    const url = 'https://api.mapbox.com/directions/v5/mapbox/driving'
    const params = `geometries=geojson&access_token=${accessToken}`
    const coord = coordinates.map((c) => c.map((x) => +x.toFixed(4)).join(',')).join(';')
  
    try {
      const response = await fetch(`${url}/${coord}?${params}`)
      const data = await response.json()
      if (data.code !== 'NoRoute' && data.routes) {
        return data.routes[0]
      }
    } catch (err) {
      console.error(err)
    }
  
    return null
  }
  
  async function routeGeometry(src, dst, distance, accessToken) {
    const coords = [
      [src.city_long, src.city_lat],
      [dst.city_long, dst.city_lat],
    ]
  
    if (!dst.city_flight_path) {
      const route = await fetchRoute(coords, accessToken)
      if (route) {
        distance.total += route.distance
        return {
          type: 'route',
          geometry: route.geometry
        }
      }
      dst.city_flight_path = true
    }
  
    return {
      type: 'arc',
      geometry: turf.greatCircle(...coords).geometry
    }
  }
  
  function gpxLayers(gpxGeoJson, sources, config) {
    if (!gpxGeoJson) {
      return []
    }
  
    const {
      penWidth,
      penColor,
      markerColor
    } = config
  
    sources['gpx_track'] = {
      type: 'geojson',
      data: gpxGeoJson,
    };
  
    const layers = [{
      'id': 'line_gpx_route',
      'type': 'line',
      'source': 'gpx_track',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round',
      },
      'paint': {
        'line-color': penColor,
        'line-width': 2.5,
      },
      'filter': ['==', '$type', 'LineString']
    }, /*{
      'id': `points_gpx_route`,
      'type': 'symbol',
      'source': 'gpx_track',
      'layout': {
      'text-field': ['get', 'title'],
        'text-font': ['HK Grotesk Regular'],
      },
      'paint': {
        'text-color': penColor,
      },
      'filter': ['==', '$type', 'Point']
    },*/ {
      'id': `markers_gpx_route`,
      'type': 'circle',
      'source': 'gpx_track',
      'paint': {
        'circle-radius': penWidth * 1.5,
        'circle-color': markerColor,
      },
      'filter': ['==', '$type', 'Point']
    }];
  
    return layers
  }
  function deleteGpxFile() {
    app.gpx.data = '';
    app.gpx.fileName = '';
    completeRedraw(map);
  }
  async function annotationLayers(token, cities, gpxData, config) {
    // Add annotations to the map, e.g roads, cities
    const distance = {
      total: 0
    }
    const {
      loopBack = false
    } = config
    let {
      routes
    } = config
  
    if (!Array.isArray(routes) || !routes.length) {
      routes = []
  
      for (let i = 0; i < cities.length - 1; i += 1) {
        routes.push(routeGeometry(cities[i], cities[i + 1], distance, token))
      }
      if (loopBack && cities.length > 2) {
        routes.push(routeGeometry(cities[0], cities[cities.length - 1], distance, token))
      }
  
      routes = await Promise.all(routes)
    }
  
    const layersConfig = {
      penColor: '#376B67',
      markerColor: '#609B96',
      penWidth: 2,
      styleName: 'default-style',
      ...config,
    }
  
    const sources = {}
    const layers = [
      ...cityLayers(cities, sources, layersConfig),
      ...routeLayers(routes, sources, layersConfig),
      ...gpxLayers(gpxData, sources, layersConfig),
    ]
  
    return {
      sources,
      layers,
      routes,
      distance: distance.total
    }
  }
  
  function loadGpxFile(gpxFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      // Closure to capture the file information.
      reader.onload = function (e) {
        var xmlDoc = new DOMParser().parseFromString(
          e.target.result,
          "text/xml"
        );
  
        var uploadGeoJson = toGeoJSON.gpx(xmlDoc);
  
        var jsonStr = JSON.stringify(uploadGeoJson);
        jsonStr = jsonStr.split('"name":').join('"title":');
        jsonStr = jsonStr.split('"MultiLineString"').join('"LineString"');
  
        uploadGeoJson = JSON.parse(jsonStr);
        resolve(uploadGeoJson)
      };
  
      // Read in the image file as a data URL.
      reader.readAsText(gpxFile);
    });
  }
  
  /**
   * Translate path in-place by [dx, dy]
   *
   * Same as transform="translate(dx, dy)", but handles C Q M L commands only.
   */
  function svgPathTanslate(path, dx, dy) {
    for (const cmd of path.commands) {
      switch (cmd.type) {
        case 'C':
          cmd.x2 += dx
          cmd.y2 += dy
  
        case 'Q':
          cmd.x1 += dx
          cmd.y1 += dy
  
        case 'M':
        case 'L':
          cmd.x += dx
          cmd.y += dy
          break
      }
    }
    return path
  }
  
  const MAX_TEXT_LEN = 500
  const RE_TRUNCATE_NEWLINES = /\n.*/gs
  
  /**
   * An SVG element with given text represented as path.
   *
   * Uses opentype.js to convert the text to path data.
   * Input is truncated if its length exceeds `MAX_TEXT_LEN`.
   * Multiline text is not supported.
   */
  function svgTextToPath({
    text,
    fontSize = 32,
    options = { hinting: true, letterSpacing: 0.0 },
    font,
    precision = 2,
  }) {
    text = text.length > MAX_TEXT_LEN ? `${text.slice(0, MAX_TEXT_LEN)}}…` : text
    text = text.replace(RE_TRUNCATE_NEWLINES, '…')
  
    const path = font.getPath(text, 0, 0, fontSize, options)
    const bbox = path.getBoundingBox()
  
    const width = Math.abs(bbox.x2 - bbox.x1)
    const height = Math.abs(bbox.y2 - bbox.y1)
  
    const d = svgPathTanslate(path, -bbox.x1, -bbox.y1).toPathData(precision)
    // const d = path.toPathData(precision)
    return { d, width, height }
  }
  
  fetchRoute = cached(fetchRoute)
  