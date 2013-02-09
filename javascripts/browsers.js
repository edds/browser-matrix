(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var browsers = {
    dates: [],
    totals: [],
    data: [],
    reset: function(){
      browsers.dates = [];
      browsers.totals = [];
      browsers.data = [];
    },
    endpoint: function(profileId, startDate, endDate){
      return "https://www.googleapis.com/analytics/v3/data/ga?"
      + "ids="+ profileId +"&"
      + "dimensions=ga:operatingSystem,ga:browser,ga:browserVersion,ga:operatingSystemVersion&"
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
    addData: function(options){
      var result = false,
          i, _i;
      for(i=0,_i=browsers.data.length; i<_i; i++){
        result = browsers.data[i];
        if(result.os === options.os && result.browser === options.browser && result.version === options.version){
          break;
        }
        result = false;
      }
      if(!result){
        result = { os: options.os, browser: options.browser, version: options.version };
        browsers.data.push(result);
      }
      if(typeof result[options.date] === 'undefined'){
        result[options.date] = 0;
      }
      result[options.date] = result[options.date] + parseInt(options.visits, 10);
    },
    percent: function(value, total){
      var percent = (value/total) * 100;
      return Math.round(percent * 100)/100;
    },
    update: function(profileId, callback, date, period){
      var startDate, endDate;
      date.setDate(date.getDate() - period);
      startDate = date.getFullYear() +'-'+ browsers.zeroPad(date.getMonth()+1) +'-'+ browsers.zeroPad(date.getDate());
      date.setDate(date.getDate() + period - 1);
      endDate = date.getFullYear() +'-'+ browsers.zeroPad(date.getMonth()+1) +'-'+ browsers.zeroPad(date.getDate());

      var endpoint = browsers.endpoint('ga:'+profileId, startDate, endDate);
      matrix.user.apiRequest(endpoint, function(data){
        var totalVisits = data.totalsForAllResults['ga:visitors'];
        browsers.totals.unshift(totalVisits);
        browsers.dates.unshift(startDate);

        data.rows.forEach(function(data,i){
          var i, _i, row, found = false;
          for(i=0,_i=browsers.cleanBrowser.length; i<_i; i++){
            row = browsers.cleanBrowser[i];
            if(row.key.exec(data[1])){
              found = true;
              browsers.addData({
                os: browsers.cleanOS(data[0]),
                browser: row.browser,
                version: row.version(data),
                date: startDate,
                visits: data[4]
              });
              break;
            }
          }
          if(found === false){
            browsers.addData({
              os: browsers.cleanOS(data[0]),
              browser: data[1],
              version: 'all',
              date: startDate,
              visits: data[4]
            });
          }
        });
        callback();
      });
    },
    zeroPad: function(i){
      if( i < 10 ){
        return '0' + i;
      }
      return i;
    },
    getData: function(){
      var out = [],
          browser,
          i, _i, j, _j;

      for(i=0,_i=browsers.data.length; i<_i; i++){
        browser = {
          os: browsers.data[i].os,
          browser: browsers.data[i].browser,
          version: browsers.data[i].version,
          days: []
        };
        for(j=0,_j=browsers.dates.length; j<_j; j++){
          if(typeof browsers.data[i][browsers.dates[j]] !== 'undefined'){
            browser.days.unshift(browsers.percent(browsers.data[i][browsers.dates[j]], browsers.totals[j]));
          } else {
            browser.days.unshift(0);
          }
        }
        out.sort(function(a, b){
          return Math.max.apply(null, b.days) - Math.max.apply(null, a.days);
        });
        out.push(browser);
      }
      return out;
    }
  };
  root.matrix.browsers = browsers;
}).call(this);
