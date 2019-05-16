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

  afterConstruct: function (self, callback) {
    return self.getExperiences()
      .then(() => {
        return callback(null);
      })
      .catch(err => {
        return callback(err);
      });
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

    self.getExperiences = function () {
      if (options.experiencesQuery) {
        return getExperiences(options)
          .then(experiences => {
            self.experiences = experiences;
          }).catch(function (err) {
            self.apos.utils.warn('⚠️ Salesforce identities query error: ', err);
          });
      }

      return null;
    };
  }
};
