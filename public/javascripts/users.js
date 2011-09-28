var User = Backbone.Model.extend({
  defaults: {
    name: '',
    left: 0,
    top: 0
  },

  initialize: function(){
    var model = this;
    _.bindAll(model, 'moveCursor')
    if (!model.id) model.set({id: 1 + Math.random() * 100000000000000000})

    Networking
      .bind('remote:cursor-movement', function(data) { 
        if (data.id == model.id) model.moveCursor(data.left, data.top, true)
      });

    model
      .bind('change:top', function(_model, value, options){
        if (!options.remote)
          Networking.trigger('cursor-movement', model.toJSON());
      })
      .bind('change:left', function(_model, value, options){
        if (!options.remote)
          Networking.trigger('cursor-movement', model.toJSON());
      });
  },

  moveCursor: function(left, top, remote) {
    this.set({left: left, top: top}, { remote: remote });    
  }
});

var Users = Backbone.Collection.extend({
  model: User
});

var UserView = Backbone.View.extend({
	tagName: 'div',
	className: 'user',

  initialize: function(){
    _.bindAll(this, 'render', 'isMe')

    var model = this.model,
        view = this;

    if (!view.isMe()) {
      model.bind('change', this.render);
    }

    if (view.isMe()) {
      $(document).mousemove(function(e) {
         model.moveCursor(e.pageX, e.pageY);
      });
    }
  },

  render: function() {
    if (this.isMe()) return this;

    var $el = $(this.el);
    $el.html(this.model.get('name'));
    $el.attr('data-id', this.model.id);
    $el.css({top: this.model.get('top'), left: this.model.get('left')});

    $el.fadeIn(100);
    clearTimeout(this.lastTimeout);
    this.lastTimeout = setTimeout(function(){
      $el.fadeOut(500);
    }, 1000)

    return this;
  },

  isMe: function(){
    return this.model.id == $('body').data().userId;
  }

});
