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
      matrix.template('wrapper', 'select-options', {
        object: 'account',
        options: data
      });
      $('#wrapper').on('click', 'a', function(e){
        e.preventDefault();
        manager.accountId = $(e.target).data('id');
        $('#wrapper').off('click', 'a');
        matrix.user.getProperties(manager.accountId, manager.renderProperties);;
      });
    },
    renderProperties: function(data){
      matrix.template('wrapper', 'select-options', {
        object: 'property',
        options: data
      });
      $('#wrapper').on('click', 'a', function(e){
        e.preventDefault();
        manager.propertyId = $(e.target).data('id');
        $('#wrapper').off('click', 'a');
        matrix.user.getProfiles(manager.accountId, manager.propertyId, manager.renderProfiles);
      });
    },
    renderProfiles: function(data){
      matrix.template('wrapper', 'select-options', {
        object: 'profile',
        options: data
      });
      $('#wrapper').on('click', 'a', function(e){
        e.preventDefault();
        manager.profileId = $(e.target).data('id');
        $('#wrapper').off('click', 'a');
        matrix.browsers.update(manager.profileId, manager.renderStats, new Date());
        matrix.graph.init();
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
