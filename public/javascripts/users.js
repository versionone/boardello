var User = Backbone.Model.extend({
  defaults: {
    name: ''
  }
})

var Users = Backbone.Collection.extend({
  model: User
});

var UserView = Backbone.View.extend({

	tagName: 'li',
	className: 'user',

  initialize: function(){
    _.bindAll(this, 'render')

  },

  render: function() {
    $el = $(this.el);
    $el.html(this.model.get('name'));
    return this;
  }

});
