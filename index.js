function getTime() {
  return new Promise(async (resolve, reject) => {
    var resp = await fetch("https://worldtimeapi.org/api/ip")
    var timeData = await resp.json()
    resolve(timeData.datetime);
  })
}
function syncBusData() {
  // fetch('https://raw.githubusercontent.com/HKN-Beta/hkn-lounge/main/sampleBusData.json').then(v => v.json()).then(j => {
  fetch('https://hkndisplay.ecn.purdue.edu/busdata').then(v => v.json()).then(j => {
    window.buscontent = j;
    if (window.buscontent.routeStopSchedules.length == 0) {
      Array.from(document.querySelectorAll(".busroute")).slice(1).forEach(e => {
        e.remove();
      });
      var clone = Array.from(document.querySelectorAll(".busroute")).slice(-1)[0].cloneNode(true);
      clone.querySelector(".busnum").innerHTML = "No buses. ";
      clone.querySelector(".busname").innerHTML = "Either there really are no buses, or something is terribly wrong with this page.";
      document.querySelector("#top-right").appendChild(clone);
      return;
    }
    if (Array.from(document.querySelectorAll(".busroute")).length > 1) {
      Array.from(document.querySelectorAll(".busroute")).slice(1).forEach(e => {
        e.remove();
      });
    }
    window.buscontent.routeStopSchedules.sort(function(a, b) {
      return new Date(a.stopTimes[0].estimatedDepartTimeUtc)
        - new Date(b.stopTimes[0].estimatedDepartTimeUtc);
    })
    window.buscontent.routeStopSchedules.forEach(route => {
      var clone = Array.from(document.querySelectorAll(".busroute")).slice(-1)[0].cloneNode(true);
      clone.querySelector(".busnum").innerHTML = "Route " + route.routeNumber;
      clone.querySelector(".busname").innerHTML = route.routeName;
      var departsAt = new Date(route.stopTimes[0].estimatedDepartTimeUtc);
      var now = new Date();
      var diff = departsAt - now;
      // if arriving in the next minute, say due
      if (diff > 60000) {
        var min = parseInt(diff / 60000);
        clone.querySelector(".busdue").innerHTML = `${min} min`;
      }
      // if arriving after 1 minute or longer, show number of minutes
      else {
        clone.querySelector(".busdue").innerHTML = "Due";
      }
      document.querySelector("#top-right").appendChild(clone);
    });
  }).catch(err => {
    console.log("Unparsable bus data JSON, ignoring...");
    console.error(err);
  });
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
window.onload = async () => {
  getTemperature();
  setInterval(getTemperature, 30000);
  randomizeFloat();
  setInterval(randomizeFloat, 24000);
  syncBusData();
  setInterval(syncBusData, 30000);
  var time = await getTime();
  changeTimer(new Date(time));
  recurseTimer();
  document.body.style.opacity = '1';
  time = new Date();
  if (time.getMonth() == 11) {
    loadSnow();
  }
}
function recurseTimer() {
  var now = Date.now();
  var next = (parseInt(now / 1000) + 1) * 1000;
  var diff = next - now;
  changeTimer(new Date(now));
  setTimeout(recurseTimer, diff);
}
function msToTime(time) {
  var d = new Date(1000 * Math.round(time / 1000));
  function pad(i) { return ('0' + i).slice(-2); }
  return d.getUTCHours() + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
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
    if (document.querySelector('#hknlogo').src != 'hkn-light.png') {
      document.querySelector('#hknlogo').src = 'hkn-light.png';
    }
  } else {
    if (document.documentElement.getAttribute('data-theme') != 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    if (document.querySelector('#hknlogo').src != 'hkn.png') {
      document.querySelector('#hknlogo').src = 'hkn.png';
    }
  }
}

function loadSnow() {
  for (let i = 0; i < 200; i++) {
    document.querySelector("body").innerHTML =
      '<div class="snow"></div>' + document.querySelector("body").innerHTML;
  }
}

function getTemperature() {
  fetch('https://api.weather.gov/gridpoints/IND/29,96/forecast').then(v => v.json()).then(j => {
    currentWeather = j.properties.periods[0];
    document.querySelector("#temp").innerHTML = currentWeather.temperature;
    document.querySelector("#shortforecast").innerHTML = currentWeather.shortForecast
  }).catch(err => {
    console.log("Unparsable weather data JSON, ignoring...");
    console.error(err);
  });
}

function checkTime(i) {
  return (i < 10) ? "0" + i : i;
}
