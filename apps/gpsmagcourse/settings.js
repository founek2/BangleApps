(function(back) {
  var FILE = "gpsmagcourse.json";
  // Load settings
  const settings = Object.assign({
    speed: 6, // when lower then this use direction from compass
    compassSrc: 1, // [off, built-in, magnav]
    resetCompassOnPwr: true, // reset compass on power on
    tiltCompensation: true, // tilt compensation on built-in compass
    showWidget: 2, // 0 = never, 1 = when replacing GPS course with compass course, 2 = when GPS is on
  }, require("Storage").readJSON(FILE, true) || {});

  let magnavInstalled = true;
  // Check if magnav is installed
  try {
    require("magnav");
  } catch(err) {
    // not installed
    magnavInstalled = false;
  }

  if (!magnavInstalled) {
    // adjust settings to work without magnav
    if (settings.compassSrc === 2) {
      settings.compassSrc = 1;
    }
    if (settings.tiltCompensation) {
      settings.tiltCompensation = false;
    }
  }
  const compassSrcOpts = ["off", "built-in"];
  if (magnavInstalled) {
    compassSrcOpts.push("magnav");
  }

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  const menu = {
    "" : { "title" : /*LANG*/"GPS/Comp. course" },
    "< Back" : () => back(),
    /*LANG*/'Speed threshold': {
      value: settings.speed,
      min: 1, max: 20,
      onchange: v => {
        settings.speed = v;
        writeSettings();
      }
    },
    /*LANG*/'Compass source': {
      value: settings.compassSrc,
      min: 0, max: compassSrcOpts.length-1,
      format: v => compassSrcOpts[v],
      onchange: v => {
        settings.compassSrc = v;
        writeSettings();
      }
    },
    /*LANG*/'Reset compass when powered on': {
      value: !!settings.resetCompassOnPwr,
      format: v => v?/*LANG*/"On":/*LANG*/"Off",
      onchange: v => {
        settings.resetCompassOnPwr = v;
        writeSettings();
      }
    },
    /*LANG*/'Show Widget': {
      value: settings.showWidget,
      min: 0, max: 2,
      format: v => ["Never", "Active", "GPS on"][v],
      onchange: v => {
        settings.showWidget = v;
        writeSettings();
      }
    },
  };

  if (magnavInstalled) {
      menu[/*LANG*/'Tilt compensation on built-in compass'] = {
      value: !!settings.tiltCompensation,
      format: v => v?/*LANG*/"On":/*LANG*/"Off",
      onchange: v => {
        settings.tiltCompensation = v;
        writeSettings();
      }
    };
  }

  // Show the menu
  E.showMenu(menu);
})(load);
