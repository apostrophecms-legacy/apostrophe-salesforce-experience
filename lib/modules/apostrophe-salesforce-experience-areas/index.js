const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-areas',
  construct: function(self, options) {
    const superWidgetControlGroups = self.widgetControlGroups;
    self.widgetControlGroups = function(req, widget, options) {
      const salesforceExp = self.apos.modules['apostrophe-salesforce-experience'];
      const groups = superWidgetControlGroups(req, widget, options);

      if (!widget) {
        return groups;
      }
      const choices = [
        {
          label: 'Universal',
          value: ''
        },
        {
          label: 'No Persona',
          value: 'none'
        }
      ].concat(_.map(salesforceExp.experiences, function(experience) {
        return {
          label: experience.label || experience.name,
          value: experience.name
        };
      }));
      groups.push({
        classes: 'apos-widget-persona',
        // Custom javascript will restructure this to do some multiple select tricks
        controls: [
          {
            name: 'salesforce-experiences',
            type: 'select',
            choices: choices
          }
        ]
      });
      return groups;
    };
    self.addHelpers({
      inExperience: function(widget) {
        return self.inExperience(self.apos.templates.contextReq, widget);
      }
    });

    self.inExperience = function(req, widget) {
      const experience = req.experience;

      if (!req.experience) {
        return true;
      }
      if (!(widget.experiences && widget.experiences.length)) {
        return true;
      }
      if (_.includes(widget.experiences, experience)) {
        return true;
      }
    };
    self.apos.define('apostrophe-cursor', require('./lib/cursor.js'));
  }
};
