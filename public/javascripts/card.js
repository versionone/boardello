var Card = Backbone.Model.extend({
		initialize: function(){
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

	},
	
	render: function(){
		$(this.el).html(render('card', this.model.toJSON()))
		return this
	},

	unrender: function() {}
})