var FileSaver = require('file-saver');

module.exports = function() {
	
	var assessmentResults = [];
	var startTime = new Date().getTime();
	var selectedVideo;
	var musicExperience = 'false';
	var name;
	var noteTested;
	var selectedVideoWatchCount = 0;
	
	return {
		
		settings: {
		},
		
		init: function() {

			this.bindEvents();
			this.setKeys();
			this.pickRandomVideo();
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
			
			
			let assessmentVideoContainers = document.querySelectorAll('.assess-video');
			assessmentVideoContainers.forEach(function(videoContainer) {
				
				let answerButtons = videoContainer.querySelectorAll('.pagination .chord');
				
				answerButtons.forEach(function(button) {
					
					button.addEventListener('click', function(event) {
						
						let correct = button.getAttribute('chord') === videoContainer.getAttribute('tested-chord') && button.getAttribute('chord') !== null;
						assessmentResults.push({
							'Name': name,
							'Melody Listen Count': selectedVideoWatchCount,
							'Note Tested': videoContainer.getAttribute('tested-chord'),
							'Note Answered': button.getAttribute('chord'),
							'Correct Selection': correct,
							'Time': (new Date().getTime() - startTime) / 1000 + ' sec',
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
		
		triggerNextChordVideo: function() {
			let nextVideo = document.querySelector('.assess-video.active video');
			if (nextVideo) nextVideo.play();
		},
		
		nextStep: function() {
			
			let self = this;
			let steps =  document.querySelectorAll('.step');
			for (let i = 0; i < steps.length; i++) {
				
				if (steps[i + 1] && steps[i].classList.contains('active')) {	
					steps[i].classList.remove('active');
					steps[i + 1].classList.add('active');
					startTime = new Date().getTime();
					
					if (steps[i + 1].classList.contains('assess-video')) { // start vid automatically
						self.triggerNextChordVideo();
					}
					
					if (steps[i + 1].classList.contains('results')) { // start vid automatically
						self.showResults();
					}
					
					break;
				}
			}
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
		
		pickRandomVideo: function() {
			
			let videos = document.querySelectorAll('.watch-video video');
			
			let randomVideoIndex = utils.randomInt(0, 2);
			
			videos.forEach(function(video, index) {
				
				if (index !== randomVideoIndex) {
					video.classList.remove('active');
				}
				else {
					video.classList.add('active');
					selectedVideo = video.getAttribute('id');
				}
				
				video.addEventListener('play', function() {
					if (selectedVideoWatchCount > 1) {
						video.pause();
						alert('The maximum melody play count is 2. You may now press "Begin" to start.');
					}
				});
				
				video.addEventListener('ended', function() {
					selectedVideoWatchCount++;
				});
			});
		},
		
		showResults: function() {
			
			let resultsTable = document.querySelector('table.results');
			
			let thead = document.createElement('thead');
			let tr = document.createElement('tr');
			thead.appendChild(tr);
			resultsTable.appendChild(thead);
			
			Object.keys(assessmentResults[0]).forEach(function(key) {
				if (key !== 'Assessment Video') {
					
					let columnHeading = document.createElement('td');
					
					columnHeading.appendChild(document.createTextNode(key));
					tr.appendChild(columnHeading);
				}
			});
			
			let tbody = document.createElement('tbody');
			resultsTable.appendChild(tbody);
			
			assessmentResults.forEach(function(row) {
				let tr = document.createElement('tr');
				
				Object.keys(row).forEach(function(key) {
					
					if (key !== 'Assessment Video') {
						
						let result = row[key];
						
						let td = document.createElement('td');
						td.appendChild(document.createTextNode(result));
						tr.appendChild(td);
					}
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
				
					console.log(index, Object.keys(row).length);
					if (index !== Object.keys(row).length - 1) result += ',';

					resultString += result;
				});
				resultString += '\n';
			});
			
			var blob = new Blob([resultString], {type: "text/plain;charset=utf-8"});
			console.log(resultString);
			FileSaver.saveAs(blob, 'synethesia_' + moment().format('L') + '-' + moment().format('LTS') + '.csv');
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