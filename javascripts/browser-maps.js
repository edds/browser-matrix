(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  root.matrix.browserMaps = {
    default: [
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
      },
      {
        key: /Opera Mini/,
        browser: 'Opera Mini',
        version: function(row){
          var v = row[2].split('.');
          return v[0] + '.' + v[1];
        }
      },
      {
        key: /^Opera$/,
        browser: 'Opera',
        version: function(row){
          var v = row[2].split('.');
          return v[0] + '.' + v[1];
        }
      },
      {
        key: /BlackBerry/,
        browser: 'BlackBerry',
        version: function(row){
          var v = row[2].split('.');
          return v[0] + '.' + v[1];
        }
      }
    ],
    autoUpdating: [
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
        key: /Amazon Silk/,
        browser: 'Amazon Silk',
        version: function(row){
          var version = row[2].split('.');
          return version[0];
        }
      },
      {
        key: /Chrome/,
        browser: 'Chrome',
        version: function(){ return 'auto'; }
      },
      {
        key: /Firefox/,
        browser: 'Firefox',
        version: function(row){
          var version = row[2].split('.');
          if(parseInt(version[0], 10) < 12){
            return version[0];
          } else {
            return 'auto';
          }
        }
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
      },
      {
        key: /Opera Mini/,
        browser: 'Opera Mini',
        version: function(row){
          var v = row[2].split('.');
          return v[0] + '.' + v[1];
        }
      },
      {
        key: /^Opera$/,
        browser: 'Opera',
        version: function(row){
          var v = row[2].split('.');
          if(parseInt(v[0], 10) < 15){
            return v[0] + '.' + v[1];
          } else {
            return 'auto';
          }
        }
      },
      {
        key: /BlackBerry/,
        browser: 'BlackBerry',
        version: function(row){
          var v = row[2].split('.');
          return v[0] + '.' + v[1];
        }
      }
    ]
  }
}).call(this);
