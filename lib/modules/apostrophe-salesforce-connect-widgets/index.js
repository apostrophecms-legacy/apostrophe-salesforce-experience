module.exports = {
  label: 'Salesforce Connect',
  extend: 'apostrophe-widgets',
  contextualOnly: true,

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
