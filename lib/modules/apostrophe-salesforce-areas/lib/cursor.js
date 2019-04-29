var _ = require('@sailshq/lodash');

module.exports = {
  construct: function(self, options) {
    self.addFilter('personas', {
      def: true,
      after: function(results) {
        var salesforceExperience = self.apos.modules['apostrophe-salesforce-experience'];
        if (!salesforceExperience) {
          // salesforceExperience module is not awake yet
          return;
        }
        if (!self.get('personas')) {
          return;
        }
        var req = self.get('req');
        if (salesforceExperience.userIsEditor(req)) {
          return;
        }
        _.each(results, function(doc) {
          self.apos.areas.walk(doc, function(area, dotPath) {
            area.items = _.filter(area.items, function(widget) {
              return self.apos.areas.inPersona(req, widget);
            });
          });
        });
      }
    });
  }
};
