window.onload = async () => {
  getTemperature();
  setInterval(getTemperature, 60 * 60000);
  randomizeFloatingDiamonds();
  setInterval(randomizeFloatingDiamonds, 10000);
  updateTimeDependentProperties();
  setInterval(updateTimeDependentProperties, 1000);
  const time = new Date();
  if (time.getMonth() < 2 || time.getMonth() > 10) {
    loadSnow();
  }
}

function randomizeFloatingDiamonds() {
  const rectangles = [document.querySelector("#red-rectangle"),
  document.querySelector("#yellow-rectangle"),
  document.querySelector("#blue-rectangle")];
  const offsetMax = 5;
  for (const rectangle of rectangles) {
    const offsetX = Math.random() * 2 * offsetMax - offsetMax;
    const offsetY = Math.random() * 2 * offsetMax - offsetMax;
    rectangle.style.setProperty('--x-offset', offsetX + 'rem');
    rectangle.style.setProperty('--y-offset', offsetY + 'rem');
  }
}

function updateTimeDependentProperties() {
  window.currentTime = new Date();
  document.querySelector("#clocktime").innerHTML =
    window.currentTime.toLocaleTimeString("en-US",
      { hour: "numeric", minute: "2-digit" }).replace("PM", "").replace("AM", "");
  document.querySelector("#clockdate").innerHTML =
    window.currentTime.toLocaleDateString("en-US",
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (window.currentTime.getHours() > 16 || window.currentTime.getHours() < 7) {
    if (document.documentElement.getAttribute('data-theme') != 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } else {
    if (document.documentElement.getAttribute('data-theme') != 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}

function loadSnow() {
  for (let i = 0; i < 25; i++) {
    document.querySelector("body").innerHTML =
      '<div class="snow">❆</div>' + document.querySelector("body").innerHTML;
  }
}

function getTemperature() {
  fetch('https://api.weather.gov/gridpoints/IND/29,96/forecast/hourly').then(v => v.json()).then(j => {
    currentWeather = j.properties.periods[0];
    document.querySelector("#temp").innerHTML = currentWeather.temperature;
    document.querySelector("#shortforecast").innerHTML = currentWeather.shortForecast;
  }).catch(err => {
    console.log("Unparsable weather data JSON, ignoring...");
    console.error(err);
  });
}