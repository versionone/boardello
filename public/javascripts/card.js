var Card = Backbone.Model.extend({
		initialize: function(){
				if (!this.id)
					this.set({id: 1 + Math.random() * 100000000000000000})
		},
		
		defaults: {
			'title': 'New Card'
		}
	})


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
		$(this.el).html(render('card', this.model.toJSON()))
		var model = this.model
		$(this.el).draggable({
			drag: function(event, ui){
				Networking.trigger('card-moving', {id: model.id, x: ui.offset.left, y: ui.offset.top})
			}
		})
		return this
	},

	unrender: function() {}
})