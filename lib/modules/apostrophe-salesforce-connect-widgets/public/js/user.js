var connect = window.apos.modules['apostrophe-salesforce-connect-widgets'];

apos.define('apostrophe-salesforce-connect-widgets', {
  extend: 'apostrophe-widgets',
  construct: function (self, options) {
    self.play = function ($widget, data, options) {
      var $button = $widget.find('[data-apos-salesforce-connect]');

      $button.on('click', function () {
        //
      });
    };
  }
});
