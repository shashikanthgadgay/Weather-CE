// Function to handle the user interactions
var interactions = (function () {

  var toggleSidebar = function () {
    var sidebar = document.getElementById('sidebar');
    if (sidebar.style.display === 'block') sidebar.style.display = 'none';
    else sidebar.style.display = 'block';
  };

  // refresh data
  var refresh = function () {
    chrome.storage.local.clear(); // clear cache
    app.init(); // re render the data
  };

  // change the temperature units
  var changeUnits = function (e, btnInd, btnArr) {
    chrome.storage.sync.set( { 'units': e.target.dataset.units });
    var arrLength = btnArr.length;
    for (var i = 0; i < arrLength; i++)
      btnArr[i].setAttribute('class', 'units-btn');
    btnArr[btnInd].setAttribute('class', 'units-btn active');
    refresh();
  };


  // set the current location based on location id
  var setLocation = function (e) {
    var id = e.target.dataset.id;

    chrome.storage.local.get('locNames', function (data) {
      if (!(data && data.locNames)) return; // error of some sort

      var name = JSON.parse(data.locNames)[id];

      chrome.storage.sync.set({loc: JSON.stringify({name: name, id: id})}, function (data) {
        refresh();
        toggleSidebar();

        var locations = document.getElementById('locations');
        locations.innerHTML = '';
        document.getElementById('location-input').value = '';
        chrome.storage.local.remove('locNames');
      });
    });
  };


  // search for locations
  var search;
  search = function (e) {
    var locations = document.getElementById('locations');
    locations.innerHTML = '';
    locations.appendChild(new components.LocationSpinner().render());

    var locationInput = document.getElementById('location-input').value;
    var urlWithParams = API.locationUrl + '?&q=' + locationInput + '&type=like&sort=population&APPID=' + OWAppId;

    helpers.ajax(urlWithParams, 'GET', function (r) {
        chrome.storage.sync.get('units', function (result) {
          var units = result.units || 'metric';
          var data = JSON.parse(r.response);
          var locNames = {};

          locations.innerHTML = '';
          var loc = new components.Location();

          data.list.map(function (elem) {
            var name = elem.name + ', ' + elem.sys.country;
            var id = elem.id;
            var temp = helpers.convertTemp(elem.main.temp, units);

            loc.attrs = {name: name, id: id, temp: temp};
            var locationElem = loc.render();

            // click on place name
            locationElem.children[0].onclick = setLocation;

            locations.appendChild(locationElem);

            locNames[elem.id] = elem.name;
          });

          chrome.storage.local.set({locNames: JSON.stringify(locNames)});

          if (!data.list || data.list.length === 0) {
            var errMessage = 'Unable to find location with name ' + locationInput + '. Please search again';
            displayLocationErrors(locations, errMessage);
          }
        });

      },
      function () {
        displayLocationErrors(locations, 'Unable to search for locations.')
      }
    );
  };

  var displayLocationErrors = function (locations, message) {
    locations.innerHTML = '';
    var errorMessage = document.createElement('p');
    errorMessage.setAttribute('id', 'locations-error');
    errorMessage.innerText = message;
    locations.appendChild(errorMessage);
  };
  // prevents propagation of the event
  // NOTE: generally bad practice to stop an event as other things
  // might rely on it. This is a pretty small application though
  // without a lot of logic so we'll use on the menu
  var stopPropEvent = function (e) {
    e.stopPropagation();
  };
  // close menu (sidebar) if it is open
  var closeMenu = function (e) {
    var sidebar = document.getElementById('sidebar');
    if (sidebar.style.display === 'block') sidebar.style.display = 'none';
  };

  // Attach event listeners
  document.getElementById('menu-icon').onclick = toggleSidebar;
  document.getElementById('refresh').onclick = refresh;
  document.getElementById('search').onclick = search;
  document.getElementById('menu').onclick = stopPropEvent; // stop closing of menu if click it
  document.getElementById('main').onclick = closeMenu; // close menu if click outside it
  document.getElementById('location-input').onkeypress = function (e) {
    if (e.keyCode == 13) search(e);
  };
  var unitsBtns = document.getElementsByClassName('units-btn');
  Array.prototype.forEach.call(unitsBtns, function (elem, ind, arr) {
    elem.onclick = function (e) {
      changeUnits(e, ind, arr);
    };
  });

  return;

})();


