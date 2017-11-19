(function () {
  // fetch data for selected location
  var getData = function (LOCATION, success, error) {
    var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather';
    var appID = '837da53e4c6b0e5df5c5f4e4b509f798';
    var url = weatherUrl + '?id=' + LOCATION.id + '&APPID=' + appID;
    var r = new XMLHttpRequest();
    r.open('GET', url, true);
    r.onload = function () {
      if (this.status >= 200 && this.status < 400)
        success(this);
      else
        error(this);
    };
    r.onerror = function () {
      error(this);
    };
    r.send();
  };

  // updates the extension icon based on server response
  var updateIcon = function (data) {
    var src;
    var image = data.weather[0].icon.substr(0, 2) + '.png';
    try {
      src = {
        16: 'icons/favicon/' + image
      };
    }
    catch (err) {
      src = {
        16: 'icons/favicons/02.png',
      };
    }
    chrome.browserAction.setIcon({path: src});
  };

  var defaultIcon = function () {
    src = {
      16: 'icons/favicon/02.png',
    };
    chrome.browserAction.setIcon({path: src});
  };

  // get the location from the browser and call callback
  var getLocation = function (callback) {
    chrome.storage.sync.get('loc', function (data) {
      data = data.loc && JSON.parse(data.loc);

      var LOCATION = {
        id: (data && data.id) ? data.id : null,
        name: (data && data.name) ? data.name : null
      };

      callback(LOCATION);
    });
  };

  // initiate the update process
  var initUpdate = function () {
    getLocation(function (LOCATION) {
      if (!(LOCATION && LOCATION.id && LOCATION.name)) return;

      getData(LOCATION, function (r) {
          var data = JSON.parse(r.response);
          data.setAt = Date.now();
          chrome.storage.local.set({ currentWeatherData: JSON.stringify(data) });
        },
        defaultIcon
      );
    });
  };

  var onStartup = function () {
    chrome.alarms.create('updateIcon', { periodInMinutes: 60 });
    chrome.alarms.onAlarm.addListener(initUpdate);
    initUpdate();
  };

  chrome.runtime.onInstalled.addListener(onStartup);
  chrome.runtime.onStartup.addListener(onStartup);

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace == 'local' && 'currentWeatherData' in changes) {

      if (changes.currentWeatherData.newValue) {
        data = JSON.parse(changes.currentWeatherData.newValue);
        updateIcon(data);

        chrome.alarms.create('updateIcon', { periodInMinutes: 60 });
      }
    }
  });

})();

