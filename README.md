# apostrophe-salesforce-experience

This module allows you to customize an ApostropheCMS website content experience for visitors based on their Salesforce profiles in a specific Salesforce instance. The developer will write [SOQL queries](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql.htm) to establish a set of "experiences," or Salesforce profiles. Website editors can then set specific widgets, pages, and pieces to display for a given set of those experiences.

It is important to note that "experiences" can map to anything at all in Salesforce. It depends entirely on the SOQL queries you choose to use.

Pages and pieces are set to match experiences in their settings modals. Widgets are set to match experiences with a drop-down multi-select field in their contextual UI.

**Note:** This module does *not* enable logging the user into the Apostrophe application as an Apostrophe user. It sets information about them in their active session, which is used to customize their Apostrophe experience. If you are looking to log the user into the Apostrophe site with a Salesforce SAML SSO, you should probably look at [apostrophe-saml](https://github.com/apostrophecms/apostrophe-saml).

## Usage
- Requires Node 8+ due to use of async/await.

In addition to project-level configuration of SOQL queries and credentials, there are additional requirements for the SAML connection. Salesforce has specific configuration requirements to set up SSO access. [See their documentation section for all the steps for this.](https://developer.salesforce.com/docs/atlas.en-us.externalidentityImplGuide.meta/externalidentityImplGuide/external_identity_provide_sso_for_web_apps.htm)

Once you have the metadata XML file from the connected app, download that, rename it as `salesforce-metadata.xml`, and place it in the `lib/modules/apostrophe-salesforce-connect` directory.

You will also need to create a TLS certificate for the SAML connection. This can be a self-signed certificate.  These are used for SAML assertions, they are not involved in HTTPS. Usually a self-signed certificate will do. The files must be in the `apostrophe-salesforce-connect` directory and be named `connect.cer` and `connect.key`.

From the project root, you can use the following openssl command:

```
openssl req -new -x509 -days 365 -nodes -sha256 -out lib/modules/apostrophe-salesforce-connect/connect.cer -keyout lib/modules/apostrophe-salesforce-connect/connect.key -days 3650
```

### Project configuration

The bundle module requires several project-level configurations and also allows for additional optional project-level configurations to enable additional features. A private repository can be a reasonable place for these settings, but if you do not wish some of these settings to be present in version control or you want them to vary from server to server, [you can use the `data/local.js` file](https://docs.apostrophecms.org/apostrophe/tutorials/intermediate/deployment#minifying-assets). You can also use environment variables, via `process.env.YOUR_ENV_VAR_NAME`. The queries and other non-sensitive information could instead be configured in the `app.js` module declaration.

The `adminUsername`, `adminPasswordAndToken`, and `adminLoginUrl` are all required. These should relate to an admin-level user in your Salesforce instance and are used to make the initial SOQL query and subsequent user-specific queries via OAuth.

`adminPasswordAndToken` is made up of both the user's password and their security token, in that order, as a single string. [Salesforce has documentation on getting this token.](https://help.salesforce.com/articleView?id=user_security_token.htm&type=5) For example, with a password of `password` and token of `0a1b2c3d4e5f`, the final value would be `password0a1b2c3d4e5f`.

If the `redirectionUrl` is configured, after end users sign in on the Salesforce page, they will be redirected to the `redirectionUrl` value rather than back to the ApostropheCMS website.

`experienceQueries` is an array of objects with both general and user-specific queries. You may have multiple such configurations in order to build out varying user experiences. For example, one query set might capture "experiences" for Salesforce "Groups" the person is in, then another might create additional "experience" values for their related "Products." These can exist together to allow more options and content possibilities.

All properties of the `experienceQueries` object are required. Within each `experienceQueries` object, the options are:

- `soql`: The general query to capture names and unique IDs for "experiences."
- `labelField`: The field in the `soql` query that returns a human-readable label for the experience.
- `idField`: The field in the `soql` query that returns a unique ID value for the experience.
- `userSoql`: An SOQL query that requests information about a single user, by their account ID, with returned values that match the `labelField` and `idField` values. This should include the string `:AccountId`, which will be replaced with the actual user's account ID. The query should be similar to `soql`, except that it must return only the labels and unique values for those experiences that apply to that specified user.
- `userLabelField`: The field in the `userSoql` query that returns a value to be used as a label for the user's experience. The resulting value would likely match that from `labelField`.
- `userIdField`: The field in the `userSoql` query that returns an ID that matches one from the general query's `idField`. This is used to match the individual account with one of the available "experiences."

You may also customize the URL that visitors will use to initialize the Salesforce SSO login. Configure the `loginUrl` property for this. By default it will use `/auth/saml/login`. Similarly, you may customize the URL that Salesforce will post the SAML login results to. Set the `callbackUrl` for this, otherwise it defaults to `/auth/saml/login/callback`. You will need to configure your Salesforce connected app with this callback URL.

Example querying [Salesforce Chatter group](https://help.salesforce.com/articleView?id=user_groups.htm&type=5) membership:
```
module.exports = {
  modules: {
    'apostrophe-salesforce-experience': {
      adminUsername: 'admin@organization.org',
      adminPasswordAndToken: 'password0a1b2c3d4e5f',
      adminLoginUrl: 'https://example.my.salesforce.com/',
      redirectionUrl: 'https://example.lightning.force.com/lightning/page/home',
      experienceQueries: [
        {
          // General query and field names
          soql: 'SELECT Name, Id FROM CollaborationGroup',
          labelField: 'Name',
          idField: 'Id',
          // User query and field names
          userSoql: 'SELECT Name, Id FROM CollaborationGroup WHERE Id IN (SELECT CollaborationGroupId FROM CollaborationGroupMember WHERE MemberId = :AccountId)',
          userLabelField: 'Name',
          userIdField: 'Id'
        }
      ]
      // loginUrl: '/another/login', // Optional
      // callbackUrl: '/another/callback' // Optional
    }
  }
};
```

### User flow

Once configured, a Salesforce account holder **with access through the connected app you created for the SAML connection** can visit the login url (`loginUrl`), which should send them to the Salesforce login page. Once they successfully sign in, they will be redirected back to the website, or to whatever `redirectionUrl` you set. The website will then be able to access their Salesforce profile, and they will also be logged into Salesforce, which is useful if you choose to redirect them there. By visiting the `/auth/saml/logout` URL of the Apostrophe application they will be disconnected from the app as well as logged out from Salesforce.

With the visitor's "experiences" information now stored in their session, the website content presentation should respond to this information as expected.

### Other notes:

- A user may match multiple Salesforce experiences, in which case they will see content that applies to all of their matched experiences.

## Using the OAuth connection project-level

The OAuth connection to Salesforce is available to use project-level if you want to make other queries to the Salesforce instance. `self.connect` in the `apostrophe-salesforce-experience` module is an asynchronous function (`await` it) that returns the saleforce connection. With that you can use the `.query()` method on the connection to make SOQL queries. See the [jsForce documentation for more on this](https://jsforce.github.io/document/#query).