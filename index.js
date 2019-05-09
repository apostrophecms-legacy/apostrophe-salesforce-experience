// const _ = require('lodash');
const { getExperiences } = require('./query-salesforce');

module.exports = {
  name: 'apostrophe-salesforce-experience',
  moogBundle: {
    directory: 'lib/modules',
    modules: [
      'apostrophe-salesforce-connect',
      'apostrophe-salesforce-connect-widgets',
      'apostrophe-salesforce-experience-areas',
      'apostrophe-salesforce-experience-widgets'
      // 'apostrophe-salesforce-experience-custom-pages',
      // 'apostrophe-salesforce-experience-pages',
      // 'apostrophe-salesforce-experience-doc-type-manager',
      // 'apostrophe-salesforce-experience-pieces'
    ]
  },

  afterConstruct: function (self) {
    // self.composePersonas();
    // self.addMultiplePersonasMigration();
  },

  construct: async function (self, options) {
    // self.modulesReady = function () {
    //   var workflow = self.apos.modules['apostrophe-workflow'];
    //   var inferredAll = false;
    //   if (!workflow) {
    //     return;
    //   }
    //   _.each(self.personas, function (persona) {
    //     if (!persona.prefixes) {
    //       persona.prefixes = {};
    //       self.apos.utils.warn('Warning: workflow module is in use and the prefixes option is not configured for the ' + persona.name + ' persona, falling back to ' + persona.prefix + ' which will not be translated');
    //       inferredAll = true;
    //     }
    //     _.each(workflow.locales, function (locale, name) {
    //       if (name.match(/-draft$/)) {
    //         return;
    //       }
    //       if (!persona.prefixes[name]) {
    //         persona.prefixes[name] = persona.prefix || ('/' + persona.name);
    //         if (!inferredAll) {
    //           self.apos.utils.warn('Warning: workflow module is in use and the prefixes option for the ' + persona.name + ' persona has no setting for the ' + name + ' locale, falling back to ' + persona.prefix + ' which will not be translated');
    //         }
    //       }
    //     });
    //   });
    // };

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

    if (options.experiencesQuery) {
      let experiences = await getExperiences(options);

      experiences = experiences.map(exp => {
        return {
          label: exp[options.experiencesLabelField],
          value: exp[options.experiencesIdField]
        };
      });

      self.experiences = experiences;
    }
  }
};
