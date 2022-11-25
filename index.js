function getTime() {
  return new Promise(async (resolve, reject) => {
    var resp = await fetch("https://worldtimeapi.org/api/ip")
    var timeData = await resp.json()
    resolve(timeData.datetime);
  })
}
function syncBusData() {
  console.log("Synced at " + new Date().toLocaleTimeString());
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
window.onload = async () => {
  getTemperature();
  setInterval(getTemperature, 30000); 
  syncBusData();
  setInterval(syncBusData, 30000);
  var time = await getTime();
  changeTimer(new Date(time));
  recurseTimer();
  document.body.style.opacity = '1';
  // ensure weather refresh periodically
  setInterval(() => {
    document.querySelector("#weatherwidget-io-0").src = document.querySelector("#weatherwidget-io-0").src
  }, 1000 * 60 * 30);
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
  // document.querySelector(".clocktime.hour").innerHTML = checkTime(window.currentTime.getHours());
  // document.querySelector(".clocktime.minute").innerHTML = checkTime(window.currentTime.getMinutes());
  // document.querySelector(".clocktime.second").innerHTML = checkTime(window.currentTime.getSeconds());
  document.querySelector("#clockdate").innerHTML = 
    window.currentTime.toLocaleDateString("en-US", 
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  Array.from(document.querySelectorAll(".worldtime")).map((em) => {
    var intlTime = window.currentTime.toLocaleTimeString("en-US", 
      { timeZone: em.getAttribute("timezone"), hour: "2-digit", minute: "2-digit" });
    em.querySelector("p").innerHTML = intlTime;
  })
}

function getTemperature() {
  fetch('https://api.weather.gov/gridpoints/IND/29,96/forecast').then(v => v.json()).then(j => {
    currentWeather = j.properties.periods[0];
    console.log(currentWeather);
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
