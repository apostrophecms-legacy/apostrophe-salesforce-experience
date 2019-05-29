const _ = require('lodash');

module.exports = {
  name: 'apostrophe-salesforce-experience',
  moogBundle: {
    directory: 'lib/modules',
    modules: [
      'apostrophe-salesforce-connect',
      'apostrophe-salesforce-connect-widgets',
      'apostrophe-salesforce-experience-areas',
      'apostrophe-salesforce-experience-widgets',
      'apostrophe-salesforce-experience-custom-pages',
      'apostrophe-salesforce-experience-doc-type-manager',
      'apostrophe-salesforce-experience-pieces'
    ]
  },

  construct: function (self, options) {
    self.addHelpers({
      experiences: function () {
        return self.experiences;
      }
    });

    // // Should return true if the user is an editor and thus
    // // should bypass the normal restrictions on whether they
    // // can see widgets and pieces for other personas, for
    // // editing purposes. If this definition ("anyone who is
    // // logged in is a potential editor") is not fine-grained
    // // enough for your purposes, override this method at
    // // project level

    self.userIsEditor = function (req) {
      return req.user;
    };

    // self.addMultiplePersonasMigration = function () {
    //   self.apos.migrations.add('addMultiplePersonas', function (callback) {
    //     return self.apos.migrations.eachWidget({}, function (doc, widget, dotPath, callback) {
    //       if (!widget.personas) {
    //         if (widget.persona) {
    //           widget.personas = [widget.persona];
    //         } else {
    //           widget.personas = [];
    //         }
    //         delete widget.persona;
    //         var update = {};
    //         update[dotPath + '.personas'] = widget.personas;
    //         update[dotPath + '.persona'] = null;
    //         return self.apos.docs.db.update({
    //           _id: doc._id
    //         }, { $set: update }, callback);
    //       } else {
    //         return setImmediate(callback);
    //       }
    //     }, callback);
    //   }, { safe: true });
    // };

    // self.apos.define('apostrophe-cursor', require('./lib/cursor.js'));

    self.getExperienceChoices = async function() {
      const choices = [
        {
          label: 'Universal',
          value: ''
        },
        {
          label: 'No Experience',
          value: 'none'
        }
      ].concat(_.map(await self.getExperiences(), function (exp) {
        return {
          label: exp.label,
          value: exp.value
        };
      }));

      return choices;
    };

    require('./lib/browser.js')(self, options);
    require('./lib/fieldType.js')(self, options);
    require('./lib/getExperiences.js')(self, options);
  }
};
