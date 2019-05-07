const passportSaml = require('passport-saml');
const fs = require('fs');
const _ = require('lodash');
const psm = require('passport-saml-metadata');
const path = require('path');
const { connectSalesforce } = require('./query-salesforce');

module.exports = {
  extend: 'apostrophe-module',

  // Build up our options dynamically before the parent class sees them.
  afterConstruct: function (self, callback) {
    self.enablePassportStrategy();
    self.generateMetadata();
    self.addRoutes();
    return callback(null);
  },

  construct: function (self, options) {
    let portalUrl;

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

    self.getPortalUrl = function () {
      return portalUrl;
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
      self.apos.app.get(
        self.getLoginPath(),
        self.apos.login.passport.authenticate('saml'),
        function (req, res) {
          // TODO: Is this needed?
          res.redirect('/');
        }
      );

      self.apos.app.post(
        self.getCallbackPath(),
        function (req, res, next) {
          return self.apos.login.passport.authenticate(
            'saml',
            async function (err, user, info, status) {
              if (err) {
                return next(err);
              }

              if (!user) return next('No user authenticated.');

              req.session.sfUser = await connectSalesforce(user, options) || null;

              if (req.session.sfUser.issuer) {
                portalUrl = req.session.sfUser.issuer._;
              }

              if (options.redirectionUrl) {
                // TODO: Document.
                return res.redirect(options.redirectionUrl);
              }
              return res.redirect('/');
            }
          )(req, res, next);
        }
      );

      self.apos.app.get(
        '/auth/saml/logout',
        function (req, res) {
          req.session.sfUser = undefined;

          const portalBaseUrl = self.getPortalUrl();
          if (portalBaseUrl) {
            return res.redirect(`${portalBaseUrl}/secur/logout.jsp`);
          }

          // TODO: Do something else, though this should never happen if the
          // logout link is visible.
          return res.redirect('/');
        }
      );

      self.apos.on('csrfExceptions', function (list) {
        list.push(self.getCallbackPath());
      });
    };

    self.profileCallback = function (profile, callback) {
      // Returning (no error, user) since we're not logging in a user.
      return callback(null, profile);
    };
  }
};
