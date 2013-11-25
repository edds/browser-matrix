(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var browsers = {
    dates: [],
    totals: [],
    data: [],
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    reset: function(){
      browsers.dates = [];
      browsers.totals = [];
      browsers.data = [];
    },
    endpoint: function(profileId, startDate, endDate){
      return "https://www.googleapis.com/analytics/v3/data/ga?"
      + "ids="+ profileId +"&"
      + "dimensions=ga:operatingSystem,ga:browser,ga:browserVersion,ga:operatingSystemVersion,ga:" + matrix.manager.getPeriod() + '&'
      + "metrics=ga:visitors&"
      + "start-date="+ startDate +"&"
      + "end-date="+ endDate +"&"
      + "max-results=5000&"
      + "sort=-ga:visitors"
    },
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
        result = { os: options.os, browser: options.browser, version: options.version, days: [0,0,0,0, 0,0,0,0, 0,0,0,0] };
        browsers.data.push(result);
      }
      if(typeof result.days[options.date] === 'undefined'){
        result.days[options.date] = 0;
      }
      result.days[options.date] = result.days[options.date] + parseInt(options.visits, 10);
    },
    percent: function(value, total){
      if(total === 0){ return 0; }
      var percent = (value/total) * 100;
      return Math.round(percent * 100)/100;
    },
    fetchData: function(profileId, callback){
      var startDate = new Date(), startDateString = '',
          endDate = new Date(), endDateString = '',
          period = matrix.manager.getPeriod(),
          dayNumber, i, _i, tmpDate;

      browsers.dates = [];

      if(period === 'nthDay') {
        startDate.setDate(startDate.getDate() - 12);
        for(i=0,_i=12; i<_i; i++){
          tmpDate = new Date(startDate.valueOf());
          tmpDate.setDate(startDate.getDate() + i);
          browsers.dates.push(tmpDate.getDate() + " " +browsers.monthNames[tmpDate.getMonth()]);
        }
      } else if(period === 'nthWeek') {
        dayNumber = (startDate.getDay() + 6) % 7; // day of the week with monday = 0
        startDate.setDate(startDate.getDate() - (dayNumber + 7*12)); // monday 12 weeks ago
        endDate.setDate(endDate.getDate() - (dayNumber + 1)); // most recent sunday
        for(i=0,_i=12; i<_i; i++){
          tmpDate = new Date(startDate.valueOf());
          tmpDate.setDate(startDate.getDate() + i*7);
          browsers.dates.push(tmpDate.getDate() + " " +browsers.monthNames[tmpDate.getMonth()]);
        }
      } else if(period === 'nthMonth') {
        startDate.setDate(1);
        startDate.setMonth(startDate.getMonth() - 11); // 11 months ago
        for(i=0,_i=12; i<_i; i++){
          tmpDate = new Date(startDate.valueOf());
          tmpDate.setMonth(startDate.getMonth() + i);
          browsers.dates.push(browsers.monthNames[tmpDate.getMonth()]);
        }
      }

      startDateString = startDate.getFullYear() +'-'+ browsers.zeroPad(startDate.getMonth()+1) +'-'+ browsers.zeroPad(startDate.getDate());
      endDateString = endDate.getFullYear() +'-'+ browsers.zeroPad(endDate.getMonth()+1) +'-'+ browsers.zeroPad(endDate.getDate());

      var endpoint = browsers.endpoint('ga:'+profileId, startDateString, endDateString);
      matrix.user.apiRequest(endpoint, function(data){
        browsers.parseAnalyticsData(data, callback);
      });
    },
    parseAnalyticsData: function(data, callback){
      browsers.totals = [0,0,0,0, 0,0,0,0, 0,0,0,0];

      data.rows.forEach(function(data,i){
        var i, _i, row, found = false;
        for(i=0,_i=matrix.browserMaps[matrix.manager.browserIndex()].length; i<_i; i++){
          row = matrix.browserMaps[matrix.manager.browserIndex()][i];
          if(row.key.exec(data[1])){
            found = true;
            browsers.addData({
              os: browsers.cleanOS(data[0]),
              browser: row.browser,
              version: row.version(data),
              date: parseInt(data[4], 10),
              visits: data[5]
            });
            break;
          }
        }
        if(found === false){
          browsers.addData({
            os: browsers.cleanOS(data[0]),
            browser: data[1],
            version: data[2],
            date: parseInt(data[4], 10),
            visits: data[5]
          });
        }
      });
      browsers.data.forEach(function(data, i){
        data.days.forEach(function(day, i){
          browsers.totals[i] = browsers.totals[i] + day;
        });
      });
      callback();
    },
    zeroPad: function(i){
      if( i < 10 ){
        return '0' + i;
      }
      return i;
    },
    getData: function(sortIndex){
      var out = [],
          browser,
          dayTotal, dayCap,
          i, _i, j, _j;

      for(i=0,_i=browsers.data.length; i<_i; i++){
        browser = {
          os: browsers.data[i].os,
          browser: browsers.data[i].browser,
          version: browsers.data[i].version,
          days: [],
          supported: false,
          daysWithSupport: []
        };
        for(j=0,_j=browsers.dates.length; j<_j; j++){
          if(typeof browsers.data[i].days[j] !== 'undefined'){
            browser.days.push(browsers.percent(browsers.data[i].days[j], browsers.totals[j]));
          } else {
            browser.days.push(0);
          }
        }
        out.push(browser);
      }
      for(j=0,_j=browsers.dates.length; j<_j; j++){
        dayTotal = 0;
        dayCap = (matrix.manager.getSupport());
        out.sort(function(a, b){
          return b.days[j] - a.days[j];
        });
        for(i=0,_i=out.length; i<_i; i++){
          if(dayTotal < dayCap){
            out[i].supported = true;
            out[i].daysWithSupport.push({ users: out[i].days[j], supported: true })
          } else {
            out[i].daysWithSupport.push({ users: out[i].days[j], supported: false })
          }
          dayTotal = dayTotal + out[i].days[j];
        }
      }
      if(typeof sortIndex !== 'undefined'){
        out.sort(function(a, b){ return b.days[sortIndex] - a.days[sortIndex]; });
      } else {
        out.sort(function(a, b){
          return Math.max.apply(null, b.days) - Math.max.apply(null, a.days);
        });
      }
      return out;
    },
    getDays: function(){
      return browsers.dates;
    },
    getSupportedData: function(){
      var data = browsers.getData();

      return data.filter(function(el){ return el.supported; });
    }
  };
  root.matrix.browsers = browsers;
}).call(this);
