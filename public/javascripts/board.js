var Board = Backbone.Model.extend({
	})



	var BoardView = Backbone.View.extend({
		tagName: 'table',
		className: 'board',
		
		events: {
			'click .change-title': 'changeTitle'
		},

		initialize: function(){
			_.bindAll(this, 'render', 'unrender', 'titleChanged') // every function that uses 'this' as the current object should be in here

			this.model.bind('change:title', this.titleChanged)
			//this.model.bind('change', this.render)
			//this.model.bind('remove', this.unrender)
			this.render()
		},
		
		render: function(){
			$(this.el).html('<table class="board"><tr><td><span class="title">'+this.model.get('title')+'</span><button class="change-title">change title</button></td></tr></table')
			$('body').append(this.el)
			return this
		},

		unrender: function() {},

		changeTitle: function(){
			var newTitle = prompt('New Title')
			this.model.set({title : newTitle})
		},

		titleChanged: function(){
			$(this.el).find('.title').html(this.model.get('title'))
		}
	})



	var board1 = new Board()
	board1.set({title: 'dan lash'})
	var board1View = new BoardView({
		model: board1,
		id: 'boardview-' + board1.id
	})
  
