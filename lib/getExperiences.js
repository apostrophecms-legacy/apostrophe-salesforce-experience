const jsforce = require('jsforce');
const { escapeSOQL } = require('escape-soql-and-sosl');

module.exports = function(self, options) {
 
  // Log into salesforce and return a connection object for queries.
  // TODO: integrate some kind of sensible reuse policy here, without
  // changing the API, keeping in mind that introduces the need for
  // retry smarts if the login ends. Connects with the module-level
  // adminLoginUrl, adminUsername and adminPassword options

  self.connect = async function() {
    const conn = new jsforce.Connection({
      loginUrl: self.options.adminLoginUrl || 'https://client-domain.my.salesforce.com'
    });
    await conn.login(self.options.adminUsername || 'USERNAME', self.options.adminPasswordAndToken || 'PASSWORD');

    return conn;
  };

  // Get profile information about the specified user, adding properties
  // to the user object passed in.
  // 
  // At the very least, `sfId` and `name` are added.
  // The CommunityNickname is used by preference otherwise a concatenation
  // of FirstName and LastName.
  //
  // Returns the user object for convenience however note it is modified
  // in place.

  self.completeProfile = async function(user) {
    const conn = await self.connect();

    const data = await conn.query(
      `SELECT user.FirstName, user.LastName, user.CommunityNickname FROM user WHERE user.username ='${escapeSOQL(user.username)}'`
    );

    user.sfId = data.AccountId;
    user.name = (data.totalSize > 0 && data.records[0].CommunityNickname)
      ? data.records[0].CommunityNickname
      : (data.totalSize > 0 && data.records[0].FirstName && data.records[0].LastName)
        ? `${data.records[0].FirstName} ${data.records[0].LastName}`
        : null;
    return user;
  };

  // Returns an array of experiences, each of which is an object with 
  // a `label` property and a `value` property. Queries Salesforce
  // as specified by the `experienceQueries` option of the module, which
  // must be an array of objects with `userSoql`, `soql`, `labelField` and `idField`
  // properties.
  //
  // The given SOQL query is executed and the properties of the result
  // matching labelField and idField are used to populate the experience
  // objects. Hint: idField and labelField can be the same if there
  // is no other unique identifier available beyond string label.
  //
  // If `username` is specified, `userSoql` is used and the username
  // is substituted into the query where `:username` appears in it.
  //
  // Appropriate escaping is performed.
 
  self.getExperiences = async function(username) {
    const conn = await self.connect();

    let experiences = [];
    for (const query of self.options.experienceQueries) {
      let result;
      if (username) {
        result = await conn.query(query.userSoql.replace(':username', escapeSOQL(username)));
      } else {
        result = await conn.query(query.soql);
      }
      experiences = [
        ...experiences,
        ...result.records.map(exp => {
          if (username) {
            return {
              label: exp[query.userLabelField],
              value: exp[query.userIdField]
            }
          } else {
            return {
              label: exp[query.labelField],
              value: exp[query.idField]
            }
          }
        })
      ];
    }
    return experiences;
  };

};
