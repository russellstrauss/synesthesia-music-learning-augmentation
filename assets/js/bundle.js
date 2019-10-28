(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var FileSaver = require('file-saver');

module.exports = function () {
  var assessmentResults = [];
  var startTime = new Date().getTime();
  var selectedVideo;
  var musicExperience = 'false';
  var name;
  var noteTested;
  var selectedVideoWatchCount = 0;
  var trialCount = 1;
  var tableHeadingAdded = false;
  return {
    settings: {},
    init: function init() {
      this.bindEvents();
      this.setKeys();
      this.pickRandomVideo();
      var count0 = 0;
      var count1 = 0;
      var count2 = 0;

      for (var i = 0; i < 10000; i++) {
        var random = utils.randomInt(0, 2);
        if (random === 0) count0++;
        if (random === 1) count1++;
        if (random === 2) count2++;
      }
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
      var downloadButton = document.querySelector('#download');
      if (downloadButton) downloadButton.addEventListener('click', function (event) {
        self.saveResults();
      });
      var experience = document.querySelector('#music-experience');
      if (experience) experience.addEventListener('change', function (event) {
        musicExperience = experience.value;
      });
      var nameField = document.querySelector('#fullName');
      if (nameField) nameField.addEventListener('keyup', function (event) {
        name = nameField.value;
      });
      var retryButton = document.querySelector('#retry');
      if (retryButton) retryButton.addEventListener('click', function (event) {
        self.goToBeginning();
        self.stopAndResetAllVideos();

        if (trialCount >= 3) {
          retryButton.style.display = 'none';
        }
      });
      var resultsButton = document.querySelector('#displayResults');
      if (resultsButton) resultsButton.addEventListener('click', function (event) {
        self.showResults();
      });
      var assessmentVideoContainers = document.querySelectorAll('.assess-video');
      assessmentVideoContainers.forEach(function (videoContainer) {
        var answerButtons = videoContainer.querySelectorAll('.pagination .chord');
        answerButtons.forEach(function (button) {
          button.addEventListener('click', function (event) {
            var correct = button.getAttribute('chord') === videoContainer.getAttribute('tested-chord') && button.getAttribute('chord') !== null;
            assessmentResults.push({
              'Name': name,
              'Trial Count': trialCount,
              'Melody Listen Count': selectedVideoWatchCount,
              'Note Tested': videoContainer.getAttribute('tested-chord'),
              'Note Answered': button.getAttribute('chord'),
              'Correct Selection': correct,
              'Time (sec)': (new Date().getTime() - startTime) / 1000,
              'Assessment Video': selectedVideo,
              'Music Experience': musicExperience,
              'Timestamp': moment().format('L') + '-' + moment().format('LTS')
            });
            startTime = new Date().getTime();
            self.nextStep();
          });
        });
      });
    },
    triggerNextChordVideo: function triggerNextChordVideo() {
      var nextVideo = document.querySelector('.assess-video.active video');
      if (nextVideo) nextVideo.play();
    },
    nextStep: function nextStep() {
      var self = this;
      self.stopAndResetAllVideos();
      var steps = document.querySelectorAll('.step');

      for (var i = 0; i < steps.length; i++) {
        if (steps[i + 1] && steps[i].classList.contains('active')) {
          steps[i].classList.remove('active');
          steps[i + 1].classList.add('active');
          startTime = new Date().getTime();

          if (steps[i + 1].classList.contains('assess-video')) {
            // start vid automatically
            self.triggerNextChordVideo();
          }

          if (steps[i + 1].classList.contains('results')) {//self.showResults();
          }

          break;
        }
      }
    },
    goToBeginning: function goToBeginning() {
      var self = this;
      var steps = document.querySelectorAll('.step');

      for (var i = 0; i < steps.length; i++) {
        steps[i].classList.remove('active');
      }

      steps[0].classList.add('active');
      self.reset();
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
          selectedVideo = video.getAttribute('id');
        }

        video.addEventListener('play', function () {
          document.querySelector('#beginAssessment').style.display = 'block';

          if (selectedVideoWatchCount > 1) {
            video.pause();
            video.currentTime = 0;
            alert('The maximum melody play count is 2. You may now press "Begin" to start.');
          }
        });
        video.addEventListener('ended', function () {
          selectedVideoWatchCount++;
        });
      });
    },
    showResults: function showResults() {
      document.querySelector('#displayResults').style.display = 'none';
      document.querySelector('.results-section').style.display = 'block';
      var resultsTable = document.querySelector('table.results');

      while (resultsTable.firstChild) {
        // remove all children
        resultsTable.removeChild(resultsTable.firstChild);
      }

      var tr = document.createElement('tr');

      if (tableHeadingAdded === false) {
        var thead = document.createElement('thead');
        thead.appendChild(tr);
        resultsTable.appendChild(thead);
        tableHeadingAdded = true;
      }

      Object.keys(assessmentResults[0]).forEach(function (key, index) {
        var columnHeading = document.createElement('td');
        columnHeading.appendChild(document.createTextNode(key));
        tr.appendChild(columnHeading);
      });
      var tbody = document.createElement('tbody');
      resultsTable.appendChild(tbody);
      assessmentResults.forEach(function (row) {
        var tr = document.createElement('tr');
        Object.keys(row).forEach(function (key) {
          var result = row[key];
          var td = document.createElement('td');
          td.appendChild(document.createTextNode(result));
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    },
    saveResults: function saveResults() {
      var resultString = "";
      Object.keys(assessmentResults[0]).forEach(function (key, index) {
        resultString += key;
        if (index != Object.keys(assessmentResults[0]).length - 1) resultString += ',';
      });
      resultString += '\n';
      assessmentResults.forEach(function (row, rowIndex) {
        Object.keys(row).forEach(function (key, index) {
          var result = row[key];
          if (index !== Object.keys(row).length - 1) result += ',';
          resultString += result;
        });
        resultString += '\n';
      });
      var blob = new Blob([resultString], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, 'synethesia_' + moment().format('L') + '-' + moment().format('LTS') + '.csv');
    },
    reset: function reset() {
      startTime = new Date().getTime();
      trialCount++;
      document.querySelector('#trialCount').textContent = trialCount.toString();
      document.querySelector('#displayResults').style.display = 'block';
      document.querySelector('.results-section').style.display = 'none';
      tableHeadingAdded = false;
      selectedVideoWatchCount = 0;
    },
    stopAndResetAllVideos: function stopAndResetAllVideos() {
      var videos = document.querySelectorAll('video');
      videos.forEach(function (video) {
        video.pause();
        video.currentTime = 0;
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

},{"file-saver":4}],2:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
(function (global){
(function(a,b){if("function"==typeof define&&define.amd)define([],b);else if("undefined"!=typeof exports)b();else{b(),a.FileSaver={exports:{}}.exports}})(this,function(){"use strict";function b(a,b){return"undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open("GET",b),e.responseType="blob",e.onload=function(){a(e.response,c,d)},e.onerror=function(){console.error("could not download file")},e.send()}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send()}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"))}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b)}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof global&&global.global===global?global:void 0,a=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href)},4E4),setTimeout(function(){e(j)},0))}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i)})}}:function(a,b,d,e){if(e=e||open("","_blank"),e&&(e.document.title=e.document.body.innerText="downloading..."),"string"==typeof a)return c(a,b,d);var g="application/octet-stream"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\/[\d]+/.test(navigator.userAgent);if((i||g&&h)&&"object"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),e?e.location.href=a:location=a,e=null},j.readAsDataURL(a)}else{var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l,e=null,setTimeout(function(){k.revokeObjectURL(l)},4E4)}});f.saveAs=a.saveAs=a,"undefined"!=typeof module&&(module.exports=a)});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2]);
