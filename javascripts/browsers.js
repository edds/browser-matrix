(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var browsers = {
    data: {},
    endpoint: function(profileId, startDate, endDate){
      return "https://www.googleapis.com/analytics/v3/data/ga?"
      + "ids="+ profileId +"&"
      + "dimensions=ga:operatingSystem,ga:browser,ga:browserVersion,ga:operatingSystemVersion"
      + "metrics=ga:visitors&"
      + "start-date="+ startDate +"&"
      + "end-date="+ endDate +"&"
      + "max-results=1000&"
      + "sort=-ga:visitors"
    },
    cleanBrowser: [
      {
        key: /BlackBerry[0-9]+/,
        browser: 'BlackBerry',
        version: function(row){ return 'all'; }
      },
      {
        key: /Android Browser/,
        browser: 'Android Browser',
        version: function(row){
          var version = row[3].split('.');
          if(version.length > 1){
            return version[0] + "." + version[1];
          } else {
            return version[0];
          }
        }
      },
      {
        key: /Chrome/,
        browser: 'Chrome',
        version: function(row){ return parseInt(row[2].split('.')[0], 10); }
      },
      {
        key: /Firefox/,
        browser: 'Firefox',
        version: function(row){ return row[2].split('.')[0]; }
      },
      {
        key: /Internet Explorer/,
        browser: 'Internet Explorer',
        version: function(row){ return row[2]; }
      },
      {
        key: /nokia/i,
        browser: 'Nokia',
        version: function(row){ return 'all'; }
      },
      {
        key: /Safari/,
        browser: 'Safari',
        version: function(row){
          var version = row[2].split('.');
          if(row[0] === 'iOS'){
            var iosVersion = row[3].split('.');
            if(iosVersion.length > 1) {
              return iosVersion[0] + "." + iosVersion[1];
            } else {
              return iosVersion[0];
            }
          }
          if(version[0] === '533'){
            return '5';
          } else if(version[0] === '534'){
            return '5.1';
          } else if(version[0] === '536'){
            return '6';
          }
          return version[0];
        }
      },
      {
        key: /SAMSUNG-GT.*/,
        browser: 'Samsung-GT',
        version: function(row){ return 'all'; }
      }
    ],
    cleanOS: function(value){
      if(value === 'Windows' || value === 'Macintosh' || value === 'Linux' || value === 'Chrome OS'){
        return 'Desktop';
      } else {
        return value;
      }
    },

    addData: function(os, browser, version, date, count){
      var result = false,
          i, _i;
      for(i=0,_i=browsers.data.length; i<_i; i++){
        result = browsers.data[i];
        if(result.os === os && result.browser === browser && result.version === version){
          break;
        }
        result = false;
      }
      if(!result){
        result = {};
        browsers.data.push(result);
      }
      if(typeof result[date] === 'undefined'){
        result[date] = 0;
      }
      result[date] = result[date] = + parseInt(count, 10);
    },
    percent: function(value, total){
      var percent = (value/total) * 100;
      return Math.round(percent * 100)/100;
    },
  };
  root.matrix.browsers = browsers;
}).call(this);
