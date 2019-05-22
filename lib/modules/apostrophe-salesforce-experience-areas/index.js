const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-areas',
  construct: function(self, options) {
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
