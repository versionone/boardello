Backbone.Model.prototype.toJSON = function() {
  var attrs = _.clone(this.attributes);
  _.each(attrs, function(value, key){
    if (value instanceof Backbone.Collection)
      attrs[key] = value.toJSON()
  })
  return attrs;
}