const assert = require('assert');
const fs = require('fs');
const _ = require('lodash');

describe('Salesforce Experience module', function () {

  let apos;

  this.timeout(25000);

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
        'apostrophe-salesforce-experience': {
          // Test are written using a real developer instance of Salesforce.
          // adminLoginUrl, adminUsername, and adminPasswordAndToken are in an
          // uncommitted `data/local.js` file for testing. Reach out to us in
          // one of the Apostrophe support channels if you need them.
          // https://apostrophecms.org/support
          // Or even better, set up your own!
          // https://developer.salesforce.com/signup
          experienceQueries: [
            {
              soql: 'SELECT Name, Id FROM CollaborationGroup',
              labelField: 'Name',
              idField: 'Id',
              userSoql: 'SELECT Name, Id FROM CollaborationGroup WHERE Id IN (SELECT CollaborationGroupId FROM CollaborationGroupMember WHERE MemberId = :AccountId)',
              userLabelField: 'Name',
              userIdField: 'Id'
            }
          ]
        },
        'apostrophe-salesforce-connect': {
          test: true
        },
        'apostrophe-salesforce-connect-widgets': {}
      },
      afterInit: function (callback) {
        const sfe = apos.modules['apostrophe-salesforce-experience'];
        const sfc = apos.modules['apostrophe-salesforce-connect'];
        const sfcw = apos.modules['apostrophe-salesforce-connect-widgets'];

        assert(sfe.__meta.name === 'apostrophe-salesforce-experience');
        assert(sfc.__meta.name === 'apostrophe-salesforce-connect');
        assert(sfcw.__meta.name === 'apostrophe-salesforce-connect-widgets');

        return callback(null);
      },
      afterListen: function (err) {
        assert(!err);
        done();
      }
    });
  });

  it('should create metadata', function (done) {
    assert(fs.existsSync(`${__dirname}/public/saml-metadata.xml`));
    done();
  });

  it('should have the basic and returned experiences', async function () {
    const sfe = apos.modules['apostrophe-salesforce-experience'];
    const experiences = await sfe.getExperienceChoices();
    const returnedExp = await sfe.getExperiences();

    assert(experiences.length === 5);
    assert(experiences[0].label === 'Universal');
    assert(experiences[1].label === 'No Experience');
    assert(Array.isArray(returnedExp) && returnedExp.length === 3);
  });

  it('should get the test user\'s experiences', async function () {
    const sfe = apos.modules['apostrophe-salesforce-experience'];
    const testUserId = sfe.options.testUserId;
    const userExp = await sfe.getExperiences(testUserId);

    assert(userExp.length === 2);
    assert((_.find(userExp, {
      label: 'Group One'
    })).value === '0F92E000000EDiiSAG');
    assert((_.find(userExp, {
      label: 'Group Third'
    })).value === '0F92E000000EDrDSAW');
  });
});
