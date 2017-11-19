var helpers = (function(){
    // makes an ajax call to url with method and runs appropriate callback
    var ajax = function(url, method, success, error){
        var r = new XMLHttpRequest();
        r.open(method, url, true);

        r.onload = function(){
            if(this.status >= 200 && this.status < 400){
                success(this);
            }else{
                error(this);
            }
        };

        r.onerror = function(){
            error(this);
        };

        r.send();
    };

    // checks whether all elements in array arr are true
    var arrayAllTrue = function(arr){
        var arrLength = arr.length;
        for(var i=0; i < arrLength; i++)
            if(!arr[i]) return false;
        return true;
    };

    // checks whether the cache is older than EXPIRY_TIME
    var cacheExpired = function(setAt){
        var EXPIRY_TIME = 30 * (60 * 1000);
        return (Date.now() - setAt) > EXPIRY_TIME;
    };

    // converts temperature
    var convertTemp = function(temp, units){
        temp = temp - 273.15;
        if(units == 'imperial')
            temp = temp * (9.0/5) + 32;
        return Math.round(temp);
    };

    return {
        ajax: ajax,
        arrayAllTrue: arrayAllTrue,
        cacheExpired: cacheExpired,
        convertTemp: convertTemp
    };

})();


