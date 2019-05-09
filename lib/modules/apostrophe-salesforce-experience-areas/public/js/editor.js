apos.define('apostrophe-areas-editor', {
  construct: function(self, options) {
    var superEnhanceWidgetControls = self.enhanceWidgetControls;

    self.enhanceWidgetControls = function($widget) {
      superEnhanceWidgetControls($widget);
      self.updateExpChoices($widget, apos.areas.getWidgetData($widget).experiences || []);
    };

    var superRegisterClickHandlers = self.registerClickHandlers;

    self.registerClickHandlers = function() {
      superRegisterClickHandlers();
      self.$el.on('change', '[name="experiences"]', self.startAutosavingHandler(self.chancedExperience));
    };

    self.chancedExperience = function(event) {
      var $el = $(event.target);
      var $widget = $el.closest('[data-apos-widget]');
      var exp = $el.val();
      var data = apos.areas.getWidgetData($widget);
      var matches;
      var operator;
      if (exp === '') {
        data.experiences = [];
      } else if (exp.match(/^[+-]/)) {
        matches = exp.match(/^([+-]) (.*)$/);
        operator = matches[1];
        exp = matches[2];
        if (operator === '+') {
          data.experiences = (data.experiences || []).concat([ exp ]);
        } else if (operator === '-') {
          data.experiences = _.without(data.experiences || [], exp);
        }
      } else {
        data.experiences = [ exp ];
      }
      apos.areas.setWidgetData($widget, data);
      self.updateExpChoices($widget, data.experiences);
      return false;
    };

    // The dropdown acts as a multiple selector, biased toward
    // the more common use case where only one choice is made.
    // Until you make a choice it looks like a single-select situation.
    // The multiple-select capability can be seen when you pull it
    // down again.
    //
    // The special choice "universal" is handled specially.
    //
    // If current experience context would make a widget not to be displayed
    // the widget will be displayed translucent for the author
    self.updateExpChoices = function($widget, selected) {
      if (selected.length > 0 && selected[0] !== '__current' &&
        selected.indexOf(apos.personas.currentPersona) < 0) {
        $widget.addClass('apos-peek');
      } else {
        $widget.removeClass('apos-peek');
      }
      var $controls = $widget.findSafe('[data-apos-widget-controls]', '[data-apos-area]');
      var $select = $controls.find('[name="experiences"]:first');
      if (!self.choices) {
        self.captureLabelsAndChoices($select);
      }
      $select.html('');
      if (selected.length === 0) {
        add('', '');
        addChoices();
      } else {
        add('__', 'current', _.map(selected, function(value) {
          return self.labels[value];
        }).join(', '));
        _.each(self.choices, function(choice) {
          if (_.includes(selected, choice)) {
            add('- ', choice, '✓ ' + self.labels[choice]);
          } else {
            add('+ ', choice, self.labels[choice]);
          }
        });
        add('', '');
      }
      $select.selectedIndex = 0;
      function addChoices() {
        _.each(self.choices, function(choice) {
          return add('', choice);
        });
      }
      function add(prefix, value, label) {
        var $option = $('<option></option>');
        $option.attr('value', prefix + value);
        $option.text(label || self.labels[value]);
        $select.append($option);
      }
    };
    self.captureLabelsAndChoices = function($select) {
      self.choices = [];
      self.labels = {};
      $select.find('option').each(function() {
        var value = $(this).attr('value');
        self.labels[value] = $(this).text();
        if (value) {
          self.choices.push(value);
        }
      });
    };
  }
});
