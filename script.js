let map;
let geojson;
let currentMonth = 'january';
let countryData = [];

document.addEventListener('DOMContentLoaded', async () => {
  map = L.map('map-container').setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  countryData = await loadCountryData();

  const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
  const data = await response.json();
  
  geojson = L.geoJSON(data, {
    style: (feature) => styleCountry(feature, currentMonth),
    onEachFeature: onEachFeature
  }).addTo(map);
  
  document.getElementById('month-select').addEventListener('change', (e) => {
    currentMonth = e.target.value;
    geojson.setStyle((feature) => styleCountry(feature, currentMonth));
    
    resetCountryInfo();
  });
});

async function loadCountryData() {
  try {
    const response = await fetch('country_travel_data.csv');
    const csvData = await response.text();
    
    const results = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });
    
    return results.data.map(row => ({
      countryName: row.Country,
      continent: row.Continent,
      capital: row.Capital,
      january: parseInt(row.Jan, 10) || 0,
      february: parseInt(row.Feb, 10) || 0,
      march: parseInt(row.Mar, 10) || 0,
      april: parseInt(row.Apr, 10) || 0,
      may: parseInt(row.May, 10) || 0,
      june: parseInt(row.Jun, 10) || 0,
      july: parseInt(row.Jul, 10) || 0,
      august: parseInt(row.Aug, 10) || 0,
      september: parseInt(row.Sep, 10) || 0,
      october: parseInt(row.Oct, 10) || 0,
      november: parseInt(row.Nov, 10) || 0,
      december: parseInt(row.Dec, 10) || 0,
      jan_reason: row.Jan_Reason,
      jan_risk: row.Jan_Risk,
      feb_reason: row.Feb_Reason,
      feb_risk: row.Feb_Risk,
      mar_reason: row.Mar_Reason,
      mar_risk: row.Mar_Risk,
      apr_reason: row.Apr_Reason,
      apr_risk: row.Apr_Risk,
      may_reason: row.May_Reason,
      may_risk: row.May_Risk,
      jun_reason: row.Jun_Reason,
      jun_risk: row.Jun_Risk,
      jul_reason: row.Jul_Reason,
      jul_risk: row.Jul_Risk,
      aug_reason: row.Aug_Reason,
      aug_risk: row.Aug_Risk,
      sep_reason: row.Sep_Reason,
      sep_risk: row.Sep_Risk,
      oct_reason: row.Oct_Reason,
      oct_risk: row.Oct_Risk,
      nov_reason: row.Nov_Reason,
      nov_risk: row.Nov_Risk,
      dec_reason: row.Dec_Reason,
      dec_risk: row.Dec_Risk
    }));
  } catch (error) {
    console.error('Error loading country data:', error);
    return [];
  }
}

function styleCountry(feature, month) {
  const countryName = feature.properties.name;
  const country = countryData.find(c => c.countryName === countryName);
  
  const defaultStyle = {
    weight: 1,
    opacity: 1,
    color: '#333',
    fillOpacity: 0.7,
    fillColor: '#999'
  };
  
  if (!country) {
    return defaultStyle;
  }
  
  const rating = country[month];
  
  switch(rating) {
    case 1:
      defaultStyle.fillColor = '#38A169';
      break;
    case 2:
      defaultStyle.fillColor = '#ECC94B';
      break;
    case 3:
      defaultStyle.fillColor = '#ED8936';
      break;
    case 4:
      defaultStyle.fillColor = '#E53E3E';
      break;
    default:
      defaultStyle.fillColor = '#999';
  }
  
  return defaultStyle;
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: showCountryInfo
  });
}

function highlightFeature(e) {
  const layer = e.target;
  
  layer.setStyle({
    weight: 2,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.8
  });
  
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

function showCountryInfo(e) {
  const countryName = e.target.feature.properties.name;
  const country = countryData.find(c => c.countryName === countryName);
  
  if (!country) {
    updateCountryInfo(countryName, currentMonth, 'No data available', 'No data available');
    return;
  }
  
  const monthKey = currentMonth.toLowerCase().substring(0, 3);
  const reasonKey = `${monthKey}_reason`;
  const riskKey = `${monthKey}_risk`;
  
  updateCountryInfo(
    country.countryName,
    currentMonth,
    country[reasonKey] || 'No specific information available',
    country[riskKey] || 'No specific information available'
  );
}

function updateCountryInfo(countryName, month, reasons, risks) {
  document.getElementById('country-name').textContent = countryName;
  document.getElementById('country-month').textContent = `Best time info for ${month}`;
  document.getElementById('reasons').textContent = reasons;
  document.getElementById('risks').textContent = risks;
}

function resetCountryInfo() {
  document.getElementById('country-name').textContent = 'Country Information';
  document.getElementById('country-month').textContent = 'Select a country to see details';
  document.getElementById('reasons').textContent = 'No information available';
  document.getElementById('risks').textContent = 'No information available';
}