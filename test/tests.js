const assert = require('assert');

describe('Salesforce Experience module', function () {

  let apos;

  this.timeout(3000);

  after(function (done) {
    require('apostrophe/test-lib/util').destroy(apos, done);
  });

  // EXISTENCE
  it('should be a property of the apos object', function (done) {
    apos = require('apostrophe')({
      testModule: true,
      baseUrl: 'http://localhost:4000', // Make 3000?
      modules: {
        'apostrophe-express': {
          port: 4242,
          session: {
            secret: 'xyz'
          }
        },
        'apostrophe-salesforce-experience': {},
        'apostrophe-salesforce-connect': {
          // A general query to get "experiences"
          experiencesQuery: 'SELECT Name, Id FROM CollaborationGroup',
          experiencesLabelField: 'Name',
          experiencesIdField: 'Id',
          // A query to get a specific user's "experience"
          userExperienceQuery: 'SELECT CollaborationGroupId FROM CollaborationGroupMember WHERE MemberId =',
          userExperienceId: 'CollaborationGroupId'
        },
        'apostrophe-salesforce-connect-widgets': {}
      },
      afterInit: function (callback) {
        const sfe = apos.modules['apostrophe-salesforce-experience'];
        assert(sfe.__meta.name === 'apostrophe-salesforce-experience');

        return callback(null);
      },
      afterListen: function (err) {
        assert(!err);
        done();
      }
    });
  });
});
