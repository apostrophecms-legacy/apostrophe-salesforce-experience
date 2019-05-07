module.exports = {
  label: 'Salesforce Connect',
  extend: 'apostrophe-widgets',
  contextualOnly: true,

  // Build up our options dynamically before the parent class sees them.
  afterConstruct: function (self, callback) {
    self.enablePassportStrategy();
    self.generateMetadata();
    self.addRoutes();
    return callback(null);
  },

  construct: function (self, options) {
    let sfUser;

    const superLoad = self.load;
    self.load = function (req, widgets, callback) {
      return superLoad(req, widgets, function (err) {
        if (err) { return callback(err); }

        if (sfUser) {
          widgets.forEach(function (widget) {
            widget._sfUser = sfUser;
          });

          sfUser = undefined;
        }

        return callback(null);
      });
    };
  }
};
