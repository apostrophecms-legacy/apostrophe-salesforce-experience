const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-custom-pages',
  beforeConstruct: function(self, options) {
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
  },
  construct: function (self, options) {
    self.on('apostrophe-pages:beforeSend', 'setChoices');

    self.setChoices = function () {
      const salesforceExp = self.apos.modules['apostrophe-salesforce-experience'];

      if (!salesforceExp.experiences) {
        salesforceExp.experiences = [];
      }

      const experienceField = _.find(self.schema, {
        name: 'sfExperiences'
      });

      if (experienceField) {
        experienceField.choices = [
          {
            label: 'Universal',
            value: ''
          },
          {
            label: 'No Experience',
            value: 'none'
          }
        ].concat(_.map(salesforceExp.experiences, function (exp) {
          return {
            label: exp.label,
            value: exp.value
          };
        }));
      }
    };
  }
};
