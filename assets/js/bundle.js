(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = function () {
  var assessmentResults = [];
  var startTime = new Date().getTime(); // setTimeout(function() {
  // 	var endTime = new Date().getTime();
  // 	console.log(endTime - startTime);
  // }, 2000);

  return {
    settings: {},
    init: function init() {
      this.bindEvents();
      this.setKeys();
      this.pickRandomVideo();
    },
    bindEvents: function bindEvents() {
      var self = this;
      var steps = document.querySelectorAll('.step');
      steps.forEach(function (step) {
        var nextButton = step.querySelector('.next');
        if (nextButton) nextButton.addEventListener('click', function (event) {
          self.nextStep();
        });
        var prevButton = step.querySelector('.prev');
        if (prevButton) prevButton.addEventListener('click', function (event) {
          self.prevStep();
        });
      });
      var answerButtons = document.querySelectorAll('.assess-video .pagination .chord');
      answerButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          var correct = button.getAttribute('correct') === 'true';
          assessmentResults.push({
            'correct': correct,
            'time': (new Date().getTime() - startTime) / 1000 + ' sec'
          });
          console.log(assessmentResults);
          startTime = new Date().getTime();
          self.nextStep();
        });
      }); // let startVideo = document.querySelector('.start');
      // if (startVideo) startVideo.addEventListener('click', function() {
      // 	self.activateFullScreenVideo();
      // });
    },
    triggerNextChordVideo: function triggerNextChordVideo() {
      var nextVideo = document.querySelector('.assess-video.active video');
      if (nextVideo) nextVideo.play();
    },
    activateFullScreenVideo: function activateFullScreenVideo() {
      var videos = document.querySelectorAll('video');
      videos.forEach(function (video) {
        video.classList.remove('fullscreen');
      });
      var video = document.querySelector('.watch-video.active video');
      video.classList.add('fullscreen');

      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    },
    nextStep: function nextStep() {
      var self = this;
      var steps = document.querySelectorAll('.step');

      for (var i = 0; i < steps.length; i++) {
        if (steps[i + 1] && steps[i].classList.contains('active')) {
          steps[i].classList.remove('active');
          steps[i + 1].classList.add('active');
          startTime = new Date().getTime();
          break;
        }

        if (steps[i].classList.contains('assess-video')) {
          self.triggerNextChordVideo();
        }
      }
    },
    prevStep: function prevStep() {
      var steps = document.querySelectorAll('.step');

      for (var i = 0; i < steps.length; i++) {
        if (steps[i - 1] && steps[i].classList.contains('active')) {
          steps[i].classList.remove('active');
          steps[i - 1].classList.add('active');
          startTime = new Date().getTime();
          break;
        }
      }
    },
    pickRandomVideo: function pickRandomVideo() {
      var videos = document.querySelectorAll('.watch-video video');
      var randomVideoIndex = utils.randomInt(0, 2);
      videos.forEach(function (video, index) {
        if (index !== randomVideoIndex) {
          video.classList.remove('active');
        } else {
          video.classList.add('active');
        }
      });
    },
    setKeys: function setKeys() {
      document.addEventListener('keyup', function (event) {
        var enter = 13;

        if (event.keyCode === enter) {}
      });
    }
  };
};

},{}],2:[function(require,module,exports){
"use strict";

var UI = require('./components/ui.js');

var Utilities = require('./utils.js');

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    UI().init();
  });
})();

},{"./components/ui.js":1,"./utils.js":3}],3:[function(require,module,exports){
"use strict";

(function () {
  var appSettings;

  window.utils = function () {
    return {
      appSettings: {
        breakpoints: {
          mobileMax: 767,
          tabletMin: 768,
          tabletMax: 991,
          desktopMin: 992,
          desktopLargeMin: 1200
        }
      },
      mobile: function mobile() {
        return window.innerWidth < this.appSettings.breakpoints.tabletMin;
      },
      tablet: function tablet() {
        return window.innerWidth > this.appSettings.breakpoints.mobileMax && window.innerWidth < this.appSettings.breakpoints.desktopMin;
      },
      desktop: function desktop() {
        return window.innerWidth > this.appSettings.breakpoints.desktopMin;
      },
      getBreakpoint: function getBreakpoint() {
        if (window.innerWidth < this.appSettings.breakpoints.tabletMin) return 'mobile';else if (window.innerWidth < this.appSettings.breakpoints.desktopMin) return 'tablet';else return 'desktop';
      },
      debounce: function debounce(func, wait, immediate) {
        var timeout;
        return function () {
          var context = this,
              args = arguments;

          var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };

          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      },

      /* Purpose: Detect if any of the element is currently within the viewport */
      anyOnScreen: function anyOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom);
      },

      /* Purpose: Detect if an element is vertically on screen; if the top and bottom of the element are both within the viewport. */
      allOnScreen: function allOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.bottom < bounds.top && viewport.top > bounds.bottom);
      },
      secondsToMilliseconds: function secondsToMilliseconds(seconds) {
        return seconds * 1000;
      },

      /*
      * Purpose: This method allows you to temporarily disable an an element's transition so you can modify its proprties without having it animate those changing properties.
      * Params:
      * 	-element: The element you would like to modify.
      * 	-cssTransformation: The css transformation you would like to make, i.e. {'width': 0, 'height': 0} or 'border', '1px solid black'
      */
      getTransitionDuration: function getTransitionDuration(element) {
        var $element = $(element);
        return utils.secondsToMilliseconds(parseFloat(getComputedStyle($element[0]).transitionDuration));
      },
      isInteger: function isInteger(number) {
        return number % 1 === 0;
      },
      randomInt: function randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
      rotate: function rotate(array) {
        array.push(array.shift());
        return array;
      }
    };
  }();

  module.exports = window.utils;
})();

},{}]},{},[2]);
