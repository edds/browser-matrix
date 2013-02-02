(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var manager = {
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
        matrix.user.getProfiles(manager.accountId, manager.propertyId, manager.renderProperties);;
      });
    },
    renderProfiles: function(data){
      matrix.template('wrapper', 'select-options', {
        object: 'profile',
        options: data
      });
      $('#wrapper').on('click', 'a', function(e){
        e.preventDefault();
        manager.propertyId = $(e.target).data('id');
        $('#wrapper').off('click', 'a');
      });
    }
  };
  root.matrix.manager = manager;
}).call(this);
