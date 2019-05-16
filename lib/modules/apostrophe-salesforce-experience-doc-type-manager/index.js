const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-doc-type-manager',
  construct: function(self, options) {
    self.afterInit = function () {
      self.setChoices();
    };

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
