import React from 'react';
import mapboxgl from 'mapbox-gl';

class CustomButtonControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const button = document.createElement('button');
    button.textContent = 'Click Me';
    button.style.backgroundColor = 'grey';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '10px';
    button.style.cursor = 'pointer';

    button.onclick = () => {
      console.log('Button clicked!');
    };

    this._container.appendChild(button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export default CustomButtonControl;