var Card = Backbone.Model.extend({
		initialize: function(){
				if (!this.id)
					this.set({id: 1 + Math.random() * 100000000000000000})
		},

		defaults: {
			'title': 'New Card',
      'x': 0,
      'y': 0
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
		_.bindAll(this, 'render', 'unrender') // every function that uses 'this' as the current object should be in here

		this.model.bind('change', this.render)
		this.model.bind('remove', this.unrender)

		var _id = this.model.id
		var $el = $(this.el)
    Networking.bind('remote:card-moving', function(data){
    	if (data.id == _id)
    		$el.css({ //this should be model data
    			left: data.x,
    			top: data.y
    		})
    });

	},

	render: function(){

		var $el = $(this.el)

    $el.html(render('card', this.model.toJSON()))

    $el.css({ //this should be model data
      left: this.model.get('x'),
      top: this.model.get('y')
    })

		var model = this.model
		$(this.el).draggable({
			drag: function(event, ui){
				Networking.trigger('card-moving', {id: model.id, x: ui.position.left, y: ui.position.top})
			},
      stop: function(event, ui) {
        console.log(ui)
        model.set({x: ui.position.left, y: ui.position.top});
				Networking.trigger('card-letgo', {id: model.id, x: ui.position.left, y: ui.position.top})
      }
		})
		return this
	},

	unrender: function() {}
})

