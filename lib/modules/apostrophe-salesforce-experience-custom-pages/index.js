module.exports = {
  improve: 'apostrophe-custom-pages',
  beforeConstruct: function(self, options) {
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
  construct: function (self, options) {
    self.getExperienceChoices = async function (req) {
      const sfe = self.apos.modules['apostrophe-salesforce-experience'];
      const experiences = await sfe.getExperiences();
      console.log('IMPROVE CUSTOM PAGES');
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
