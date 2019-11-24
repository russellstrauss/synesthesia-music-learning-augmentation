var FileSaver = require('file-saver');
var axios = require('axios');

module.exports = function() {
	
	var conditions = ['interference', 'control', 'test'];
	var body = document.querySelector('body');
	var assessmentResults = [];
	var startTime = new Date().getTime();
	var selectedVideo;
	var musicExperience = 'false';
	var name;
	var noteTested;
	var selectedVideoWatchCount = 0, audioPlayCount = 0;
	var trialCount = 1, restartCount = 0;
	var tableHeadingAdded = false;
	var audio = document.querySelector('audio');
	var red = '#E25453', blue = '#4D9CDF', green = '#3BB173', yellow = '#E1BB2A';
	var colors = [red, green, blue, yellow];
	var interferenceColors = utils.shuffle(colors);
	var deviceColors = ['#FF0000', '#0AFF00', '#0037FF', '#F8FF00'];
	var defaultBackgroundColor = '#F0F0F0';
	
	return {
		
		settings: {
			showBackgroundColors: true,
			colorOutputMode: 'hud',
			condition: 'test',
			test: {
				'Am': colors[0],
				'C': colors[1],
				'F': colors[2],
				'G': colors[3]
			},
			interference: {
				'Am': interferenceColors[0],
				'C': interferenceColors[1],
				'F': interferenceColors[2],
				'G': interferenceColors[3]
			},
			control: {
				'Am': defaultBackgroundColor,
				'C': defaultBackgroundColor,
				'F': defaultBackgroundColor,
				'G': defaultBackgroundColor
			},
			audio: {
				'Am': new Audio('./assets/audio/Am.wav'),
				'F': new Audio('./assets/audio/F.wav'),
				'C': new Audio('./assets/audio/C.wav'),
				'G': new Audio('./assets/audio/G.wav')
			}
		},
		
		init: function() {

			this.bindEvents();
			this.setKeys();
			this.pickRandomMode();
			this.dragAndDrop();
			this.audioCursor();
		},
		
		generateAnswers: function() {
			
			let self = this;
			let answers = [];
			let userAnswers = [];
			let answerElements = document.querySelectorAll('.answers .cells .cell');
			let accuracy = [];
			
			answerElements.forEach(function(cell, index) {
				let answer = cell.getAttribute('answer');
				answers.push(answer);
				let userAnswerElement = cell.querySelector('.chord');
				
				if (userAnswerElement) userAnswers.push(userAnswerElement.getAttribute('chord'));
				else userAnswers.push(null);
				
				accuracy.push(answers[index] === userAnswers[index]);
			});
			
			accuracy.forEach(function(measure, index) {
				assessmentResults.push({
					'Name': name,
					'Melody Listen Count (Full)': audioPlayCount,
					'Restart Count': restartCount,
					'Note Tested': answers[index],
					'Note Answered': userAnswers[index],
					'Correct Selection': measure,
					'Experiment': self.settings.condition,
					'Music Experience': musicExperience,
					'Timestamp': moment().format('L') + '-' + moment().format('LTS')
				});
			});
			
			startTime = new Date().getTime();
		},
		
		audioCursor: function() {
			
			var self = this;
			var timeCursor = document.querySelector('.time-cursor');
			var interval, duration, timeInterval, currentMeasure = -1, currentColor, queueChord;
			var cells = document.querySelectorAll('.answers .cells .cell');
			var currentNote = cells[0].getAttribute('answer');
			var optionCount = cells.length;
			
			var notes = [];
			cells.forEach(function(cell) {
				notes.push(cell.getAttribute('answer'));
			});
			
			let audioTracks = Object.keys(self.settings.audio);
			audioTracks.forEach(function(key) {
				let track = self.settings.audio[key];
				track.load();
				track.volume = .5;
			});
			
			audio.addEventListener('loadedmetadata', function() {
				duration = audio.duration;
				timeInterval = duration / optionCount;
			});
			
			audio.addEventListener('play', function() {
				
				if (!timeInterval) { // loadedmetadata decides to not fire often
					duration = audio.duration;
					timeInterval = duration / optionCount;
				}
				
				interval = setInterval(function() {
					
					let progress = audio.currentTime / duration * 100;
					timeCursor.style.left = progress.toString() + '%';
					
					if (currentMeasure !== Math.floor(audio.currentTime / timeInterval)) { // if interval has changed, reset
						
						cells.forEach(function(cell) {
							cell.classList.remove('active');
						});
						queueChord = true;
					}
					
					currentMeasure = Math.floor(audio.currentTime / timeInterval);
					currentNote = notes[currentMeasure];
					currentColor = self.settings[self.settings.condition][currentNote];
					
					if (queueChord && self.settings.audio[currentNote])  {
						
						let cell, chord, color, previousNote;
						cell = cells[currentMeasure];
						if (cell && cell.querySelector('button')) chord = cell.querySelector('button').getAttribute('chord'); // get user selected answer and then play it
						color = self.getColor(chord, self.settings.condition);
						if (self.settings.showBackgroundColors) body.style.backgroundColor = color;
						
						self.clearAudioBuffer();
						if (chord) {
							self.sendColorToDevice(color);
							self.settings.audio[chord].play();
						}
						else {
							self.sendColorToDevice('OFF');
							body.style.backgroundColor = defaultBackgroundColor;
						}
					}
					queueChord = false;
					
					if (cells[currentMeasure]) cells[currentMeasure].classList.add('active');
				}, 10);
				
				let instructions = document.querySelector('.instructions');
				if (instructions) instructions.style.display = 'none';
			});
			
			audio.addEventListener('pause', function() {
				clearInterval(interval);
				body.style.backgroundColor = defaultBackgroundColor;
			});
			audio.addEventListener('ended', function() {
				clearInterval(interval);
				body.style.backgroundColor = defaultBackgroundColor;
				audioPlayCount++;
			});
		},
		
		sendColorToDevice: function(color) {
			
			axios({
				method: 'post',
				url: 'https://io.adafruit.com/api/v2/kvnkey/feeds/color/data',
				data: { 
					"value": color
				},
				headers: {
					'content-type': "application/json",
					'x-aio-key': "cc7c424522214ee6ae2106eebed45135"
				},
			})
			.then(function(response) {
				//console.log(response);
			})
			.catch(function(error) {
				console.log('Error making request to Adafruit service to update color: ')
				console.log(error);
			});
		},
		
		getColor: function(chord, condition) {
			
			let self = this, color;
			if (chord && condition === 'test') {
				color = self.settings[condition][chord];
			}
			else if (chord && condition === 'interference') {
				color = colors[utils.randomInt(0, colors.length - 1)];
			}
			else {
				color = defaultBackgroundColor;
			}
			return color;
		},
		
		dragAndDrop: function() {
			
			let self = this;
			let from = document.querySelector('.controls');
			let to = document.querySelectorAll('.answers .cells .cell');

			new Sortable(from, {
				group: {
					name: 'musicAnswers',
					pull: 'clone',
					put: false
				},
				sort: false,
				swapThreshold: .01,
				onEnd: function (event) {
					
					let buttons = event.to.querySelectorAll('button');
					if (buttons.length > 1 && event.to.classList.contains('cell')) { // prevent double items in cell
						
						buttons.forEach(function(button) {
							if (button !== event.item) button.remove()
						});
					}
					self.addButtonEvents();
				}
			});
			
			to.forEach(function(cell) {
				
				new Sortable(cell, {
					group: {
						name: 'musicAnswers'
					},
					swapThreshold: .01,
					
					onEnd: function(event) {

						let fromButton = event.from.querySelector('button');
						if (fromButton === event.item && fromButton !== event.to) fromButton.remove(); // 2nd condition not working (when dragging back into place)
						
						if (event.to.childElementCount > 2) { // prevent double items in cell
							event.item.remove();
						}
						self.addButtonEvents();
					}
				});
			});
		},
		
		addButtonEvents: function() {
			
			let self = this;
			let buttonTimeout = null;
			let chordButtons = document.querySelectorAll('.chord');
			chordButtons.forEach(function(button) {
				
				button.addEventListener('click', function() {
					self.clearAudioBuffer();
					if (buttonTimeout) clearTimeout(buttonTimeout);
					let chord = button.getAttribute('chord');
					let color = self.getColor(chord, self.settings.condition);
					
					self.settings.audio[chord].play();
					self.sendColorToDevice(color);
					
					if (self.settings.showBackgroundColors) body.style.backgroundColor = color;
					buttonTimeout = setTimeout(function() {
						body.style.backgroundColor = defaultBackgroundColor;
						self.sendColorToDevice('OFF');
					}, 2000);
				});
			});
		},
		
		clearAudioBuffer: function() {
			
			let self = this;
			let audioTracks = Object.keys(self.settings.audio);
			audioTracks.forEach(function(key) {
				let track = self.settings.audio[key];
				track.load();
			});
		},
		
		bindEvents: function() {
			
			let self = this;
			let steps =  document.querySelectorAll('.step');
			steps.forEach(function(step) {
				
				let nextButton = step.querySelector('.next');
				if (nextButton) nextButton.addEventListener('click', function(event) {
					self.nextStep();
				});
				
				let prevButton = step.querySelector('.prev');
				if (prevButton) prevButton.addEventListener('click', function(event) {
					self.prevStep();
				});
			});
			
			let restartButton = document.querySelector('#restart');
			if (restartButton) restartButton.addEventListener('click', function(event) {
				audio.currentTime = 0;
				audio.play();
				restartCount++;
			});
			
			let downloadButton = document.querySelector('#download');
			if (downloadButton) downloadButton.addEventListener('click', function(event) {
				self.saveResults();
			});
			
			let experience = document.querySelector('#music-experience');
			if (experience) experience.addEventListener('change', function(event) {
				musicExperience = experience.value;
			});
			
			let nameField = document.querySelector('#fullName');
			if (nameField) nameField.addEventListener('keyup', function(event) {
				name = nameField.value;
			});
			
			let retryButton = document.querySelector('#retry');
			if (retryButton) retryButton.addEventListener('click', function(event) {
				
				self.goToBeginning();
				self.stopAndResetAllVideos();
				if (trialCount >= 3) {
					retryButton.style.display = 'none';
				}
			});
			
			let resultsButton = document.querySelector('#displayResults');
			if (resultsButton) resultsButton.addEventListener('click', function(event) {
				self.showResults();
			});
			
			let conditionButton = document.querySelector('#recordCondition');
			let conditionElement = document.querySelector('#condition');
			let colorOutputElement = document.querySelector('#colorOutput');
			let condition, colorOutputMode;
			if (conditionButton) conditionButton.addEventListener('click', function(event) {
				condition = conditionElement.value;
				colorOutputMode = colorOutputElement.value;
				if (condition === '') condition = conditions[utils.randomInt(0, 2)];
				self.settings.condition = condition;
				self.settings.colorOutputMode = colorOutputMode;
				if (colorOutputMode === 'hud') {
					
					self.settings.showBackgroundColors = false;
					
					colors = deviceColors;
					interferenceColors = utils.shuffle(deviceColors);
					self.settings.test.Am = colors[0];
					self.settings.test.C = colors[1];
					self.settings.test.F = colors[2];
					self.settings.test.G = colors[3];
					
					self.settings.interference.Am = interferenceColors[0];
					self.settings.interference.C = interferenceColors[1];
					self.settings.interference.F = interferenceColors[2];
					self.settings.interference.G = interferenceColors[3];
				}
			});
			
			let submitButton = document.querySelector('.submit');
			if (submitButton) submitButton.addEventListener('click', function(event) {
				self.generateAnswers();
			});
			
			self.addButtonEvents();
		},
		
		nextStep: function() {
			
			let self = this;
			body.style.backgroundColor = defaultBackgroundColor;
			audio.pause();
			
			let steps =  document.querySelectorAll('.step');
			for (let i = 0; i < steps.length; i++) {
				
				if (steps[i + 1] && steps[i].classList.contains('active')) {	
					steps[i].classList.remove('active');
					steps[i + 1].classList.add('active');
					startTime = new Date().getTime();
					break;
				}
			}
		},
		
		goToBeginning: function() {
			
			let self = this;
			let steps =  document.querySelectorAll('.step');
			for (let i = 0; i < steps.length; i++) {	
				steps[i].classList.remove('active');
			}
			steps[0].classList.add('active');
			self.reset();
		},
		
		prevStep: function() {
			
			let steps =  document.querySelectorAll('.step');
			for (let i = 0; i < steps.length; i++) {
				
				if (steps[i - 1] && steps[i].classList.contains('active')) {	
					steps[i].classList.remove('active');
					steps[i - 1].classList.add('active');
					startTime = new Date().getTime();
					break;
				}
			}
		},
		
		pickRandomMode: function() {
			
			let randomIndex = utils.randomInt(0, 2);
			
			this.settings.condition = conditions[randomIndex];
		},
		
		showResults: function() {
			
			document.querySelector('#displayResults').style.display = 'none';
			document.querySelector('.results-section').style.display = 'block';
			let resultsTable = document.querySelector('table.results');
			while (resultsTable.firstChild) { // remove all children
				resultsTable.removeChild(resultsTable.firstChild);
			}
			
			let tr = document.createElement('tr');
			if (tableHeadingAdded === false) {
				let thead = document.createElement('thead');
				thead.appendChild(tr);
				resultsTable.appendChild(thead);
				tableHeadingAdded = true;
			}
			
			Object.keys(assessmentResults[0]).forEach(function(key, index) {
				
				let columnHeading = document.createElement('td');
				
				columnHeading.appendChild(document.createTextNode(key));
				tr.appendChild(columnHeading);
			});
			
			let tbody = document.createElement('tbody');
			resultsTable.appendChild(tbody);
			
			assessmentResults.forEach(function(row) {
				let tr = document.createElement('tr');
				
				Object.keys(row).forEach(function(key) {
					
					let result = row[key];
					
					let td = document.createElement('td');
					td.appendChild(document.createTextNode(result));
					tr.appendChild(td);
				});
				
				tbody.appendChild(tr);
			});
		},
		
		saveResults: function() {
			
			let resultString = "";
			
			Object.keys(assessmentResults[0]).forEach(function(key, index) {
					
				resultString += key;
				if (index != Object.keys(assessmentResults[0]).length - 1) resultString += ',';
			});
			resultString += '\n';
			
			assessmentResults.forEach(function(row, rowIndex) {
				
				Object.keys(row).forEach(function(key, index) {
						
					let result = row[key];
					if (index !== Object.keys(row).length - 1) result += ',';
					resultString += result;
				});
				resultString += '\n';
			});
			
			var blob = new Blob([resultString], {type: "text/plain;charset=utf-8"});
			let nameInFile = '';
			if (name) nameInFile += name.replace(/\s/g, '-').toLowerCase();
			FileSaver.saveAs(blob, 'synethesia_' + nameInFile + '_' + moment().format('L') + '-' + moment().format('LTS') + '.csv');
		},
		
		reset: function() {
			
			startTime = new Date().getTime();
			trialCount++;
			document.querySelector('#trialCount').textContent = trialCount.toString();
			document.querySelector('#displayResults').style.display = 'block';
			document.querySelector('.results-section').style.display = 'none';
			tableHeadingAdded = false;
			selectedVideoWatchCount = 0;
		},
		
		setKeys: function() {
			
			document.addEventListener('keyup', function(event) {
				
				let enter = 13;
				
				if (event.keyCode === enter) {
					
				}
			});
		}
	};
};