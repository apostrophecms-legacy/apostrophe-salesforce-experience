apos.define('apostrophe-areas-editor', {
  construct: function(self, options) {
    var superEnhanceWidgetControls = self.enhanceWidgetControls;
    self.enhanceWidgetControls = function($widget) {
      superEnhanceWidgetControls($widget);
      self.updatePersonaChoices($widget, apos.areas.getWidgetData($widget).personas || []);
    };
    var superRegisterClickHandlers = self.registerClickHandlers;
    self.registerClickHandlers = function() {
      superRegisterClickHandlers();
      self.$el.on('change', '[name="personas"]', self.startAutosavingHandler(self.changedPersona));
    };
    self.changedPersona = function(event) {
      var $el = $(event.target);
      var $widget = $el.closest('[data-apos-widget]');
      var persona = $el.val();
      var data = apos.areas.getWidgetData($widget);
      var matches;
      var operator;
      if (persona === 'none') {
        data.personas = [ 'none' ];
      } else if (persona === '') {
        data.personas = [];
      } else if (persona.match(/^[+-]/)) {
        matches = persona.match(/^([+-]) (.*)$/);
        operator = matches[1];
        persona = matches[2];
        if (operator === '+') {
          data.personas = (data.personas || []).concat([ persona ]);
        } else if (operator === '-') {
          data.personas = _.without(data.personas || [], persona);
        }
      } else {
        data.personas = [ persona ];
      }
      apos.areas.setWidgetData($widget, data);
      self.updatePersonaChoices($widget, data.personas);
      return false;
    };
    // The dropdown acts as a multiple selector, biased toward
    // the more common use case where only one choice is made.
    // Until you make a choice it looks like a single-select situation.
    // The multiple-select capability can be seen when you pull it
    // down again.
    //
    // The special choices "universal" (empty array) and
    // "no persona" (the string `none`) are handled specially.
    self.updatePersonaChoices = function($widget, selected) {
      var $controls = $widget.findSafe('[data-apos-widget-controls]', '[data-apos-area]');
      var $select = $controls.find('[name="personas"]:first');
      if (!self.choices) {
        self.captureLabelsAndChoices($select);
      }
      $select.html('');
      if (selected.length === 0) {
        add('', '');
        add('', 'none');
        addChoices();
      } else {
        if (selected[0] === 'none') {
          add('', 'none');
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
          add('', 'none');
        }
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
        if (value && (value !== 'none')) {
          self.choices.push(value);
        }
      });
    };
  }
});
