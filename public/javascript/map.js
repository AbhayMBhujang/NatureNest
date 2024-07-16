  mapbox.accessToken= mapToken;
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.5,40], // lat and longitude
    zoom: 9
  });
