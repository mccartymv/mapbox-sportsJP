import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';
import { getGames } from './GameService';

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
      center: [136, 34.5],
      zoom: 4.2
    });

    games.forEach(game => {
      const [lat, lng] = game.venue.coordinates.split(',').map(coord => parseFloat(coord.trim()));

      if (!isNaN(lat) && lat >= -90 && lat <= 90 && !isNaN(lng) && lng >= -180 && lng <= 180) {
        new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`${game.homeTeam} vs ${game.awayTeam} at ${game.venue.name}`))
          .addTo(map);
      } else {
        console.error('Invalid coordinates:', game.venue.coordinates);
      }
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => map.remove();
  }, [games]);

  return (
    <div className="App">
      <header className="header">
        <div>
          <h1>Site Title</h1>
        </div>
      </header>
      <div className="map-container" ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
};

export default App;
