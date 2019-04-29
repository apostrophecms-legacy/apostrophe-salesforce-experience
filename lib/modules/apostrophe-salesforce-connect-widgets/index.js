const _ = require('lodash');
const jsforce = require('jsforce');

module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Salesforce Connect',
  afterConstruct: function (self, callback) {
    return self.connectSalesforce().then(function () {
      return callback(null);
    }).catch(callback);
  },
  construct: function (self, options) {
    // TODO: Run this connection to Salesforce periodically
    self.connectSalesforce = function () {
      self.jsforce = new jsforce.Connection({
        loginUrl: self.options.adminLoginUrl || 'https://client-domain.my.salesforce.com'
      });
      return self.jsforce.login(self.options.adminUsername || 'USERNAME', self.options.adminPasswordAndToken || 'PASSWORD').then(function () {
        return self.jsforce.query('SELECT Product_Type__c from Fleet_Composition__c order by Product_Type__c');
      }).then(function (data) {
        self.productTypes = _.filter(_.uniq(data.records.map(row => row.Product_Type__c)), type => type);
      }).catch(function (e) {
        throw e;
      });
    };
    self.addHelpers({
      productTypes: function () {
        return self.productTypes;
      }
    });
    // Should return true if the user is an editor and thus
    // should bypass the normal restrictions on whether they
    // can see widgets and pieces for other personas, for
    // editing purposes. If this definition ("anyone who is
    // logged in is a potential editor") is not fine-grained
    // enough for your purposes, override this method at
    // project level

    self.userIsEditor = function (req) {
      return req.user;
    };

    self.route('post', 'my-products', function (req, res) {
      // TODO server should be doing this query with the user's
      // access token so it is not spoofable
      req.session.products = req.body.products;
      return res.send({ status: 'ok' });
    });

    const superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function (req) {
      const result = superGetCreateSingletonOptions(req);
      return _.defaults(result, {
        clientId: self.options.userClientId || 'CLIENTID',
        redirectUri: self.options.userRedirectUri || 'REDIRECTURI',
        loginUrl: self.options.userLoginUrl || 'LOGINURL'
      });
    };
  }
};
