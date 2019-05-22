const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-widgets',
  beforeConstruct: function (self, options) {
    options.addFields = [
      {
        type: 'checkboxes',
        name: 'sfExperiences',
        choices: 'getExperienceChoices',
        widgetControls: true,
        contextual: true
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

    self.getExperienceChoices = async function(req) {
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

    const superGetWidgetClasses = self.getWidgetClasses;
    self.getWidgetClasses = function (widget) {
      const contextReq = self.apos.templates.contextReq;

      if (!self.apos.areas.inExperience(contextReq, widget)) {
        return superGetWidgetClasses(widget);
      }

      return superGetWidgetClasses(widget).concat(['apos-area-widget-in-exp']);
    };
  }
};
