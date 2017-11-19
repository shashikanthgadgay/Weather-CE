var components = (function(){

    // creates a dom element with the attributes specified
    // on the attributes object and the given innerHTML
    var createElem = function(type, attributes, innerHTML){
        var elem = document.createElement(type);
        for(var key in attributes){
            elem.setAttribute(key, attributes[key]);
        }
        elem.innerHTML = innerHTML || null;
        return elem;
    };

    var Current = function(attrs){
        this.attrs = attrs;

        this.render = function(){
            var current = createElem('div', {class: 'current'});
            var img = createElem('img', {class: 'current-img', src: this.attrs.img, alt: 'icon'});
            var weather = createElem('div', {class: 'weather'});
            weather.appendChild(createElem('span', {}, this.attrs.temp + '&deg'));
            weather.appendChild(createElem('span', {}, this.attrs.desc));
            current.appendChild(img);
            current.appendChild(weather);
            return current;
        };
    };

    var Day = function(attrs){
        this.attrs = attrs;

        this.render = function(){
            var weather = createElem('div', {class: 'weather'},
                '<span class="temp">' + this.attrs.temp + '&deg</span>' +
                '<span class="description">' + this.attrs.desc + '</span>'
            );
            var date = createElem('div', {class: 'date'},
                '<p class="weekday">' + this.attrs.weekday + '</p>' +
                '<p class="month">' + this.attrs.month + '</p>'
            );
            var imgWrapper = createElem('div', {class: 'img-wrapper'});
            imgWrapper.appendChild(createElem('img', {src: this.attrs.img, alt: 'icon'}));

            var day = createElem('div', {class: 'day'});
            day.appendChild(imgWrapper);
            day.appendChild(weather);
            day.appendChild(date);
            return day;
        };
    };

    var Forecast = function(attrs){
        this.attrs = attrs;

        this.render = function(){
            var forecast = createElem('div', {class: 'forecast'});

            var day = new Day();
            var num_of_days = this.attrs.days.length;
            for(var i=0; i<num_of_days; i++){
                day.attrs = this.attrs.days[i];
                forecast.appendChild(day.render());
            }
            return forecast;
        };
    };

    var Location = function(attrs){
        this.attrs = attrs;

        this.render = function(){
            //var dataName = this.attrs.name.split(',')[0].trim().replace(/\s/g, '').toLowerCase();
            var name = createElem('span',
                    {'data-id': this.attrs.id},
                    this.attrs.name
            );
            var temp = createElem('span', {}, this.attrs.temp + '&deg;');
            var loc = createElem('div', {class: 'location'});
            loc.appendChild(name);
            loc.appendChild(temp);
            return loc;
        };
    };

    var LocationSpinner = function(attrs){
        this.attrs = attrs;
        this.render = function(){
            return createElem('div',
                {id: 'location-spinner', class: 'spinner', style: 'display: block;'},
                '<div></div><div></div><div></div>'
            );
        };
    };

    return{
        Current: Current,
        Day: Day,
        Forecast: Forecast,
        Location: Location,
        LocationSpinner: LocationSpinner
    };

})();

