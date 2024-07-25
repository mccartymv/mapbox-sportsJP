import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';
import { getGames } from './GameService';
import CustomButtonControl from './CustomButtonControl';
import moment from 'moment';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWJhZG5hcjQ1IiwiYSI6ImNseTkwMWQ4cDBrcG8yanBuNmV4ZnJiZDQifQ.EkfYeLvS7KYopWt5ULdZ9g';

const App = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredGames, setFilteredGames] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2024-07-10'));
  const [endDate, setEndDate] = useState(new Date('2024-08-19'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gameData = await getGames();
        // console.log('Fetched Games:', gameData);
        setGames(gameData);
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      const filtered = games.filter(game => {
        const gameDate = moment(game.startTime);
        return gameDate.isValid() && gameDate.isBetween(startDate, endDate, null, '[]');
      });
      setFilteredGames(filtered);
    }
  }, [games, startDate, endDate]);

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [136, 35.5],
        zoom: 4.2
      });

      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapInstance.addControl(new CustomButtonControl(setStartDate, setEndDate, startDate, endDate), 'top-left');

      mapInstance.on('load', () => {
        mapInstance.addSource('games', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });

        mapInstance.addLayer({
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
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        mapInstance.addLayer({
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

        mapInstance.addLayer({
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

        mapInstance.on('click', 'clusters', (e) => {
          const features = mapInstance.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          const clusterId = features[0].properties.cluster_id;
          mapInstance.getSource('games').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) {
                console.error('Error getting cluster expansion zoom:', err);
                return;
              }

              mapInstance.easeTo({
                center: features[0].geometry.coordinates,
                zoom: Math.min(zoom, 10),
                duration: 1300,
                essential: true,
                easing: (t) => t * (2 - t)
              });
            }
          );
        });

        const setCursorPointer = () => mapInstance.getCanvas().style.cursor = 'pointer';
        const resetCursor = () => mapInstance.getCanvas().style.cursor = '';

        mapInstance.on('mouseenter', 'clusters', setCursorPointer);
        mapInstance.on('mouseleave', 'clusters', resetCursor);

        mapInstance.on('click', 'unclustered-point', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const description = e.features[0].properties.description;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          mapInstance.easeTo({
            center: coordinates,
            zoom: 10,
            duration: 1600,
            essential: true,
            easing: (t) => t * (2 - t)
          });

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(mapInstance);
        });

        mapInstance.on('mouseenter', 'unclustered-point', setCursorPointer);
        mapInstance.on('mouseleave', 'unclustered-point', resetCursor);
      });

      setMap(mapInstance);
    };

    if (!map) {
      initializeMap();
    } else if (filteredGames.length > 0) {
      const source = map.getSource('games');
      if (source) {
        const geojson = {
          type: 'FeatureCollection',
          features: filteredGames.map(game => ({
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
        source.setData(geojson);
      }
    }
  }, [map, filteredGames]);

  return (
    <div className="App">
      <header className="header">
        <div>
          <h1>Site Title</h1>
        </div>
      </header>
      <div className="map-container" ref={mapContainerRef} />
      {loading && <div className="loading">Loading...</div>}
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
