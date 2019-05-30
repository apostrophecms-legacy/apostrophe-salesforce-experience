module.exports = {
  improve: 'apostrophe-custom-pages',
  beforeConstruct: function(self, options) {
    options.addFields = [
      {
        type: 'checkboxes',
        name: 'sfExperiences',
        choices: 'getExperienceChoices'
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
