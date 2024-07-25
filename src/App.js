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
  const [startDate, setStartDate] = useState(new Date('2023-07-10'));
  const [endDate, setEndDate] = useState(new Date('2023-07-19'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gameData = await getGames();
        console.log('Fetched Games:', gameData);
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
        const gameDate = moment(game.startTime, 'YYYY-MM-DD'); // Adjust format based on your data
        console.log(`Game Date: ${gameDate.format()}, Start Date: ${moment(startDate).format()}, End Date: ${moment(endDate).format()}`);
        return gameDate.isValid() && gameDate.isBetween(startDate, endDate, null, '[]');
      });
      console.log('Filtered Games:', filtered);
      setFilteredGames(filtered);
    }
  }, [games, startDate, endDate]);

  useEffect(() => {
    if (!map) {
      const initializeMap = () => {
        const mapInstance = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/dark-v10',
          center: [136, 35.5],
          zoom: 4.2
        });

        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapInstance.addControl(new CustomButtonControl(setStartDate, setEndDate), 'top-left');

        setMap(mapInstance);
      };

      if (mapContainerRef.current) initializeMap();
    }

    if (map && filteredGames.length > 0) {
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

      map.on('load', () => {
        if (!map.getSource('games')) {
          map.addSource('games', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
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
              ],
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff'
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
                if (err) {
                  console.error('Error getting cluster expansion zoom:', err);
                  return;
                }

                map.easeTo({
                  center: features[0].geometry.coordinates,
                  zoom: Math.min(zoom, 10),
                  duration: 1300,
                  essential: true,
                  easing: (t) => t * (2 - t)
                });
              }
            );
          });

          const setCursorPointer = () => map.getCanvas().style.cursor = 'pointer';
          const resetCursor = () => map.getCanvas().style.cursor = '';

          map.on('mouseenter', 'clusters', setCursorPointer);
          map.on('mouseleave', 'clusters', resetCursor);

          map.on('click', 'unclustered-point', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            map.easeTo({
              center: coordinates,
              zoom: 10,
              duration: 1600,
              essential: true,
              easing: (t) => t * (2 - t)
            });

            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);
          });

          map.on('mouseenter', 'unclustered-point', setCursorPointer);
          map.on('mouseleave', 'unclustered-point', resetCursor);
        } else {
          const source = map.getSource('games');
          source.setData(geojson);
        }
      });
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
