var Card = Backbone.Model.extend({
    defaults: {
      'title': 'New Card',
      'left': 0,
      'top': 0,
      'grabbed': false
    },

		initialize: function(){
      var model = this
      _.bindAll(model, 'move', 'letGo', 'delete')
			if (!model.id) model.set({id: 1 + Math.random() * 100000000000000000})

      Networking.bind('remote:card-moving', function(data) {
        if (data.id == model.id) {
          model.move(data.left, data.top, true)
        }
      });
      Networking.bind('remote:card-grabbed', function(data) {
        if (data.id == model.id) {
          model.grab(true);
        }
      });
      Networking.bind('remote:card-letgo', function(data) {
        if (data.id == model.id) {
          model.letGo(true);
        }
      });
      Networking.bind('remote:card-destroyed', function(data){
        if (data.id == model.id) {
          model.delete(true)
        }
      });

      model
        .bind('change:left', function(_card, value, options) {
          if (!options.remote)
            Networking.trigger('card-moving', model.toJSON());
        })
        .bind('change:top', function(_card, value, options) {
          if (!options.remote)
            Networking.trigger('card-moving', model.toJSON());
        })
        .bind('destroy', function(_card, collection, options) {
          if (!options.remote)
            Networking.trigger('card-destroyed', model.toJSON());
        })
        .bind('change:grabbed', function(_card, value, options) {
          if (!options.remote) {
            var eventName = model.get('grabbed') ? 'card-grabbed' : 'card-letgo';
            Networking.trigger(eventName, model.toJSON());
          }
        });
		},

    grab: function(remote) {
      var grabbed = this.get('grabbed');
      if (!grabbed) this.set({grabbed: true}, { remote: remote });

      return !grabbed;
    },

    move: function(left, top, remote){
      this.set({left: left, top: top}, { remote: remote }); 
      if (remote) this.set({ remoteMoving: true });
    },

    letGo: function(remote) {
      this.set({grabbed: false}, { remote : remote });
    },

    delete: function(remote) {
      this.trigger('destroy', this, this.collection, { remote: remote });
    }
	})

var Cards = Backbone.Collection.extend({
    model: Card,
  });

var CardView = Backbone.View.extend({
	tagName: 'div',
	className: 'card',

	events: {
    'click .delete': 'delete',
    'dblclick .title' : 'poop'
	},

	initialize: function(){

		_.bindAll(this, 'render', 'unrender', 'delete', 'poop')

    var model = this.model;

		model.bind('change', this.render)
   	model.bind('destroy', this.unrender)
	},

	render: function(){

		var $el = $(this.el)
    var model = this.model

    $el.html(render('card', model.toJSON()))

    $el.css({
      left: model.get('left'),
      top: model.get('top')
    })

		$(this.el).draggable({
      start: function(){
        return model.grab();
      },
			drag: function(event, ui){
        model.move(ui.position.left, ui.position.top);
			},
      stop: function() {
        model.letGo()
      },
			grid: [10,10]
		})
		return this
	},

  unrender: function(){
    $(this.el).remove()
  },

  delete: function(){
    if (confirm('are you sure?'))
      this.model.delete();
  },

  poop: function(e) {
    e.stopPropagation();
    // $(this.el).find('.title').html($('<input type="text">'));
  }
});

