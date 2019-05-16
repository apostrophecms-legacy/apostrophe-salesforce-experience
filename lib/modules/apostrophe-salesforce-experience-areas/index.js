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
          label: 'None',
          value: 'none'
        }
      ].concat(_.map(salesforceExp.experiences, function(experience) {
        return {
          label: experience.label,
          value: experience.value
        };
      }));
      groups.push({
        classes: 'apos-widget-experience',
        // Custom javascript will restructure this to do some multiple select tricks
        controls: [
          {
            name: 'sfExperiences',
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
      const experiences = req.experiences;
      if (!experiences) return true;

      if (!(widget.experiences && widget.experiences.length)) {
        return true;
      }
      if (_.intersection(widget.experiences, experiences).length > 0) {
        return true;
      }
    };
    self.apos.define('apostrophe-cursor', require('./lib/cursor.js'));
  }
};
