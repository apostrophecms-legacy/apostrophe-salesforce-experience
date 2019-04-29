# apostrophe-salesforce-experience
Not ready for use in any sense.

## TODOs
- [ ] Set up moogBundle
- [ ] Use customizing areas and widgets code similar to apos-personas.
- [ ] Create widgets module to allow client-side Salesforce login and data retrieval (jsForce or SAML)
- [ ] Switch to SAML for authentication.


## Options in `data/local.js`:

```
modules.export = {
  apostrophe-salesforce-experience: {
    clientId: '[ your Salesforce OAuth2 ClientID is here ]',
    redirectUri: '[ your Salesforce registered redirect URI is here ]'
    loginUrl: '[ your Salesforce login URL is here ]'
  }
};
```