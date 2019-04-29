var jsforce = require('jsforce');
var sfExp = window.apos.modules['apostrophe-salesforce-experience'];

jsforce.browser.init({
  clientId: sfExp.options.clientId,
  redirectUri: sfExp.options.redirectUri,
  loginUrl: sfExp.options.loginUrl
});

apos.define('apostrophe-salesforce-connect-widgets', {
  extend: 'apostrophe-widgets',
  construct: function (self, options) {
    self.play = function ($widget, data, options) {
      var $button = $widget.find('[data-apos-salesforce-connect]');
      var $table = $widget.find('[data-apos-salesforce-profile]');
      var accountId;

      $button.on('click', function () {
        jsforce.browser.login();
        // Get something back?
      });

      jsforce.browser.on('connect', (_conn) => {
        _conn.identity().then(function (i) {
          // could access identity here if it let us
          findAccount(_conn);

        }).catch(function (err) {
          apos.utils.error(err);
        });
      });

      function findAccount (connection) {
        connection.sobject('Account').find({
          // TODO unhook from client-specific options
          Name: 'A F T'
        }, {
          Id: 1,
          Name: 1
        }).sort({
          Name: 1
        }).execute((err, records) => {
          if (err) {
            apos.utils.error(err);
            return;
          }

          const accountId = records.find(r => r.Name === 'A F T').Id;

          getAccountInfo({
            connection,
            accountId
          })
        });
      }

      function getAccountInfo (opts) {
        opts.conn.sobject('Products__c').find({
          Account__c: opts.accountId
        }, {
            Product_Type__c: 1,
            Quantity__c: 1,
            Id: 1
          }).sort({
            Product_Type__c: 1
          }).execute((err, records) => {
            if (err) {
              apos.utils.error(err);
              return;
            }
            const products = {}
            records.forEach(record => {
              if (record.Product_Type__c) {
                products[record.Product_Type__c] = products[record.Product_Type__c] || 0
                products[record.Product_Type__c] += record.Quantity__c
              }
            })
            var productsDetails = []

            Object.keys(products).forEach(type => {
              productsDetails.push({
                type: type,
                quantity: products[type]
              })
            })

            if (this.initialLogin) {
              $.jsonCall('/modules/apostrophe-salesforce-connect-widgets/my-products', {
                products
              }, function () {
                // refresh to hide wrong-product widgets right away
                location.reload(true);
              })
            }
          });
        }
      }
    };
  }
});
