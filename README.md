# apostrophe-salesforce-experience

## What it is

### Example

## Requirements
- Requires Node 8+ due to use of async/await.
- TODO: Salesforce identity provider XML file, adding it to connect widgts directory as `salesforce-metadata.xml`.
- TODO: Create TLS certificate as `connect.cer` and `connect.key`.

## Project configuration

The bundle module requires several project-level configurations and also allows for additional optional project-level configurations to enable additional features. As with all module configuration, this is best done in the `data/local.js` file as shown below to avoid committing sensitive information to version control. The queries and other non-sensitive information could instead be configured in the `app.js` module declaration.

The `adminUsername`, `adminPasswordAndToken`, and `adminLoginUrl` are all required. These should relate to an admin-level user in your Salesforce instance and are used to make the initial SOQL query and subsequent user-specific queries via OAuth.

`adminPasswordAndToken` is made up of both the user's password and their sercurity token, in that order, as a single string. [Salesforce has documentation on getting this token.](https://help.salesforce.com/articleView?id=user_security_token.htm&type=5) For example, with a password of `password` and token of `0a1b2c3d4e5f`, the final value would be `password0a1b2c3d4e5f`.

If the `redirectionUrl` is configured, after end users sign in on the Salesforce page, they will be redirected to the `redirectionUrl` value rather than back to the ApostropheCMS website.

`experienceQueries` is an array of objects with both general and user-specific queries. You may have multiple such configurations in order to build out varying user experiences. For example, one query set might capture "experiences" for Salesforce "Groups" the person is in, then another might create additional "experience" values for their related "Products." These can exist together to allow more options and content possibilities.

All properties of the `experienceQueries` object are required. Within each `experienceQueries` object, the options are:

- `soql`: The general query to capture names and unique IDs for "experiences."
- `labelField`: The field in the `soql` query that returns a human-readable label for the experience.
- `idField`: The field in the `soql` query that returns a unique ID value for the experience.
- `userSoql`: An SOQL query that requests information about a specific user, by their account ID, with returned values that match the `labelField` and `idField` values. This should include the string `:AccountId`, which will be replaced with the actual user's account ID.
- `userLabelField`: The field in the `userSoql` query that returns a value to be used as a label for the user's experience. The resulting value would likely match that from `labelField`.
- `userIdField`: The field in the `userSoql` query that returns an ID that matches one from the general query's `idField`. This is used to match the individual account with one of the available "experiences."

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
    }
  }
};
```
