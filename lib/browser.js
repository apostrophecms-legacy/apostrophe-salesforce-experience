module.exports = function (self, options) {

  self.pushAsset('script', 'always', { when: 'always' });

  self.on('apostrophe-pages:beforeSend', 'getExperienceChoicesBeforeSend', async function(req) {
    if (req.scene === 'user') {
      req.sfExperienceChoices = await self.getExperienceChoices();
    }
    self.pushCreateSingleton(req, 'always');
  });

  self.getCreateSingletonOptions = function (req) {
    const result = {
      userExperiences: req.sfUserExperiences
    };
    if (req.sfExperienceChoices) {
      result.experienceChoices = sfExperienceChoices;
    }
    return result;
  };

};
