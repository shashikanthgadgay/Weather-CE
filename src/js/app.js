var app = (function () {
  // renders the data and adds elements to the popup
  var renderData = function (data) {
    var current = new components.Current(data.current);
    var forecast = new components.Forecast({days: data.forecast});
    var main = document.getElementById('main');
    main.innerHTML = '';
    main.appendChild(current.render());
    main.appendChild(document.createElement('hr'));
    main.appendChild(forecast.render());
    document.getElementById('no-location').style.display = 'none';
  };

  // parse the weather data
  var parseData = function (data, callback) {
    chrome.storage.sync.get('units', function (result) {

      var units = result.units || 'metric';
      var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'];
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];

      var currentData = {
        img: 'icons/' + data[0].weather[0].icon.substr(0, 2) + '.png',
        temp: helpers.convertTemp(data[0].main.temp, units),
        desc: data[0].weather[0].main
      };

      var forecastData = [];
      var i, date;
      for (i = 1; i < 6; i++) {
        var index = i*8 - 1;
        date = new Date(data[1].list[index].dt * 1000); // ms
        forecastData.push({
          img: 'icons/' + data[1].list[index].weather[0].icon.substr(0, 2) + '.png',
          temp: helpers.convertTemp(data[1].list[index].main.temp_max, units),
          desc: data[1].list[index].weather[0].main,
          weekday: weekdays[date.getDay()],
          month: months[date.getMonth()] + ' ' + date.getDate()
        });
      }

      callback({current: currentData, forecast: forecastData});

    });
  };

  // gets data and gives arr to callback if it is full
  var getData = function (key, url, arr, ind, callback) {
    chrome.storage.local.get(key, function (data) {
      if (data[key] && !helpers.cacheExpired(JSON.parse(data[key]).setAt)) {
        arr[ind] = JSON.parse(data[key]);
        if (helpers.arrayAllTrue(arr))
          callback(arr);
      } else {
        var spinner = document.getElementById('spinner');
        spinner.style.display = 'block';
        helpers.ajax(url, 'GET',
          function (r) {
            var data = JSON.parse(r.response);
            arr[ind] = data;
            var toStore = {};
            data.setAt = Date.now();
            toStore[key] = JSON.stringify(data);
            chrome.storage.local.set(toStore);

            if (helpers.arrayAllTrue(arr)) {
              callback(arr);
              spinner.style.display = 'none';
              document.getElementById('error-message').style.display = 'none';
            }
          },
          function () {
            spinner.style.display = 'none';
            document.getElementById('error-message').style.display = 'block';
          }
        );
      }
    });
  };

  // app initialization
  var init = function () {
    chrome.storage.sync.get('loc', function (data) {
      data = data.loc && JSON.parse(data.loc);
      if (!(data && data.id && data.name)) {
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById('no-location').style.display = 'block';
        return;
      }

      var LOCATION = {
        id: (data.id),
        name: (data.name)
      };

      var weatherData = [null, null];
      var parseAndRender = function (arr) {
        parseData(arr, renderData);
      };
      getData('currentWeatherData', API.weatherUrl + '?id=' + LOCATION.id + '&APPID=' + OWAppId, weatherData, 0, parseAndRender);
      getData('forecastWeatherData', API.forecastUrl + '?id=' + LOCATION.id + '&APPID=' + OWAppId, weatherData, 1, parseAndRender);

      document.getElementById('location').innerText = LOCATION.name.substr(0, 1).toUpperCase() + LOCATION.name.substr(1);
    });

    // set the units buttons
    chrome.storage.sync.get('units', function (result) {
      var units = result.units || 'metric';
      var unitsBtns = document.getElementsByClassName('units-btn');
      var unitBtnsLength = unitsBtns.length;
      for (var i = 0; i < unitBtnsLength; i++) {
        if (unitsBtns[i].dataset.units == units) unitsBtns[i].setAttribute('class', 'units-btn active');
        else unitsBtns[i].setAttribute('class', 'units-btn');
      }
    });
  };

  return {
    init: init
  };

})();

app.init();

