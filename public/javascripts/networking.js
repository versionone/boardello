var Networking = (function() {

  var module = {};

  var clientId = 1 + Math.random() * 100000000000000000;

  _.extend(module, Backbone.Events);

  var url = window.location.origin
      , socket = io.connect(url);

  function sendMessage(topic, data) {
    data = data || {};
    data.clientId = clientId;
    socket.emit(topic, data);
  }

  // private methods
  function sendCardGrabbed (id, user) {
    sendMessage('client:card-grabbed', {id: id, user: user});
  }

  function sendCardLetGo (id) {
    sendMessage('client:card-letgo', {id: id});
  }

  function sendCardMoving (data) {
    sendMessage('client:card-moving', data);
  }

  function sendCardCreated (card) {
    sendMessage('client:card-created', card);
  }

  function sendCardDestroyed(id) {
    sendMessage('client:card-destroyed', {id: id});
  }

  function sendCursorMovement(data) {
    sendMessage('client:cursor-movement', data);
  }

  module.bind('card-grabbed', sendCardGrabbed);
  module.bind('card-letgo', sendCardLetGo);
  module.bind('card-moving', sendCardMoving);
  module.bind('card-created', sendCardCreated);
  module.bind('card-destroyed', sendCardDestroyed);
  module.bind('cursor-movement', sendCursorMovement);

  function triggerEvent(topic, data) {
    if (data.clientId === clientId) return;
    module.trigger(topic, data);
  }

  socket.on('server:cursor-movement', function (data) {
    triggerEvent('remote:cursor-movement', data);
  });

  socket.on('server:card-moving', function (data) {
    triggerEvent('remote:card-moving', data);
  });

  socket.on('server:new-user', function(data) {
    triggerEvent('remote:new-user', data);
  });

  socket.on('server:card-created', function(data) {
    triggerEvent('remote:card-created', data);
  });

  return module;

})();
