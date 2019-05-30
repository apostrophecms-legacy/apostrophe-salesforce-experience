const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-pieces',
  beforeConstruct: function(self, options) {
    if (_.includes([ 'apostrophe-users', 'apostrophe-groups', 'apostrophe-global' ], self.__meta.name)) {
      return;
    }

    options.addFields = [
      {
        type: 'checkboxes',
        name: 'sfExperiences',
        label: 'Salesforce Experiences',
        choices: 'getExperienceChoices'
      }
    ].concat(options.addFields || []);

    options.arrangeFields = (options.arrangeFields || []).concat([
      {
        name: 'salesforce-experiences',
        label: 'Salesforce Experience',
        fields: ['sfExperiences']
      }
    ]);
  },
  construct: function(self, options) {
    self.getExperienceChoices = async function (req) {
      const sfe = self.apos.modules['apostrophe-salesforce-experience'];
      const experiences = await sfe.getExperiences();

      return [
        {
          // Label has to distinguish it from personas universal somehow. -Tom
          label: 'SF: Universal',
          value: ''
        },
        {
          label: 'SF: None',
          value: 'none'
        }
      ].concat(experiences);
    };
  }
};
