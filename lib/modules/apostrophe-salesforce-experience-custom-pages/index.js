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
  }
};
