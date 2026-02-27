const RESORTS = [
  { name: 'Baqueira-Beret', location: 'Lleida, Catalonia', lat: 42.6992, lon: 0.9467 },
  { name: 'Sierra Nevada', location: 'Granada, Andalusia', lat: 37.0922, lon: -3.3989 },
  { name: 'Formigal-Panticosa', location: 'Huesca, Aragon', lat: 42.7758, lon: -0.3664 },
  { name: 'La Molina', location: 'Girona, Catalonia', lat: 42.3436, lon: 1.9561 },
  { name: 'Cerler', location: 'Huesca, Aragon', lat: 42.5894, lon: 0.5408 },
  { name: 'Candanchú', location: 'Huesca, Aragon', lat: 42.7881, lon: -0.5278 },
  { name: 'Astún', location: 'Huesca, Aragon', lat: 42.8106, lon: -0.5111 },
  { name: 'Boí Taüll', location: 'Lleida, Catalonia', lat: 42.4778, lon: 0.8708 },
  { name: 'Alto Campoo', location: 'Cantabria', lat: 43.0372, lon: -4.3736 },
  { name: 'Navacerrada', location: 'Madrid', lat: 40.7883, lon: -4.0044 },
  { name: 'Valdezcaray', location: 'La Rioja', lat: 42.3258, lon: -2.9644 },
  { name: 'Port Ainé', location: 'Lleida, Catalonia', lat: 42.4283, lon: 1.2119 },
  { name: 'Masella', location: 'Girona, Catalonia', lat: 42.3494, lon: 1.9056 },
  { name: 'Espot Esquí', location: 'Lleida, Catalonia', lat: 42.5714, lon: 1.0594 },
  { name: 'Valdesquí', location: 'Madrid', lat: 40.7997, lon: -3.9686 },
  { name: 'Javalambre', location: 'Teruel, Aragon', lat: 40.1114, lon: -1.0206 },
  { name: 'Valdelinares', location: 'Teruel, Aragon', lat: 40.3800, lon: -0.6133 },
  { name: 'Fuentes de Invierno', location: 'Asturias', lat: 43.0600, lon: -5.3900 },
  { name: 'Valgrande-Pajares', location: 'Asturias', lat: 42.9928, lon: -5.7678 },
  { name: 'La Pinilla', location: 'Segovia', lat: 41.2061, lon: -3.4900 }
];

async function fetchSnowData(resort) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${resort.lat}&longitude=${resort.lon}&hourly=snowfall,snow_depth&current_weather=true&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Get current index (approximate based on current time)
    const now = new Date();
    const currentHourIdx = now.getHours();

    return {
      ...resort,
      temp: Math.round(data.current_weather.temperature),
      snowfall: data.hourly.snowfall[currentHourIdx] || 0,
      snow_depth: data.hourly.snow_depth[currentHourIdx] || 0,
      condition: data.current_weather.weathercode
    };
  } catch (error) {
    console.error(`Failed to fetch data for ${resort.name}:`, error);
    return { ...resort, error: true };
  }
}

function getConditionText(code) {
  const weatherCodes = {
    0: 'Cielo Despejado',
    1: 'Mayormente Despejado',
    2: 'Parcialmente Nuboso',
    3: 'Cubierto',
    71: 'Nevada Ligera',
    73: 'Nevada Moderada',
    75: 'Nevada Fuerte',
    77: 'Granizo de Nieve',
    85: 'Chubascos de Nieve Leves',
    86: 'Chubascos de Nieve Fuertes'
  };
  return weatherCodes[code] || 'Nuboso';
}

function createResortCard(data) {
  const card = document.createElement('div');
  card.className = 'resort-card';

  const isHighSnow = data.snowfall > 0;

  card.innerHTML = `
    <div class="card-header">
      <div class="resort-name">
        <h3>${data.name}</h3>
        <span class="resort-location">${data.location}</span>
      </div>
      <span class="status-badge" style="${isHighSnow ? 'background: rgba(56, 189, 248, 0.2); color: #38bdf8;' : ''}">
        ${isHighSnow ? '❄ NEVANDO' : 'ABIERTA'}
      </span>
    </div>
    
    <div class="metrics-grid">
      <div class="metric-item">
        <span class="metric-label">Temp</span>
        <span class="metric-value">${data.temp}<span class="metric-unit">°C</span></span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Estado</span>
        <span class="metric-value" style="font-size: 1rem;">${getConditionText(data.condition)}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Espesor Nieve</span>
        <span class="metric-value">${Math.max(0, Math.round(data.snow_depth * 100))}<span class="metric-unit">cm</span></span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Nieve Fresca</span>
        <span class="metric-value">${Math.max(0, Math.round(data.snowfall))}<span class="metric-unit">cm</span></span>
      </div>
    </div>
  `;

  return card;
}

async function init() {
  const dashboard = document.getElementById('dashboard');
  const loader = document.getElementById('loader');

  const results = await Promise.all(RESORTS.map(fetchSnowData));

  dashboard.innerHTML = '';
  results.forEach(resort => {
    if (!resort.error) {
      dashboard.appendChild(createResortCard(resort));
    }
  });

  loader.style.display = 'none';
  dashboard.style.display = 'grid';

  // Subtle entry animation
  const cards = document.querySelectorAll('.resort-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

document.addEventListener('DOMContentLoaded', init);
