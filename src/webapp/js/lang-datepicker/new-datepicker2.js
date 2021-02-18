var default_opts = {
  initialValue : false,
  responsive : true,
  observer: true,
  calendar : {
    persian : {
      locale : "fa"
    },
    gregorian :{
      locale : "fa"
    }
  },
  format: 'DD/MM/YYYY',
  toolbox : {
    submitButton :{
      enabled : true
    },
    calendarSwitch :{
      enabled : false
    },
    todayButton : {
      enabled : true
    }
  },
  timePicker : {
      enabled: false,
      step: 1,
      hour: {
        enabled: true,
        step: 1
      },
      minute: {
          enabled: true,
          step: 1
        },
      second: {
          enabled: false
      },
      meridian: {
          enabled: true
        }
  }
}
var date_opts = {
  initialValue : false,
  responsive : true,
  observer: true,
  calendar : {
    persian : {
      locale : "fa"
    },
    gregorian :{
      locale : "fa"
    }
  },
  format: 'DD/MM/YYYY',
  toolbox : {
    submitButton :{
      enabled : true
    },
    calendarSwitch :{
      enabled : false
    },
    todayButton : {
      enabled : true
    }
  },
  timePicker : {
      enabled: false,
      step: 1,
      hour: {
        enabled: false,
        step: 1
      },
      minute: {
          enabled: false,
          step: 1
        },
      second: {
          enabled: false
      },
      meridian: {
          enabled: false
        }
  }
}

var pickers = [
  {
    id : '#assessmentSettingsAction\\:startDate',
    picker : null
  },
  {
    id : '#assessmentSettingsAction\\:endDate',
    picker : null
  },
  {
    id : '#assessmentSettingsAction\\:retractDate',
    picker : null
  },
  {
    id : '#assessmentSettingsAction\\:feedbackDate',
    picker : null
  },
  {
    id : '#assessmentSettingsAction\\:feedbackEndDate',
    picker : null
  },
  {
    id : '#assessmentSettingsAction\\:newEntry-start_date',
    picker : null
  },
  {
    id : '#assessmentSettingsAction\\:newEntry-due_date',
    picker : null
  },
  {
    id : '#assessmentSettingsAction\\:newEntry-retract_date',
    picker : null
  }
]



var setHiddenFields = function (d, o) {
  moment.locale("en");
  if(o.ashidden !== undefined) {
    jQuery.each(o.ashidden, function(i, h) {
      var oldValue = jQuery('#' + h).val();
      var newValue = '';
      if(d != null){
        switch(i) {
          case "month":
            newValue = d.getMonth() + 1;
            break;
          case "day":
            newValue = d.getDate();
            break;
          case "year":
            newValue = d.getFullYear();
            break;
          case "hour":
            newValue = (o.ampm == true) ? moment(d).format('hh') : moment(d).format('HH');
            break;
          case "minute":
            newValue = moment(d).format('mm');
            break;
          case "ampm":
            newValue = moment(d).format('A').toLowerCase();
            break;
          case "iso8601":
            newValue = moment(d).format();
            break;
        }
      }
      jQuery('#' + h).val(newValue);
      // If new value is different from the previous one, launch change event on hidden input
      if (oldValue != newValue) {
        jQuery('#' + h).change();
      }
    });
  }
}


var localDatePicker = function(opts) {

  $(document).ready(function() {

    let chosen_opts = default_opts;

    opts = $.extend({}, chosen_opts, opts);

    if(opts.useTime != null && opts.useTime !== 0){
      opts.timePicker.enabled = true;
      opts.format = 'DD/MM/YYYY HH:mm';
    }

    var datepickerapi =  $(opts.input).pDatepicker(opts);
    
    pickers.forEach(obj => function() {
      if(obj.id === opts.input){
        obj.picker = datepickerapi;
      }
    });

    datepickerapi.options.toolbox.submitButton.onSubmit = function(){
      
      var d = datepickerapi.getState().selected.dateObject.toDate();
      setHiddenFields(d, opts);
    }
    datepickerapi.options.onSelect = function() {
      var d = datepickerapi.getState().selected.dateObject.toDate();
      setHiddenFields(d, opts);
    }
    datepickerapi.options.onSet = function() {
      var d = datepickerapi.getState().selected.dateObject.toDate();
      setHiddenFields(d, opts);
    }
    datepickerapi.options.toolbox.todayButton.onToday = function() {

      if (portal.serverTimeMillis && portal.user && portal.user.offsetFromServerMillis) {
        let osTzOffset = (new Date()).getTimezoneOffset();
        var t = moment(parseInt(portal.serverTimeMillis))
          .add(portal.user.offsetFromServerMillis, 'ms')
          .add(osTzOffset, 'm')
          .toDate();
          datepickerapi.setDate(t.getTime());
      }
      else {      
        var d = datepickerapi.getState().selected.dateObject.toDate();
        setHiddenFields(d, opts);
      }

    }

     if(  $(opts.input).val() ){
         var c = moment( $(opts.input).val(), opts.parseFormat ).toDate();
         datepickerapi.setDate(c.getTime());
       }  

      initDateTime(opts, datepickerapi);
  });



  if(opts.ashidden !== undefined) {
    var inp = opts.input;
    jQuery.each(opts.ashidden, function(i, h) {
      if ($('#' + h).length < 1) {
        jQuery(inp).after('<input type="hidden" name="' + h + '" id="' + h + '" value="">');
      }
    });
  }

 
}

var initDateTime = function (options, dp) {

  var initVal;

  // If val is undefined, we assume we're to use the input value
  if (typeof options.val === 'undefined' && $(options.input).val() !== '') {
    initVal = $(options.input).val();
  }

  // if val is set, use it
  if (typeof options.val !== 'undefined') {
    initVal = options.val;
  }

  // if getval is set, this will override val
  if (typeof options.getval !== 'undefined') {
    initVal = $(options.getval).val();
  }

  // finally trim the initVal and make sure it is set so we don't Dec 1969 the user
  initVal = jQuery.trim(initVal);

  if (!(initVal == "" && options.allowEmptyDate)){
    if (!initVal) {
      initVal = getPreferredSakaiDatetime();
    }
  }

  // set localDate to the time to use, predefined or current date/time
  dp.setDate( getDate(initVal, options) );
};

var getPreferredSakaiDatetime = function () {

  if (portal.serverTimeMillis && portal.user && portal.user.offsetFromServerMillis) {
    let osTzOffset = (new Date()).getTimezoneOffset();
    return moment(parseInt(portal.serverTimeMillis))
      .add(portal.user.offsetFromServerMillis, 'ms')
      .add(osTzOffset, 'm')
      .toDate();
  } else {
    window.console && console.debug("No user timezone or server time set. Using agent's time and timezone for initial datetime");
    return new Date();
  }
};

var getDate = function(d, options) {
  var parseDate;

  if (typeof d == 'string') {
    window.console && console.debug("string date: " + d + ";parseFormat: " + options.parseFormat);
    if (d == "" && options.allowEmptyDate){
      parseDate="";
    }else{
      // formatList can be added to as needed. Refer to Moment Docs for reference
      // http://momentjs.com/docs/#/parsing/string-format/
      var formatList = [];

      if (typeof options.parseFormat !== 'undefined') {
        parseDate = new Date(moment(d, options.parseFormat));
      } else {
        parseDate = new Date(moment(d, options.parseFormat));
      };
    }

  } else {
    window.console && console.debug("date object: " + d);
    parseDate = d;
  };

  return parseDate;
}