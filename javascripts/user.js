(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var user = {
    details: false,
    callbacks: [],
    outstandingCallbacks: [],

    getAccounts: function(callback){
      var endpoint = 'https://www.googleapis.com/analytics/v3/management/accounts';
      user.apiRequest(endpoint, function(data){ callback(user.parseResponse(data)); });
    },
    getProperties: function(accountId, callback){
      var endpoint = 'https://www.googleapis.com/analytics/v3/management/accounts/'+accountId+'/webproperties';
      user.apiRequest(endpoint, function(data){ callback(user.parseResponse(data)); });
    },
    getProfiles: function(accountId, webPropertyId, callback){
      var endpoint = 'https://www.googleapis.com/analytics/v3/management/accounts/'+accountId+'/webproperties/'+webPropertyId+'/profiles';
      user.apiRequest(endpoint, function(data){ callback(user.parseResponse(data)); });
    },
    parseResponse: function(data){
      var i, _i, output = [];
      if(data.items){
        for(i=0,_i=data.items.length; i<_i; i++){
          output.push({
            id: data.items[i].id,
            name: data.items[i].name
          });
        }
        output.sort(function(a, b){
          if(a.name<b.name){return -1;}
          if(a.name>b.name){return 1;}
          return 0;
        });
      }
      return output;
    },
    apiRequest: function(requestUri, callback){
      var extraParams = '', authedRequestUri, response;
      if(user.details === false){
        user.callbacks.push([requestUri, callback]);
        matrix.auth.getUser(function(details){
          var i, _i;
          user.details = details;
          for(i=0,_i=user.callbacks.length; i<_i; i++){
            user.apiRequest(user.callbacks[i][0], user.callbacks[i][1]);
          }
        });
      } else {
        if(+new Date() < user.details.expires){
          extraParams = 'access_token='+user.details.accessToken+'&callback=?';

          authedRequestUri = requestUri + (requestUri.indexOf('?') > -1 ? '&' : '?') + extraParams;

          response = matrix.cache(user.details.id + '-' + requestUri);
          if(typeof response !== 'undefined'){
            callback(response);
          } else {
            $.ajax({
              dataType: 'json',
              url: authedRequestUri,
              success: (function(){
                var callbackId = Math.random();
                user.outstandingCallbacks.push(callbackId);
                return function(data){
                  matrix.cache(user.details.id + '-' + requestUri, data);
                  if(user.outstandingCallbacks.indexOf(callbackId) > -1){
                    callback(data);
                  }
                }
              }())
            });
          }
        } else {
          alert('Your session has expired, please reload the page');
        }
      }
    },
    reset: function(){
      user.outstandingCallbacks = [];
    }
  };

  root.matrix.user = user;
}).call(this);
