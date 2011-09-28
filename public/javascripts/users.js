var User = Backbone.Model.extend({
  defaults: {
    name: '',
    left: 0,
    top: 0
  },

  initialize: function(){
    var model = this;
    if (!model.id) model.set({id: 1 + Math.random() * 100000000000000000})

    Networking.bind('remote:cursor-movement', function(data) { 
      if (data.id == model.id)
        model.set({left: data.left, top: data.top}, { remote: true });
    });

    _.each(['change:top', 'change:left'], function(topic){
      model.bind(topic, function(_model, value, options){
        if (!options.remote)
          Networking.trigger('cursor-movement', model.toJSON());
      });
    });
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
    model.bind('change', this.render);

    if (view.isMe()) {
      $(document).mousemove(function(e) {
         model.set({left: e.pageX, top: e.pageY});
      });
    }
  },

  render: function() {
    var $el = $(this.el);
    $el.html(this.model.get('name'));
    $el.attr('data-id', this.model.id);
    $el.css({top: this.model.get('top'), left: this.model.get('left')});
    $el.show();
    return this;
  },

  isMe: function(){
    return this.model.id == $('body').data().userId;
  }

});
