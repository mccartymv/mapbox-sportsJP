import React from 'react';
import mapboxgl from 'mapbox-gl';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

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
        <div style="font-size: 20px; font-weight: bold;">${month}</div>
        <div style="font-size: 36px; font-weight: bold; margin-top: 5px;">${day}</div>
      </div>`;
    };

    // Helper function to format date
    const formatDate = (date) => {
      return {
        month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: date.getDate(),
      };
    };

    // Start Date
    const startDate = document.createElement('div');
    setDateContent(startDate, 'JUL', '10');
    startDate.style.fontSize = '14px';
    startDate.style.padding = '5px';
    startDate.style.borderRight = '1px solid #ccc';
    startDate.style.cursor = 'pointer';

    // End Date
    const endDate = document.createElement('div');
    setDateContent(endDate, 'JUL', '19');
    endDate.style.fontSize = '14px';
    endDate.style.padding = '5px';
    endDate.style.borderLeft = '1px solid #ccc';
    endDate.style.cursor = 'pointer';

    // Initialize flatpickr for start date
    flatpickr(startDate, {
      onChange: (selectedDates) => {
        const date = selectedDates[0];
        date.setHours(date.getHours() + 12); // Set time to noon
        const { month, day } = formatDate(date);
        setDateContent(startDate, month, day);
      },
      defaultDate: '2023-07-10', // Set a default date if needed
    });

    // Initialize flatpickr for end date
    flatpickr(endDate, {
      onChange: (selectedDates) => {
        const date = selectedDates[0];
        date.setHours(date.getHours() + 12); // Set time to noon
        const { month, day } = formatDate(date);
        setDateContent(endDate, month, day);
      },
      defaultDate: '2023-07-19', // Set a default date if needed
    });

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

    this._container.appendChild(startDate);
    sliderContainer.appendChild(slider);
    this._container.appendChild(sliderContainer);
    this._container.appendChild(endDate);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export default CustomButtonControl;
