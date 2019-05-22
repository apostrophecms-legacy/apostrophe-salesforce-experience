const _ = require('lodash');

module.exports = {
  construct: function(self, options) {
    self.addFilter('piecesByExperience', {
      def: true,
      finalize: function() {
        const salesforceExp = self.apos.modules['apostrophe-salesforce-experience'];
        if (!salesforceExp) {
          // salesforce-experience module is not awake yet
          return;
        }
        if (!self.get('piecesByExperience')) {
          return;
        }
        if (!_.find(self.options.module.schema, { name: 'sfExperiences' })) {
          return;
        }
        const req = self.get('req');
        if (salesforceExp.userIsEditor(req)) {
          return;
        }
        var experiences = req.experiences;
        if (!experiences) {
          return;
        }
        self.and({
          $or: [
            {
              sfExperiences: {
                $exists: 0
              }
            },
            {
              sfExperiences: {
                $in: [ ...experiences, '' ]
              }
            }
          ]
        });
      }
    });
  }
};
