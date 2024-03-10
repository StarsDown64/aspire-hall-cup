window.onload = async () => {
  getTemperature();
  setInterval(getTemperature, 60 * 60000);
  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.setOnLoadCallback(querySheets);
  setInterval(querySheets, 60 * 60000);
  randomizeFloatingDiamonds();
  setInterval(randomizeFloatingDiamonds, 10000);
  updateTimeDependentProperties();
  setInterval(updateTimeDependentProperties, 1000);
  const time = new Date();
  if (time.getMonth() < 2 || time.getMonth() > 10) {
    loadSnow();
  }
  setInterval(() =>  { if (navigator.onLine) location.reload(); }, 24 * 60 * 60000);
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
      if (window.chart) drawChart();
    }
  } else {
    if (document.documentElement.getAttribute('data-theme') != 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (window.chart) drawChart();
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

function querySheets() {
  drawChart();
  loadEvents();
}

function drawChart() {
  if (!navigator.onLine) {
    window.chart.draw(view, {
      height: 500,
      width: 500,
      legend: { position: 'none' },
      backgroundColor: document.documentElement.getAttribute('data-theme') == 'dark' ? '#242424' : 'white',
      hAxis: { textStyle: { color: document.documentElement.getAttribute('data-theme') == 'dark' ? '#dbdbdb' : 'black' } },
      vAxis: {
        textStyle: { color: document.documentElement.getAttribute('data-theme') == 'dark' ? '#dbdbdb' : 'black' },
        gridlines: { count: 0 },
        textPosition: 'none'
      }
    });
    return;
  }
  const queryString = encodeURIComponent('SELECT M, P LIMIT 3');
  const query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1lPSRwkYen1jb-YLsJdMFZKDZPInP89nIn2N2UmAF2Ew/gviz/tq?gid=5429304&headers=1&tq=' + queryString);
  query.send(response => {
    if (response.isError()) return;
    const data = response.getDataTable();
    data.addColumn({ role: 'style' });
    data.setCell(0, 2, 'green');
    data.setCell(1, 2, 'pink');
    data.setCell(2, 2, 'aqua');
    const view = new google.visualization.DataView(data);
    view.setColumns([0, 1, { calc: 'stringify', sourceColumn: 1, type: 'string', role: 'annotation' }, 2]);
    window.chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    window.chart.draw(view, {
      height: 500,
      width: 500,
      legend: { position: 'none' },
      backgroundColor: document.documentElement.getAttribute('data-theme') == 'dark' ? '#242424' : 'white',
      hAxis: { textStyle: { color: document.documentElement.getAttribute('data-theme') == 'dark' ? '#dbdbdb' : 'black' } },
      vAxis: {
        textStyle: { color: document.documentElement.getAttribute('data-theme') == 'dark' ? '#dbdbdb' : 'black' },
        gridlines: { count: 0 },
        minValue: 0,
        maxValue: 100,
        textPosition: 'none'
      }
    });
  });
}

function loadEvents() {
  if (!navigator.onLine) return;
  // Ensure there is always at least one entry (preferably in the past) so that query function doesn't error out by comparing no values
  const now = new Date();
  const queryString = encodeURIComponent(`SELECT B, C, D, E, F WHERE dateDiff(toDate(${Date.now()}), B) < 0 or (dateDiff(toDate(${Date.now()}), B) = 0 and ((D is not null and hour(D) >= ${now.getHours()}) or (D is null and hour(C) + 1 >= ${now.getHours()}))) ORDER BY B, C LIMIT 6`);
  const query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1axE_elkVrlCjHFO7f_cWSUZVAZ6fCHHkSMbch2UTiQk/gviz/tq?headers=1&tq=' + queryString);
  query.send(response => {
    if (response.isError()) return;
    document.getElementById('eventtitle').innerHTML = `${response.getDataTable().Wf.reverse().length == 0 ? 'No ' : ''}Upcoming Events`;
    for (let i = 1; i < 4; i++) {
      for (let j = 1; j < 3; j++) {
        if (response.getDataTable().Wf.length == 0) {
          document.getElementById(`eventslot${i}${j}`).innerHTML = '';
          continue;
        }
        const event = response.getDataTable().Wf.pop().c;
        document.getElementById(`eventslot${i}${j}`).innerHTML = `${event[4].v}<br>${event[0].f.split('/').slice(0, 2).join('/')} ${event[1].f.split(':').slice(0, 2).join(':')} ${event[1].f.split(' ')[1]}${event[2] ? ` - ${event[2].f.split(':').slice(0, 2).join(':')} ${event[2].f.split(' ')[1]}` : ''} (${event[3].v})`;
      }
    }
  });
}