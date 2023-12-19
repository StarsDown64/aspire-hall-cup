window.onload = async () => {
  getTemperature();
  setInterval(getTemperature, 30000);
  randomizeFloat();
  setInterval(randomizeFloat, 24000);
  var time = await getTime();
  changeTimer(new Date(time));
  recurseTimer();
  document.body.style.opacity = '1';
  time = new Date();
  if (time.getMonth() < 2 || time.getMonth() > 10) {
    loadSnow();
  }
}

function getTime() {
  return new Promise(async (resolve, reject) => {
    try {
    var resp = await fetch("https://worldtimeapi.org/api/ip")
    var timeData = await resp.json()
    resolve(timeData.datetime);
    } catch(err) {
      console.log("Time website is down, using local time as fallback...");
      resolve("");
    }
  })
}

function randomizeFloat() {
  let rectangles = [document.querySelector("#red-rectangle"),
  document.querySelector("#yellow-rectangle"),
  document.querySelector("#blue-rectangle")];
  let offsetMax = 3;
  for (rectangle of rectangles) {
    let offsetX = Math.random() * 2 * offsetMax - offsetMax;
    let offsetY = Math.random() * 2 * offsetMax - offsetMax;
    rectangle.style.setProperty('--x-offset', offsetX + 'rem');
    rectangle.style.setProperty('--y-offset', offsetY + 'rem');
  }
}

function recurseTimer() {
  var now = Date.now();
  var next = (parseInt(now / 1000) + 1) * 1000;
  var diff = next - now;
  changeTimer(new Date(now));
  setTimeout(recurseTimer, diff);
}

function changeTimer(time) {
  window.currentTime = time;
  document.querySelector("#clocktime").innerHTML =
    window.currentTime.toLocaleTimeString("en-US",
      { hour: "numeric", minute: "2-digit" }).replace("PM", "").replace("AM", "");
  document.querySelector("#clockdate").innerHTML =
    window.currentTime.toLocaleDateString("en-US",
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  Array.from(document.querySelectorAll(".worldtime")).map((em) => {
    var intlTime = window.currentTime.toLocaleTimeString("en-US",
      { timeZone: em.getAttribute("timezone"), hour: "2-digit", minute: "2-digit" });
    em.querySelector("p").innerHTML = intlTime;
  })

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
    document.querySelector("#shortforecast").innerHTML = currentWeather.shortForecast
  }).catch(err => {
    console.log("Unparsable weather data JSON, ignoring...");
    console.error(err);
  });
}