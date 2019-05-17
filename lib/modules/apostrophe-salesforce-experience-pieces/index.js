var _ = require('@sailshq/lodash');

module.exports = {
  improve: 'apostrophe-pieces',
  beforeConstruct: function(self, options) {
    if (_.includes([ 'apostrophe-users', 'apostrophe-groups', 'apostrophe-global' ], self.__meta.name)) {
      return;
    }
    if (options.experiencess !== false) {
      options.addFields = [
        {
          type: 'salesforce-experiences',
          name: 'sfExperiences'
        }
      ].concat(options.addFields || []);
      options.arrangeFields = [
        {
          name: 'experiences',
          label: 'Experiences',
          fields: [ 'experiences' ]
        }
      ].concat(options.arrangeFields || []);
    }
  }
};
