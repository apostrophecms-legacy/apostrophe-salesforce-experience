const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-widgets',
  beforeConstruct: function (self, options) {
    options.addFields = [
      {
        type: 'checkboxes',
        name: 'sfExperiences',
        // Choices patched in later when main module wakes up
        choices: [],
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
    self.on('apostrophe:modulesReady', 'setChoices');

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
      const linkToExperienceField = _.find(self.schema, {
        name: 'linkToExperience'
      });

      if (linkToExperienceField && !(linkToExperienceField.choices && linkToExperienceField.choices.length)) {
        linkToExperienceField.choices = [
          {
            label: 'Unspecified',
            value: ''
          }
        ].concat(_.map(salesforceExp.experiences, function (exp) {
          return {
            label: exp.label,
            value: exp.name
          };
        }));
      }
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
