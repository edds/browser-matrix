(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var manager = {
    renderedWeeks: 0,
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
        $lines: $('#lines')
      }

      manager.selects.$period.on('change', function(){
        if(manager.profileId !== false){
          manager.hardReload();
        }
      });
      manager.selects.$lines.on('change', function(){
        if(manager.profileId !== false){
          manager.softReload();
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
      matrix.browsers.update(manager.profileId, manager.renderStats, new Date(), manager.period());
      matrix.graph.init();
    },
    renderStats: function(){
      var stats = matrix.browsers.getData(),
          date;
      matrix.template($('#wrapper'), 'browser-table', {
        results: stats,
        days: matrix.browsers.dates
      });
      matrix.graph.addData(matrix.browsers.dates, stats);
      if(manager.renderedWeeks < 8){
        manager.renderedWeeks = manager.renderedWeeks + 1;
        date = new Date();
        date.setDate(date.getDate() - (manager.period()*manager.renderedWeeks));
        matrix.browsers.update(manager.profileId, manager.renderStats, date, manager.period());
      }
    },
    period: function(){
      return parseInt(manager.selects.$period.val(), 10);
    },
    lines: function(){
      return parseInt(manager.selects.$lines.val(), 10);
    },
    reset: function(){
      manager.renderedWeeks = 0;
      $('#wrapper').html('');
      $('#graph').html('');
      matrix.graph.reset();
      matrix.browsers.reset();
    },
    hardReload: function(){
      manager.reset();
      manager.loadStats();
    },
    softReload: function(){
      $('#graph').html('');
      matrix.graph.reset();
      matrix.graph.init();
      matrix.graph.addData(matrix.browsers.dates, matrix.browsers.getData());
    }
  };
  root.matrix.manager = manager;
}).call(this);
