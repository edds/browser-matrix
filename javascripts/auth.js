(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var auth = {
    user: false,

    getUser: function(callback){
      var hash = window.location.hash;

      auth.callback = callback;
      if(auth.user !== false){
        auth.callback(auth.user);
      } else {
        if(hash.indexOf('token') > -1){
          auth.validateToken();
        } else {
          auth.requestAuth();
        }
      }
    },
    requestAuth: function(){
      var endpoint = 'https://accounts.google.com/o/oauth2/auth';

      window.location = endpoint + "?" + $.param(matrix.settings.auth);
    },
    validateToken: function(){
      var params = auth.paramsFromHash(),
          endpoint = 'https://www.googleapis.com/oauth2/v1/tokeninfo?callback=?';

      if(typeof params.access_token !== 'undefined'){
        window.location.hash = '';
        auth.user = {
          accessToken: params.access_token
        };

        $.ajax({
          dataType: 'json',
          url: endpoint,
          data: { access_token: params.access_token },
          success: function(data){
            auth.user.expires = (+new Date()) + (data.expires_in * 1000);
            auth.user.id = data.user_id;
            auth.user.email = data.email;
            auth.callback(auth.user);
          }
        });
      }
    },
    paramsFromHash: function(){
      var hash = window.location.hash,
          params = {},
          chunk, i, _i;

      if(hash.indexOf('#') > -1){
        hash = hash.substr(1);
      }
      hash = hash.split('&');
      for(i=0,_i=hash.length; i<_i; i++){
        chunk = hash[i].split('=');
        params[decodeURIComponent(chunk[0])] = decodeURIComponent(chunk[1]);
      }
      return params;
    }
  }

  root.matrix.auth = auth;
}).call(this);
