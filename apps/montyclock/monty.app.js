/**
 * Bangle.js Numerals Clock
 *
 * + Original Author: Raik M. https://github.com/ps-igel
 * + Created: April 2020
 * + see README.md for details
 */
{
  if (NRF.amsIsActive && !bleServiceOptions.ams) {
    bleServiceOptions.ams = true;
  }

  const scale = g.getWidth() / 240;

  const translate = function (tx, ty, p, ascale) {
    return g.transformVertices(p, { x: tx, y: ty, scale: ascale == undefined ? scale : ascale });
  }

  const drawFuncs = {
    fill: function (poly, isHole) {
      if (isHole) g.setColor(g.theme.bg);
      g.fillPoly(poly, true);
    },
    framefill: function (poly, isHole) {
      var c = g.getColor();
      g.setColor(isHole ? g.theme.bg : ((c & 0b1111011111011110) >> 1)); // 16 bit half bright
      g.fillPoly(poly, true);
      g.setColor(c);
      g.drawPoly(poly, true);
    },
    frame: function (poly, isHole) {
      g.drawPoly(poly, true);
    },
    thickframe: function (poly, isHole) {
      g.drawPoly(poly, true);
      g.drawPoly(translate(1, 0, poly, 1), true);
      g.drawPoly(translate(1, 1, poly, 1), true);
      g.drawPoly(translate(0, 1, poly, 1), true);
    },
    thickfill: function (poly, isHole) {
      if (isHole) g.setColor(g.theme.bg);
      g.fillPoly(poly, true);
      g.setColor(g.theme.fg);
      g.drawPoly(translate(1, 0, poly, 1), true);
      g.drawPoly(translate(1, 1, poly, 1), true);
      g.drawPoly(translate(0, 1, poly, 1), true);
    }
  };

  const ClockScreen = function () {
    const numerals = {
      0: [[9, 1, 82, 1, 90, 9, 90, 92, 82, 100, 9, 100, 1, 92, 1, 9], [30, 25, 61, 25, 69, 33, 69, 67, 61, 75, 30, 75, 22, 67, 22, 33]],
      1: [[50, 1, 82, 1, 90, 9, 90, 92, 82, 100, 73, 100, 65, 92, 65, 27, 50, 27, 42, 19, 42, 9]],
      2: [[9, 1, 82, 1, 90, 9, 90, 53, 82, 61, 21, 61, 21, 74, 82, 74, 90, 82, 90, 92, 82, 100, 9, 100, 1, 92, 1, 48, 9, 40, 70, 40, 70, 27, 9, 27, 1, 19, 1, 9]],
      3: [[9, 1, 82, 1, 90, 9, 90, 92, 82, 100, 9, 100, 1, 92, 1, 82, 9, 74, 70, 74, 70, 61, 9, 61, 1, 53, 1, 48, 9, 40, 70, 40, 70, 27, 9, 27, 1, 19, 1, 9]],
      4: [[9, 1, 14, 1, 22, 9, 22, 36, 69, 36, 69, 9, 77, 1, 82, 1, 90, 9, 90, 92, 82, 100, 78, 100, 70, 92, 70, 61, 9, 61, 1, 53, 1, 9]],
      5: [[9, 1, 82, 1, 90, 9, 90, 19, 82, 27, 21, 27, 21, 40, 82, 40, 90, 48, 90, 92, 82, 100, 9, 100, 1, 92, 1, 82, 9, 74, 71, 74, 71, 61, 9, 61, 1, 53, 1, 9]],
      6: [[9, 1, 82, 1, 90, 9, 90, 19, 82, 27, 22, 27, 22, 40, 82, 40, 90, 48, 90, 92, 82, 100, 9, 100, 1, 92, 1, 9], [22, 60, 69, 60, 69, 74, 22, 74]],
      7: [[9, 1, 82, 1, 90, 9, 90, 15, 20, 98, 9, 98, 1, 90, 1, 86, 56, 22, 9, 22, 1, 14, 1, 9]],
      8: [[9, 1, 82, 1, 90, 9, 90, 92, 82, 100, 9, 100, 1, 92, 1, 9], [22, 27, 69, 27, 69, 43, 22, 43], [22, 58, 69, 58, 69, 74, 22, 74]],
      9: [[9, 1, 82, 1, 90, 9, 90, 92, 82, 100, 9, 100, 1, 92, 1, 82, 9, 74, 69, 74, 69, 61, 9, 61, 1, 53, 1, 9], [22, 27, 69, 27, 69, 41, 22, 41]],
    };
    let settings = require('Storage').readJSON('numerals.json', 1) || { color: 1, drawMode: "fill", showDate: 0 };
    const _12hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"] || false;
    let showed = false;

    let _hCol = [];
    let _mCol = [];
    let _rCol = 0;

    if (process.env.HWVERSION == 1) {
      _hCol = ["#ff5555", "#ffff00", "#FF9901", "#2F00FF"];
      _mCol = ["#55ff55", "#ffffff", "#00EFEF", "#FFBF00"];
    } else {
      _hCol = ["#ff0000", "#00ff00", "#ff0000", "#ff00ff"];
      _mCol = ["#00ff00", "#0000ff", "#00ffff", "#00ff00"];
    }
    if (settings.color == 0) _rCol = Math.floor(Math.random() * _hCol.length);
    if (settings.color > 0) _rCol = settings.color;

    function drawNum(num, col, x, y, func) {
      g.setColor(col);
      let tx = (x * 100 + 25) * scale;
      let ty = (y * 104 + 32) * scale;
      numerals[num].forEach((values, i) => func(translate(tx, ty, values), i > 0))
    }

    let _showDate = false;
    function draw() {
      g.clearRect(0, 24, 240, 240);

      const d = new Date();
      let l1, l2;
      if (_showDate) {
        l1 = String(d.getDate()).padStart(2, "0");
        l2 = String(d.getMonth() + 1).toString().padStart(2, "0");
      } else {
        l1 = String(_12hour ? d.getHours() % 12 : d.getHours()).padStart(2, "0");
        l2 = String(d.getMinutes()).padStart(2, "0");
      }
      const drawFunc = drawFuncs[settings.drawMode] || drawFuncs.fill;

      drawNum(l1[0], _hCol[_rCol], 0, 0, drawFunc);
      drawNum(l1[1], _hCol[_rCol], 1, 0, drawFunc);
      drawNum(l2[0], _mCol[_rCol], 0, 1, drawFunc);
      drawNum(l2[1], _mCol[_rCol], 1, 1, drawFunc);
    }

    const handleTouch = function () {
      if (_showDate) return;
      _showDate = true;

      hide()
      draw()

      setTimeout(() => {
        _showDate = false;
        if (showed) show()
      }, 5000);
    }

    let timeout = 0;
    const enableRefresh = function () {
      draw()
      const nextUpdateIn = (60 - new Date().getSeconds()) * 1000
      timeout = setTimeout(enableRefresh, nextUpdateIn)
    }

    const show = function () {
      showed = true;
      enableRefresh()

      if (settings.showDate) Bangle.on('touch', handleTouch);
    }

    const hide = function () {
      showed = false;
      if (timeout) clearTimeout(timeout)
      Bangle.removeListener("touch", handleTouch)
    }

    const remove = function () {
      hide()
    }

    return {
      draw,
      show,
      hide,
      remove,
    }
  }

  const MusicScreen = function () {
    const controlsIcons = {
      // Pause
      0: [[1, 1, 10, 1, 10, 30, 1, 30], [15, 1, 24, 1, 24, 30, 15, 30]],
      // Play
      1: [[1, 3, 24, 15, 1, 28]]
    }
    const state = { playing: 0, title: "", album: "", artist: "" }
    let showed = false;

    function drawSingleControl(num, col, x, y, func) {
      g.setColor(col);
      for (let i = 0; i < controlsIcons[num].length; i++) {
        func(translate(x, y, controlsIcons[num][i]), 0);
      }
    }

    function draw() {
      if (!showed) return;
      g.reset();
      g.clearRect(0, 24, 240, 240);

      if (state.playing) {
        drawSingleControl(0, g.theme.fg, 73, 140, drawFuncs.fill);
      } else {
        drawSingleControl(1, g.theme.fg, 73, 140, drawFuncs.fill);
      }

      g.setFont("6x8", 2);
      g.drawString(state.title, 10, 50)

      g.setFont("6x8", 1);
      g.drawString(state.album, 10, 70)
      g.drawString(state.artist, 10, 80)
    }


    const amsSendCommand = function (cmd) {
      try {
        NRF.amsCommand(cmd)
      } catch (err) {
        console.log(err)
      }
    }

    const handleTouch = function () {
      amsSendCommand("playpause")
    }
    const handleSwipe = function (x, y) {
      if (y == -1 && x == 0) {
        // Swipe down
        amsSendCommand("volup")
      } else if (y == 1 && x == 0) {
        // swipe up
        amsSendCommand("voldown")
      }

      // swipe right
      if (y == 0 && x == -1) {
        amsSendCommand("next")
      }
    }

    const handleBleConnect = function () {
      if (!NRF.amsIsActive()) {
        state.title = "AMS Inactive";
        state.album = "ble ams option:";
        state.artist = String(bleServiceOptions.ams);
      }
      draw()
    }
    const handleBleDisconnect = function () {
      state.playing = 0;
      state.title = "Disconnected";
      state.album = "";
      state.artist = "";
      draw()
    }

    // {id: "title", value: "Ants marching"}
    // {id: "playbackinfo", value: "1,1.0,time[s]"} running
    // {id: "playbackinfo", value: "0,0.0,time[s]"} paused
    // {id: "duration", value: "time[s]"}
    // {id: "volume", value: "0.125"}
    // IDs: volume | artist | duration | playbackinfo | name (name of the player)
    const handleAms = function (info) {
      console.log(JSON.stringify(info))
      let refresh = 1;

      // in some cases value was an empty string
      if (info.value == "") return;

      if (info.id === "playbackinfo") {
        state.playing = parseInt(info.value[0]);
      } else if (info.id == "title") {
        state.title = info.value
      } else if (info.id == "album") {
        state.album = info.value
      } else if (info.id == "artist") {
        state.artist = info.value
      } else {
        refresh = 0;
      }

      if (refresh) draw();
    }

    NRF.on('connect', handleBleConnect)
    NRF.on('disconnect', handleBleDisconnect)
    E.on('AMS', handleAms)

    // let interval = 0;
    const show = function () {
      showed = true;
      draw()
      // interval = setInterval(draw, REFRESH_RATE)

      Bangle.on('touch', handleTouch);
      Bangle.on('swipe', handleSwipe);
    }

    const hide = function () {
      showed = false;
      // if (interval) clearInterval(interval)
      Bangle.removeListener("touch", handleTouch)
      Bangle.removeListener("swipe", handleSwipe)
    }
    const remove = function () {
      hide()
      NRF.removeListener("connect", handleBleConnect)
      NRF.removeListener('disconnect', handleBleDisconnect)
      E.removeListener('AMS', handleAms)
    }

    return {
      draw,
      show,
      hide,
      remove,
    }
  }

  const InfoScreen = function () {
    const state = { items: [], showed: false };

    const drawWidget = function (info, x, y, w, h) {
      g.clearRect(x, y, x + w, y + h)

      if (info.img) g.drawImage(info.img, x + (w / 2 - 12), y + 5)
      g.drawRect(x, y, x + w, y + h)

      g.setFont("6x8:2").setFontAlign(0, 1).drawString(info.text, x + (w / 2), y + 24 + 10 + 16)
    }

    const Widget = function (loaded, i, width) {
      // X
      // 176
      // 3*52 = 156 + 5 (spacing)
      // 52 - 24 = 28 (14 spacing)
      const w = 52 + (52 + 5) * ((width || 1) - 1);
      const h = 55;
      const widgetStartX = 5 + (i % 3) * (52 + 5);
      const widgetStartY = 5 + (Math.floor(i / 3)) * (h + 5) + 24;

      const draw = function () {
        g.reset()
        drawWidget(loaded.get(), widgetStartX, widgetStartY, w, h)
      }

      return {
        show: function () {
          loaded.on('redraw', draw)
          loaded.show()
        },
        draw: draw,
        hide: function () {
          loaded.hide()
          loaded.removeListener('redraw', draw)
        }
      }
    }

    const draw = function () {
      state.items.forEach(widget => widget.draw())
    }

    // let interval = 0;
    const show = function () {
      if (state.items.length == 0) {
        console.log("Loading widgets info")
        const loadedInfo = require("clock_info").load();

        const items = loadedInfo[0].items
        const battery = items.find(i => i.name == "Battery");
        state.items.push(Widget(battery, 0))
        const steps = items.find(i => i.name == "Steps");
        state.items.push(Widget(steps, 1))

        const ram = items.find(i => i.name == "ram");
        if (ram)
          state.items.push(Widget(ram, 2))

        const hrm = items.find(i => i.name == "HRM");
        if (hrm)
          state.items.push(Widget(hrm, 3, 2))
      }

      state.showed = true
      console.log("Showing widgets")
      state.items.forEach(widget => widget.show())
      draw()
      // interval = setInterval(draw, REFRESH_RATE)
    }

    const hide = function () {
      // if (interval) clearInterval(interval)
      if (state.showed) {
        state.showed = false
        console.log("Hiding widgets")
        state.items.forEach(widget => widget.hide())
      }
    }

    const remove = function () {
      hide()
    }

    return {
      draw,
      show,
      hide,
      remove,
    }
  }

  const ScreenCarousel = function (screens) {
    const INFO = 0;
    const CLOCK = 1;
    const CONTROLS = 2;
    let currentScreen = CLOCK;

    const changeScreen = function (newScreen) {
      g.reset()

      screens[currentScreen].hide()

      g.clearRect(0, 24, 240, 240);
      currentScreen = newScreen;
      screens[currentScreen].show()
    }

    const next = function () {
      if (currentScreen < CONTROLS)
        changeScreen(currentScreen + 1);
    }

    const prev = function () {
      if (currentScreen > INFO)
        changeScreen(currentScreen - 1);
    }

    const handleSwipe = function (x, y) {
      if (x == -1) {
        next()
      } else if (x == 1) {
        prev()
      }
    }

    Bangle.on('swipe', handleSwipe);

    const show = function () {
      g.reset()

      screens[currentScreen].show()
    }

    const remove = function () {
      screens.forEach(sreen => sreen.remove())
      Bangle.removeListener("swipe", handleSwipe)
    }

    return {
      next,
      prev,
      show,
      remove,
    }
  }

  const carousel = ScreenCarousel([InfoScreen(), ClockScreen(), MusicScreen()]);
  carousel.show()

  // Bangle.on('lcdPower', function (on) {
  //     if (on) {
  //         changeScreen(_screen)
  //     } else stopUpdateInt();
  // });

  // Playing
  // E.emit("AMS", {
  //     id: "playbackinfo",
  //     value: "1,1.0,12.3",
  // })

  // Paused
  // E.emit("AMS", {
  //     id: "playbackinfo",
  //     value: "0,0.0,12.3",
  // })

  // Paused
  // E.emit("AMS", {
  //     id: "title",
  //     value: "Ants marching - Ode to Joy",
  // })

  // E.emit("AMS", {
  //     id: "album",
  //     value: "A Family Christmas",
  // })

  // E.emit("AMS", {
  //     id: "artist",
  //     value: "The Piano Guys",
  // })


  // Show launcher when button pressed
  Bangle.setUI({
    mode: "clock", remove: carousel.remove
  });

  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
// Unused
// Bangle.on('lock', () => setUp());