const passportSaml = require('passport-saml');
const fs = require('fs');
const _ = require('lodash');
const psm = require('passport-saml-metadata');
const path = require('path');

module.exports = {
  label: 'Salesforce Connect',
  extend: 'apostrophe-widgets',
  contextualOnly: true,
  beforeConstruct: function (self, options) {
    // TODO: Set default attribute mapping?
    options.attributeMapping = options.attributeMapping || {};
  },

  construct: function (self, options) {
    let sfUser;

    self.enablePassportStrategy = function () {
      // This is the Salesforce identity provider's metadata, not ours.
      const confFolder = _.last(self.__meta.chain).dirname;
      const reader = new psm.MetadataReader(fs.readFileSync(`${confFolder}/salesforce-metadata.xml`, 'utf8'));
      let config = psm.toPassportConfig(reader);

      config.decryptionCert = fs.readFileSync(`${confFolder}/connect.cer`, 'utf8');
      config.decryptionPvk = fs.readFileSync(`${confFolder}/connect.key`, 'utf8');
      // Match signatureAlgorithm to how certs were made (see README).
      config.signatureAlgorithm = 'sha256';
      // Issuer must be unique to this site. It's common practice to use the
      // URL of our metadata (which doesn't have to be published like this, but
      // it's standard practice and doesn't hurt anything).
      config.issuer = self.getIssuer();
      // Without this it looks for emailAddress, which is not available
      config.identifierFormat = null;
      // passport-saml uses entryPoint, not identityProviderUrl
      config.entryPoint = config.identityProviderUrl;
      config.callbackUrl = options.callbackUrl || (`${options.apos.options.baseUrl}/auth/saml/login/callback`);

      // Add our extra passportSamlOptions into our config object
      config = self.addPassportSamlOptions(config);

      const strategy = new passportSaml.Strategy(config, self.profileCallback);

      self.strategy = strategy;

      self.apos.login.passport.use(strategy);
    };

    self.generateMetadata = function () {
      const confFolder = _.last(self.__meta.chain).dirname;
      const metadata = self.strategy.generateServiceProviderMetadata(fs.readFileSync(`${confFolder}/connect.cer`, 'utf8'));
      fs.writeFileSync(`${self.apos.rootDir}/public/${path.basename(self.getIssuer())}`, metadata);
    };

    self.getIssuer = function () {
      return options.issuer || (`${options.apos.options.baseUrl}/saml-metadata.xml`);
    };

    self.getLoginPath = function () {
      if (options.loginUrl) {
        const loginUrl = new URL(options.loginUrl);
        return loginUrl.pathname;
      } else {
        return '/auth/saml/login';
      }
    };

    self.getCallbackPath = function () {
      if (options.callbackUrl) {
        const callbackUrl = new URL(options.callbackUrl);

        return callbackUrl.pathname;
      } else {
        return '/auth/saml/login/callback';
      }
    };

    self.addPassportSamlOptions = function (config) {
      // Merge the base configuration options into the
      // passportSamlOptionsObject.
      // Note: If you have the same attribute in both objects, the base
      // configuration option will overwrite the passportSamlOptions
      // attribute.
      return Object.assign({}, options.passportSamlOptions, config);
    };

    self.addRoutes = function () {
      self.apos.app.get(self.getLoginPath(),
        self.apos.login.passport.authenticate('saml', {
          failureRedirect: self.getLoginPath()
        }),
        function (req, res) {
          // REVIEW: Make failure page an option?
          res.redirect('/');
        }
      );

      let user;

      self.apos.app.post(self.getCallbackPath(),
        function (req, res, next) {
          user = req.user;

          return self.apos.login.passport.authenticate(
            'saml',
            {
              // REVIEW: Make failure page an option?
              failureRedirect: '/',
              failureFlash: true
            }
          )(req, res, next);
        },
        //
        function (req, res) {
          req.sfUser = Object.assign({}, req.user);
          req.user = Object.assign({}, user);
          user = undefined;

          // TODO: What to do after callback?
          // Put the new req.user into req.sfUser?
          // Put previously stored req.user back on req.user?
          return self.apos.login.afterLogin(req, res);
        }
      );

      self.apos.on('csrfExceptions', function (list) {
        list.push(self.getCallbackPath());
      });

      // REVIEW: We probably no longer need this since we're not logging in.
      // self.apos.app.get('/logout',
      //   function (req, res) {
      //     req.logout();
      //     res.redirect('/');
      //   }
      // );
    };

    self.profileCallback = function (profile, callback) {
      console.log('🐒', profile);
      sfUser = profile;
      // const req = self.apos.tasks.getReq();

      // Returning (no error, no user) since we're not logging in a user.
      return callback(null, null);
    };

    // TODO: Remove this? No longer needed in `self.profileCallback`.
    // self.adjustProfile = function (profile) {
    //   const finalProfile = {};
    //   _.each(self.options.attributeMapping, function (val, key) {
    //     finalProfile[val] = profile[key];
    //   });
    //   finalProfile.firstName = finalProfile.firstName || '';
    //   finalProfile.lastName = finalProfile.lastName || finalProfile.username.replace(/@.*$/, '');
    //   finalProfile.displayName = finalProfile.displayName || finalProfile.username;
    //   finalProfile.title = finalProfile.title || (`${finalProfile.firstName} ${finalProfile.lastName}`).trim();

    //   return finalProfile;
    // };

    const superLoad = self.load;
    self.load = function (req, widgets, callback) {
      return superLoad(req, widgets, function (err) {
        if (err) { return callback(err); }

        if (sfUser) {
          widgets.forEach(function (widget) {
            widget._sfUser = sfUser;
          });

          sfUser = undefined;
        }

        return callback(null);
      });
    };
  },

  // Build up our options dynamically before the parent class sees them.
  afterConstruct: function (self, callback) {
    self.enablePassportStrategy();
    self.generateMetadata();
    self.addRoutes();
    return callback(null);
  }
};
