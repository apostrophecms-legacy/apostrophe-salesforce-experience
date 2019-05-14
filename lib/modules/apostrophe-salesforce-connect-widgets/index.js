module.exports = {
  label: 'Salesforce Connect',
  extend: 'apostrophe-widgets',
  contextualOnly: true,

  construct: function (self, options) {
    const connect = self.apos.modules['apostrophe-salesforce-connect'];
    const loginUrl = connect.options.loginUrl || '/auth/saml/login';

    const superLoad = self.load;
    self.load = function (req, widgets, callback) {
      return superLoad(req, widgets, function (err) {
        if (err) { return callback(err); }

        const sfUser = req.session.sfUser;
        widgets.forEach(function (widget) {
          widget._loginUrl = loginUrl;
          widget._logoutUrl = '/auth/saml/logout';

          if (sfUser && sfUser.name) widget._sfUser = sfUser.name;
        });

        return callback(null);
      });
    };
  }
};
