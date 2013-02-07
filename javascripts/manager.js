(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var manager = {
    renderedWeeks: 0,
    init: function(){
      matrix.user.getAccounts(manager.renderAccounts);
    },
    renderAccounts: function(data){
      var $accounts = $('#account');
      matrix.template('account', 'select-options', { object: 'account', options: data });
      $accounts.attr('disabled', false);
      $accounts.on('change', function(e){
        manager.accountId = $accounts.val();
        if(manager.accountId !== ''){
          matrix.user.getProperties(manager.accountId, manager.renderProperties);;
        }
      });
    },
    renderProperties: function(data){
      var $properties = $('#property');
      matrix.template('property', 'select-options', { object: 'property',  options: data });
      $properties.attr('disabled', false);
      $properties.on('change', function(e){
        manager.propertyId = $properties.val();
        if(manager.propertyId !== ''){
          matrix.user.getProfiles(manager.accountId, manager.propertyId, manager.renderProfiles);
        }
      });
    },
    renderProfiles: function(data){
      var $profiles = $('#profile');
      matrix.template('profile', 'select-options', { object: 'property', options: data });
      $profiles.attr('disabled', false);
      $profiles.on('change', function(e){
        manager.profileId = $profiles.val();
        if(manager.profile !== ''){
          matrix.browsers.update(manager.profileId, manager.renderStats, new Date());
          matrix.graph.init();
        }
      });
    },
    renderStats: function(){
      var stats = matrix.browsers.getData(),
          date;
      matrix.template('wrapper', 'browser-table', {
        results: stats,
        days: matrix.browsers.dates
      });
      matrix.graph.addData(matrix.browsers.dates, stats);
      if(manager.renderedWeeks < 8){
        manager.renderedWeeks = manager.renderedWeeks + 1;
        date = new Date();
        date.setDate(date.getDate() - (7*manager.renderedWeeks));
        matrix.browsers.update(manager.profileId, manager.renderStats, date);
      }
    }
  };
  root.matrix.manager = manager;
}).call(this);
