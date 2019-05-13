apos.define('apostrophe-salesforce-experience', {
  construct: function (self, options) {
    console.log('HEYYYYYYY');
    self.options = options;
    // self.currentPersona = options.currentExp;
    apos.sfExp = self;
  }
});
