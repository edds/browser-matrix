(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var manager = {
    selects: {},
    profileId: false,
    propertyId: false,
    accountId: false,

    init: function(){
      matrix.user.getAccounts(manager.renderAccounts);
      manager.selects = {
        $accounts: $('#account'),
        $properties: $('#property'),
        $profiles: $('#profile'),
        $period: $('#period'),
        $support: $('#support'),
        $combine: $('#combine')
      }

      manager.selects.$period.on('change', function(){
        if(manager.profileId !== false){
          manager.hardReload();
        }
      });
      manager.selects.$support.on('change', function(){
        if(manager.profileId !== false){
          manager.softReload();
        }
      });
      manager.selects.$combine.on('change', function(){
        if(manager.profileId !== false){
          manager.hardReload();
        }
      });
    },
    renderAccounts: function(data){
      matrix.template(manager.selects.$accounts, 'select-options', { object: 'account', options: data });
      manager.selects.$accounts
        .attr('disabled', false)
        .on('change', function(e){
          manager.reset();
          manager.accountId = manager.selects.$accounts.val();
          if(manager.accountId !== ''){
            manager.selects.$properties.attr('disabled', 'disabled');
            manager.propertyId = false;
            manager.selects.$profiles.attr('disabled', 'disabled');
            manager.profileId = false;
            matrix.user.getProperties(manager.accountId, manager.renderProperties);;
          }
        });
    },
    renderProperties: function(data){
      matrix.template(manager.selects.$properties, 'select-options', { object: 'property',  options: data });
      manager.selects.$properties
        .attr('disabled', false)
        .on('change', function(e){
          manager.reset();
          manager.propertyId = manager.selects.$properties.val();
          if(manager.propertyId !== ''){
            manager.selects.$profiles.attr('disabled', 'disabled');
            manager.profileId = false;
            matrix.user.getProfiles(manager.accountId, manager.propertyId, manager.renderProfiles);
          }
        });
    },
    renderProfiles: function(data){
      matrix.template(manager.selects.$profiles, 'select-options', { object: 'property', options: data });
      manager.selects.$profiles
        .attr('disabled', false)
        .on('change', function(e){
          manager.reset();
          manager.profileId = manager.selects.$profiles.val();
          if(manager.profileId !== ''){
            manager.loadStats();
          }
        });
    },
    loadStats: function(){
      matrix.graph.init();
      matrix.browsers.fetchData(manager.profileId, manager.renderStats);
    },
    renderStats: function(){
      var stats = matrix.browsers.getData(),
          days = matrix.browsers.getDays();
      matrix.template($('#wrapper'), 'browser-table', {
        results: stats,
        days: days
      });
      matrix.graph.addData(days, matrix.browsers.getSupportedData());
    },
    getPeriod: function(){
      return manager.selects.$period.val();
    },
    getSupport: function(){
      return parseInt(manager.selects.$support.val(), 10);
    },
    browserIndex: function(){
      return manager.selects.$combine.val();
    },
    reset: function(){
      $('#wrapper').html('');
      $('#graph').html('');
      matrix.graph.reset();
      matrix.browsers.reset();
      matrix.user.reset();
    },
    hardReload: function(){
      manager.reset();
      manager.loadStats();
    },
    softReload: function(){
      $('#wrapper').html('');
      $('#graph').html('');
      matrix.graph.reset();
      matrix.graph.init();
      manager.renderStats();
    }
  };
  root.matrix.manager = manager;
}).call(this);
