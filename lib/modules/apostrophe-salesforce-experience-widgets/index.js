const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-widgets',
  beforeConstruct: function (self, options) {
    options.addFields = [
      {
        type: 'checkboxes',
        name: 'salesforce-experiences',
        // Choices patched in later when salesforce-connect module wakes up
        choices: [],
        contextual: true
      }
    ].concat(options.addFields || []);
    options.arrangeFields = [
      {
        name: 'salesforce-experiences',
        label: 'Salesforce Experience',
        fields: ['salesforce-experiences']
      }
    ].concat(options.arrangeFields || []);
  },
  construct: function (self, options) {
    self.modulesReady = function () {
      self.setChoices();
    };
    self.setChoices = function () {
      const salesforceExp = self.apos.modules['apostrophe-salesforce-experience'];
      console.log('in widgets', salesforceExp.experiences);
      const experienceField = _.find(self.schema, {
        name: 'salesforce-experiences'
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
            value: exp.name
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
      console.log('😎', widget);
      if (!self.apos.areas.inExperience(contextReq, widget)) {
        return superGetWidgetClasses(widget);
      }

      return superGetWidgetClasses(widget).concat(['apos-area-widget-in-exp']);
    };

    // If a widget has a linkToExperience field in its schema, and
    // also a join field that joins withType apostrophe-page,
    // update the _url based on linkToExperience. Otherwise leave it
    // alone

    const superLoad = self.load;
    self.load = function (req, widgets, callback) {
      return superLoad(req, widgets, function (err) {
        if (err) {
          return callback(err);
        }
        if (!_.find(self.schema, { name: 'linkToExperience' })) {
          return callback(null);
        }
        const join = _.find(self.schema, function (field) {
          return field.type.match(/^join/);
        });
        if (!join) {
          console.error('schema has linkToExperience, but no join. Must be at same level.');
          return callback(null);
        }
        _.each(widgets, function (widget) {
          if (!widget.linkToExperience) {
            return;
          }
          if (widget[join.name]) {
            fixExperience(widget, join.name, widget[join.name]);
          }
          function fixExperience(context, contextKey, object) {
            const personas = self.apos.modules['apostrophe-personas'];
            _.each(object, function (val, key) {
              if (key === '_url') {
                // Shallow clone because there could be two joins
                // to the same page; object reuse was fine until now,
                // but they could have different personas and thus
                // the `_url` property needs to differ
                context[contextKey] = _.clone(object);
                context[contextKey][key] = personas.addPrefix(req, widget.linkToExperience, val);
              }
              if ((typeof val) === 'object') {
                fixExperience(object, key, val);
              }
            });
          }
        });
        return callback(null);
      });
    };
  }
};
