const _ = require('lodash');

module.exports = {
  construct: function(self, options) {
    self.addFilter('experiences', {
      def: true,
      after: function(results) {
        const salesforceExp = self.apos.modules['apostrophe-salesforce-experience'];

        // Check if Salesforce experience module is awake
        if (!salesforceExp) return;

        if (!self.get('experiences')) return;

        const req = self.get('req');

        if (!req.experience) { req.experience = 'none'; }

        if (salesforceExp.userIsEditor(req)) return;

        _.each(results, doc => {
          self.apos.areas.walk(doc, (area, dotPath) => {
            area.items = _.filter(area.items, widget => {
              return self.apos.areas.inExperience(req, widget);
            });
          });
        });
      }
    });
  }
};
