var _ = require('lodash');

module.exports = {
  improve: 'apostrophe-pieces',
  beforeConstruct: function(self, options) {
    if (_.includes([ 'apostrophe-users', 'apostrophe-groups', 'apostrophe-global' ], self.__meta.name)) {
      return;
    }

    // TODO: document options.experiences
    if (options.experiences !== false) {
      options.addFields = [
        {
          type: 'select',
          name: 'sfExperiences',
          // Choices patched in later when main module wakes up
          choices: []
        }
      ].concat(options.addFields || []);
      options.arrangeFields = [
        {
          name: 'salesforce-experiences',
          label: 'Salesforce Experience',
          fields: ['sfExperiences']
        }
      ].concat(options.arrangeFields || []);
    }
  }
};
