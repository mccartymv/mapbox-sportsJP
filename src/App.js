import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';
import { getGames } from './GameService';
import CustomButtonControl from './CustomButtonControl';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWJhZG5hcjQ1IiwiYSI6ImNseTkwMWQ4cDBrcG8yanBuNmV4ZnJiZDQifQ.EkfYeLvS7KYopWt5ULdZ9g';

const App = () => {
  const mapContainerRef = useRef(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const gameData = await getGames();
      setGames(gameData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [136, 35.5],
      zoom: 4.2
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new CustomButtonControl(), 'top-left');

    if (games.length > 0) {
      const geojson = {
        type: 'FeatureCollection',
        features: games.map(game => ({
          type: 'Feature',
          properties: {
            description: `${game.homeTeam} vs ${game.awayTeam} at ${game.venue.name}`
          },
          geometry: {
            type: 'Point',
            coordinates: game.venue.coordinates.split(',').map(coord => parseFloat(coord.trim())).reverse()
          }
        }))
      };

      map.on('load', () => {
        map.addSource('games', {
          type: 'geojson',
          data: geojson,
          cluster: true,
          clusterMaxZoom: 12, // Max zoom to cluster points on
          clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'games',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100,
              '#f1f075',
              750,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40
            ]
          }
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'games',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });

        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'games',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          const clusterId = features[0].properties.cluster_id;
          map.getSource('games').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) return;

              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
                duration: 1500
              });
            }
          );
        });

        map.on('click', 'unclustered-point', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const description = e.features[0].properties.description;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = '';
        });
      });
    }

    return () => map.remove();
  }, [games]);

  return (
    <div className="App">
      <header className="header">
        <div>
          <h1>Site Title</h1>
        </div>
      </header>
      <div className="map-container" ref={mapContainerRef} />
      <div className="footer">
        <div className="footer-links">
          <a href="/terms" className="unselectable">Terms and Conditions</a>
          <a href="/privacy" className="unselectable">Privacy Policy</a>
          <a href="/about" className="unselectable">About</a>
        </div>
      </div>
    </div>
  );
};

export default App;
