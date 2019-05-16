const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-widgets',
  beforeConstruct: function (self, options) {
    options.addFields = [
      {
        type: 'checkboxes',
        name: 'sfExperiences',
        // Choices patched in later when salesforce-connect module wakes up
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

    self.modulesReady = function () {
      const salesforceExp = self.apos.modules['apostrophe-salesforce-experience'];

      // TEMP HACK
      const intervalId = setInterval(function () {
        if (salesforceExp.experiences) {
          clearInterval(intervalId);
          // $('#loadingDiv').hide();
          self.setChoices();
        }
      }, 100);
    };
    self.setChoices = function () {
      const salesforceExp = self.apos.modules['apostrophe-salesforce-experience'];

      // console.log('in widgets', salesforceExp.experiences);

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

        // console.log('🇻🇪', experienceField.choices);
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
      // console.log('** Widget **', widget);
      if (!self.apos.areas.inExperience(contextReq, widget)) {
        return superGetWidgetClasses(widget);
      }

      return superGetWidgetClasses(widget).concat(['apos-area-widget-in-exp']);
    };
  }
};
