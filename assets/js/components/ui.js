module.exports = function() {
	
	var assessmentResults = [];
	var startTime = new Date().getTime();
	var selectedVideo;
	var musicExperience = 'false';
	var name;
	
	// setTimeout(function() {
		
	// 	var endTime = new Date().getTime();
	// 	console.log(endTime - startTime);
	// }, 2000);
	
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
			
			let experience = document.querySelector('#music-experience');
			if (experience) experience.addEventListener('change', function(event) {
				musicExperience = experience.value;
			});
			
			let nameField = document.querySelector('#fullName');
			if (nameField) nameField.addEventListener('keyup', function(event) {
				name = nameField.value;
			});
			
			let answerButtons = document.querySelectorAll('.assess-video .pagination .chord');
			answerButtons.forEach(function(button) {
				
				button.addEventListener('click', function(event) {
					
					let correct = button.getAttribute('correct') === 'true';
					assessmentResults.push({
						'Name': name,
						'Correct': correct,
						'Time': (new Date().getTime() - startTime) / 1000 + ' sec',
						'Assessment Video': selectedVideo,
						'Music Experience': musicExperience
					});
					
					startTime = new Date().getTime();
					self.nextStep();
				});
			});
		},
		
		triggerNextChordVideo: function() {
			let nextVideo = document.querySelector('.assess-video.active video');
			if (nextVideo) nextVideo.play();
		},
		
		activateFullScreenVideo: function() {
			
			let videos = document.querySelectorAll('video');
			videos.forEach(function(video) {
				video.classList.remove('fullscreen');
			});
			
			var video = document.querySelector('.watch-video.active video');
			video.classList.add('fullscreen');
			if (video.requestFullscreen) {
				video.requestFullscreen();
			}
			else if (video.mozRequestFullScreen) {
				video.mozRequestFullScreen();
			}
			else if (video.webkitRequestFullscreen) {
				video.webkitRequestFullscreen();
			}
			else if (video.msRequestFullscreen) {
				video.msRequestFullscreen();
			}
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
			});
		},
		
		showResults: function() {
			
			let resultsTable = document.querySelector('table.results');
			
			let thead = document.createElement('thead');
			let tr = document.createElement('tr');
			thead.appendChild(tr);
			resultsTable.appendChild(thead);
			
			Object.keys(assessmentResults[0]).forEach(function(key) {
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
		
		setKeys: function() {
			
			document.addEventListener('keyup', function(event) {
				
				let enter = 13;
				
				if (event.keyCode === enter) {
					
				}
			});
		}
	};
};