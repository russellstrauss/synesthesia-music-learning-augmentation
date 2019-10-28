module.exports = function() {
	
	var assessmentResults = [];
	var startTime = new Date().getTime();
	
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
			
			let answerButtons = document.querySelectorAll('.assess-video .pagination .chord');
			
			answerButtons.forEach(function(button) {
				
				button.addEventListener('click', function(event) {
					
					let correct = button.getAttribute('correct') === 'true';
					assessmentResults.push({
						'correct': correct,
						'time': (new Date().getTime() - startTime) / 1000 + ' sec'
					});
					
					console.log(assessmentResults);
					startTime = new Date().getTime();
					self.nextStep();
				});
			});
			
			// let startVideo = document.querySelector('.start');
			// if (startVideo) startVideo.addEventListener('click', function() {
			// 	self.activateFullScreenVideo();
			// });
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
					break;
				}
				
				if (steps[i].classList.contains('assess-video')) {
					
					self.triggerNextChordVideo();
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
				}
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