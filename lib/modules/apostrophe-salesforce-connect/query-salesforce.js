const jsforce = require('jsforce');

async function connect (options) {
  const conn = new jsforce.Connection({
    loginUrl: options.adminLoginUrl || 'https://client-domain.my.salesforce.com'
  });
  await conn.login(options.adminUsername || 'USERNAME', options.adminPasswordAndToken || 'PASSWORD');

  return conn;
}

async function connectSalesforce (user, options) {
  try {
    const conn = await connect(options);

    const data = await conn.query(
      `SELECT user.FirstName, user.LastName, user.CommunityNickname FROM user WHERE user.username ='${user.username}'`
    );

    user.sfId = data.AccountId;
    user.name = (data.totalSize > 0 && data.records[0].CommunityNickname)
      ? data.records[0].CommunityNickname
      : (data.totalSize > 0 && data.records[0].FirstName && data.records[0].LastName)
        ? `${data.records[0].FirstName} ${data.records[0].LastName}`
        : null;
  } catch (err) {
    console.error('Salesforce user query error: ', err);
  }

  return user;
}

async function getExperiences (options) {
  const conn = await connect(options);

  const experiences = await conn.query(options.experiencesQuery);

  return experiences.records;
}

async function getUserExperience(options) {
  const conn = await connect(options);

  const experience = await conn.query(options.userExperienceQuery);

  return experience.records;
}

module.exports = {
  connectSalesforce,
  getExperiences,
  getUserExperience
};
