var _ = require('lodash');

module.exports = {
  improve: 'apostrophe-pieces',
  beforeConstruct: function(self, options) {
    if (_.includes([ 'apostrophe-users', 'apostrophe-groups', 'apostrophe-global' ], self.__meta.name)) {
      return;
    }
    if (options.experiences !== false) {
      options.addFields = [
        {
          type: 'select',
          name: 'sfExperiences',
          // TODO: this is wrong, use a dynamic choice method like we do for widgets
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
