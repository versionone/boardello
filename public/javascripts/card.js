var Card = Backbone.Model.extend({
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
		$(this.el).html('<span class="title">'+this.model.get('title')+' - '+ this.model.cid + '</span>')
		return this
	},

	unrender: function() {}
})