import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWJhZG5hcjQ1IiwiYSI6ImNseTkwMWQ4cDBrcG8yanBuNmV4ZnJiZDQifQ.EkfYeLvS7KYopWt5ULdZ9g';

const App = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10', // Map style
      center: [136, 38.5], // Initial center [lng, lat]
      zoom: 4.5 // Initial zoom
    });

    // Add navigation control (zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return (
    <div className="App">
      <div className="map-container" ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
};

export default App;
