const assert = require('assert');
const fs = require('fs');

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
        'apostrophe-salesforce-experience': {},
        'apostrophe-salesforce-connect': {},
        'apostrophe-salesforce-connect-widgets': {}
      },
      afterInit: function (callback) {
        const sfe = apos.modules['apostrophe-salesforce-experience'];
        const sfc = apos.modules['apostrophe-salesforce-connect'];
        const sfcw = apos.modules['apostrophe-salesforce-connect-widgets'];

        assert(sfe.__meta.name === 'apostrophe-salesforce-experience');
        assert(fs.existsSync(`${__dirname}/public/saml-metadata.xml`));
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

  it('should have the basic experiences', async function () {
    const sfe = apos.modules['apostrophe-salesforce-experience'];
    const experiences = await sfe.getExperienceChoices();

    assert(experiences.length === 2);
    assert(experiences[0].label === 'Universal');
    assert(experiences[1].label === 'No Experience');
  });
});
