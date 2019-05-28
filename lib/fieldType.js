module.exports = function(self, options) {
  self.apos.schemas.addFieldType({
    name: 'sf-experiences',
    converters: {
      string: async function(req, data, name, object, field, callback) {
        try { 
          const input = self.apos.launder.strings(data[name]);
          const choices = await self.getExperienceChoices();
          object[name] = _.intersection(input, _.map(choices, choice => choice.value));
          return callback(null);
        } catch (e) {
          return callback(e);
        }
      },
      form: 'string'
    },
    // Always contextual, won't be used
    partial: 'sf-experiences-field'
  });
};

