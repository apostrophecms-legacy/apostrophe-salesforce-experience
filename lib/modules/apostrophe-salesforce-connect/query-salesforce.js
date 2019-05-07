const jsforce = require('jsforce');

async function connectSalesforce (user, options) {
  try {
    const conn = new jsforce.Connection({
      loginUrl: options.adminLoginUrl || 'https://client-domain.my.salesforce.com'
    });
    await conn.login(options.adminUsername || 'USERNAME', options.adminPasswordAndToken || 'PASSWORD');

    const data = await conn.query(`SELECT Id, Name FROM Account WHERE Username ='${user.username}'`);

    console.log('📯', data);
  } catch (err) {
    console.error('🚩', err);
  }

  return user;
};

module.exports = {
  connectSalesforce
};
