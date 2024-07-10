import React from 'react';
import mapboxgl from 'mapbox-gl';

class CustomButtonControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this._container.style.display = 'flex';
    this._container.style.alignItems = 'center';
    this._container.style.padding = '5px';
    this._container.style.backgroundColor = 'white';
    this._container.style.border = '1px solid #ccc';
    this._container.style.borderRadius = '5px';

    // Helper function to set date content
    const setDateContent = (element, month, day) => {
      element.innerHTML = `<div style="text-align: center;">
        <div style="font-size: 16px; font-weight: bold;">${month}</div>
        <div style="font-size: 24px; font-weight: bold;">${day}</div>
      </div>`;
    };

    // Start Date
    const startDate = document.createElement('div');
    setDateContent(startDate, 'JUL', '10');
    startDate.style.fontSize = '14px';
    startDate.style.padding = '5px';
    startDate.style.borderRight = '1px solid #ccc';
    startDate.style.cursor = 'pointer';

    // Hidden Date Input for Start Date
    const startDateInput = document.createElement('input');
    startDateInput.type = 'date';
    startDateInput.style.display = 'none';
    startDateInput.onchange = (event) => {
      const date = new Date(event.target.value);
      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = date.getDate();
      setDateContent(startDate, month, day);
      startDateInput.style.display = 'none';
    };

    startDate.onclick = () => {
      startDateInput.style.display = 'block';
      startDateInput.focus();
    };

    // Slider Container
    const sliderContainer = document.createElement('div');
    sliderContainer.style.display = 'flex';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.flexGrow = '1';
    sliderContainer.style.padding = '0 10px';

    // Slider
    const slider = document.createElement('div');
    slider.style.height = '10px';
    slider.style.width = '100%';
    slider.style.backgroundColor = '#d3d3d3';
    slider.style.position = 'relative';

    const thumb = document.createElement('div');
    thumb.style.height = '20px';
    thumb.style.width = '20px';
    thumb.style.backgroundColor = 'black';
    thumb.style.borderRadius = '50%';
    thumb.style.position = 'absolute';
    thumb.style.left = '0';

    slider.appendChild(thumb);

    // End Date
    const endDate = document.createElement('div');
    setDateContent(endDate, 'JUL', '19');
    endDate.style.fontSize = '14px';
    endDate.style.padding = '5px';
    endDate.style.borderLeft = '1px solid #ccc';
    endDate.style.cursor = 'pointer';

    // Hidden Date Input for End Date
    const endDateInput = document.createElement('input');
    endDateInput.type = 'date';
    endDateInput.style.display = 'none';
    endDateInput.onchange = (event) => {
      const date = new Date(event.target.value);
      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = date.getDate();
      setDateContent(endDate, month, day);
      endDateInput.style.display = 'none';
    };

    endDate.onclick = () => {
      endDateInput.style.display = 'block';
      endDateInput.focus();
    };

    this._container.appendChild(startDate);
    this._container.appendChild(startDateInput); // Append the hidden start date input
    sliderContainer.appendChild(slider);
    this._container.appendChild(sliderContainer);
    this._container.appendChild(endDate);
    this._container.appendChild(endDateInput); // Append the hidden end date input

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export default CustomButtonControl;
