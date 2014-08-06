(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var cache = function(attr, value){
    if (typeof root.localStorage === 'undefined'){
      root.localStorage = {
        clear: function(){} // no-op, it will be empty on page refresh anyway
      };
    }

    clearOldCaches();

    if(typeof value === 'undefined'){
      if(typeof root.localStorage[attr] !== 'undefined'){
        return JSON.parse(root.localStorage[attr]);
      } else {
        return;
      }
    } else if (!value){
      delete root.localStorage[attr];
    } else {
      try {
        root.localStorage[attr] = JSON.stringify(value);
      } catch (e){
        return false;
      }
    }
  };

  var clearOldCaches = function(){
    var timeSet = root.localStorage.cacheTime,
        cacheTimeout = 60 * 60 * 24,
        cacheAgeInSeconds;

    if(timeSet){
      timeSet = root.parseInt(timeSet, 10);
      cacheAgeInSeconds = (Date.now() - timeSet) / 1e3;
      if(cacheAgeInSeconds > cacheTimeout){
        localStorage.clear();
        root.localStorage.cacheTime = Date.now();
      }
    } else if(root.localStorage.length){
      // legacy data in the storage, clear it.
      localStorage.clear();
    } else {
      root.localStorage.cacheTime = Date.now();
    }
  };

  root.matrix.cache = cache;

}).call(this);
