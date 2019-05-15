// const {
//   connectSalesforce,
//   getUserExperience
// } = require('../../../query-salesforce');

module.exports = {
  extend: 'apostrophe-module',

  afterConstruct: function (self, callback) {
    self.addRoutes();
    return callback(null);
  },

  construct: async function (self, options) {
    const salesforceExperience = self.apos.modules['apostrophe-salesforce-experience'];
    const sfExpOptions = salesforceExperience.options;

    self.getCallbackPath = function () {
      if (sfExpOptions.callbackUrl) {
        const callbackUrl = new URL(sfExpOptions.callbackUrl);

        return callbackUrl.pathname;
      } else {
        return '/auth/salesforce/login/callback';
      }
    };

    self.addRoutes = function () {
      self.apos.app.post(
        self.getCallbackPath(),
        function (req, res, next) {
          console.log(req);
          console.log(Object.keys(req));
          next();
        }
      );
    };
  }
};
