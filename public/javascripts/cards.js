var Card = Backbone.Model.extend({
    defaults: {
      'title': 'New Card',
      'left': 0,
      'top': 0
    },

		initialize: function(){
      var model = this
      _.bindAll(model, 'move')
			if (!model.id) model.set({id: 1 + Math.random() * 100000000000000000})

      Networking.bind('remote:card-moving', function(data) {
        if (data.id == model.id) {
          model.move(data.left, data.top, true)
        }
      });

      model.bind('change', function(_card, options) {
        if (!options.remote)
          Networking.trigger('card-moving', model.toJSON())
      })
		},

    move: function(left, top, remote){
      this.set({left: left, top: top}, { remote: remote })
    }
	})

var Cards = Backbone.Collection.extend({
    model: Card,
  });

var CardView = Backbone.View.extend({
	tagName: 'div',
	className: 'card',

	events: {
	},

	initialize: function(){
		_.bindAll(this, 'render')

		this.model.bind('change', this.render)
		this.model.bind('remove', this.unrender)
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
			drag: function(event, ui){
        model.move(ui.position.left, ui.position.top);
			},
			grid: [10,10]
		})
		return this
	}
});

