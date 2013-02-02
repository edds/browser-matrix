(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var user = {
    details: false,
    callbacks: [],

    getAccounts: function(){
      var endpoint = 'https://www.googleapis.com/analytics/v3/management/accounts';

      user.apiRequest(endpoint, function(data){
        console.log(data);
      });

    },
    apiRequest: function(requestUri, callback){
      var extraParams = '';
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

          requestUri = requestUri + (requestUri.indexOf('?') > -1 ? '&' : '?') + extraParams;

          $.ajax({
            dataType: 'json',
            url: requestUri,
            success: callback
          });
        } else {
          alert('Your session has expired, please reload the page');
        }
      }
    }
  };

  root.matrix.user = user;
}).call(this);
