const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-areas',
  construct: function(self, options) {
    const superWidgetControlGroups = self.widgetControlGroups;
    self.widgetControlGroups = function(req, widget, options) {
      const groups = superWidgetControlGroups(req, widget, options);
      // console.log('in areas', salesforceExp.experiences);
      if (!widget) {
        return groups;
      }
      const choices = [
        {
          label: 'Loading...',
          value: ''
        }
      ];
      groups.push({
        classes: 'apos-widget-persona',
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
      const experiences = req.session.sfUserExperiences;
      if (!experiences) {
        return true;
      }
      console.log('widget: ', widget.experiences);
      console.log('experience(s): ', experiences);
      if (!(widget.sfExperiences && widget.sfExperiences.length)) {
        return true;
      }
      if (_.intersection(widget.sfExperiences, experiences).length > 0) {
        return true;
      }
    };
    self.apos.define('apostrophe-cursor', require('./lib/cursor.js'));
  }
};
