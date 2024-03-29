var Networking = (function() {

  var module = {}, socket;
  _.extend(module, Backbone.Events);

  socket = io.connect(window.location.origin);

  var eventNames = [
    'initial-state',
    'card-grabbed',
    'card-letgo',
    'card-moving',
    'card-created',
    'card-changetitle',
    'card-converted',
    'card-destroyed',
    'clear-board',
    'cursor-movement',
    'new-user',
    'board-grabbed',
    'board-letgo',
    'board-moving',
    'card-transfered'
    ]

  _.each(eventNames, function(eventName){
    module.bind(eventName, function(data){
      socket.emit('client:' + eventName, data);
    });

    socket.on('server:' + eventName, function(data){
      module.trigger('remote:' + eventName, data);
    });
  });

  return module;

})();
