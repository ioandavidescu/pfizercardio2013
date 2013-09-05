//  CreativeLynx PM3 iPad Boilerplate  2.0
//  --------------------------------------

//  Author: [CreativeLynx](http://http://creativelynx.com//)

// Uses: [zepto.js](http://http://zeptojs.com/).

// Config settings for [JSHint](http://www.jshint.com/)
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50, white:true, plusplus:false */

// Create CLI namespace if it doesn't already exist.
var CLI = CLI || {};
// **payload** needs to be a global variable for PM3.
var payload;
var platform = "veeva";
(function () {
	// Enable ECMAScript 5 'Strict Mode'.
    "use strict";
	CLI.Tracking = {
		slideCurrent: null,
		slideStack: null,
		touchEvent: null,		
		startTime: null,
		timeSpentRaw: null,
		timeSpent: null,
		// Sets `touchstart` touch event as a string
		// if viewing on an iPad and `click` if using a
		// browser. Note that `touchstart` is noticeably 
		// faster on the iPad. Also added to keep consistant
		// with touch events created in `scripts.js` as 
		// `touchstart` can conflict with `click` events
		// in Mobile Safari.
		renderTouchEvent: function () {
			if (navigator.userAgent.match(/iPad/i)) {
				CLI.Tracking.touchEvent = "touchstart";
			} else {
				CLI.Tracking.touchEvent = "click";
			}
		},		
		trackCurrTime: function() {
			var t = this;
			var startTime = new Date().getTime();
			t.startTime = startTime;
			return t.startTime;
		},
		trackDuration: function() {			
			var t = this,
				secondsToString;
			// Return a human readable time format.
			secondsToString = function(seconds) {
				seconds = (seconds / 1000);

				var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
				var numseconds = ((seconds % 86400) % 3600) % 60;

				return numminutes + " minutes ; " + Math.round(numseconds) + " seconds";
			};			
			var timeSpentRaw = new Date().getTime() - t.startTime; 
			t.timeSpent = secondsToString(timeSpentRaw);
			
			//Now we retreive the previous tracking data from the session storage

			// Reset time at this point.
			t.trackCurrTime();
			console.log('Time-spent ' +t.timeSpent)
			return t.timeSpent;			
			
			
		},
		// Track the current page.
		trackPage: function (page) {
			var t = this,
				slideNum = 1;
			if (page && page !== 0) {
				slideNum = page;
			}
			t.trackSlide(slideNum);
		},
		// Track the current slide, gets the current page 
		// from `data-page`.
		trackSlide: function (slide) {
			var t = this,
				curSlide = $('[data-page="' + slide + '"]');
			t.trackView(curSlide);
		},
		// Track the current view and send data to PM3.
		trackView: function (element) {
			
			var t = this,
				viewTitle = $(element).data('tracking-title'),
				viewId = $(element).data('tracking-id'),
				track = $(element).data('track'),
				
			
			payload = viewTitle + ', ' + viewId ;
			
			// Send tracking data.
			if ((viewId !== t.slideCurrent)) {
				if (track === "false") {
					t.slideCurrent = viewId;
					
					// If `[data-track="false"]` exists
					// call no tracking function.
					if( platform == 'pm3' ){ 
						return t.noTrack(track);
					}	
				}
				// If element has a tracking id, send data to PM3.
				if (typeof viewId !== "undefined" && viewId !== null ) {
					console.log('View ID not == to undefined or null: ' + viewId)
					window.setTimeout(function () {
							//track duration needs to run before session is set
							t.trackDuration();

							if ( CLI.Tracking.timeSpent !== '0 minutes ; 0 seconds' ) {
								sessionStorage.setItem("trackDuration", CLI.Tracking.timeSpent);
								saveSlideStreamData(sessionStorage.getItem("trackID"), sessionStorage.getItem("trackTitle"), sessionStorage.getItem("trackDuration"))

							} else if ( sessionStorage.getItem("trackDuration") != null ) {
								saveSlideStreamData(sessionStorage.getItem("trackID"), sessionStorage.getItem("trackTitle"), sessionStorage.getItem("trackDuration"))
							}					
							
							sessionStorage.setItem("trackID", viewId);
							sessionStorage.setItem("trackTitle", viewTitle);
							
					}, 100);
					t.slideCurrent = viewId;
					
				}
			}
		},
		// Get checkbox/radio values.
		getCheckedValue: function (radioObj) {
			var radioLength, i;
			if (!radioObj) {
				return false;
			}
			radioLength = radioObj.length;
			if (radioLength === undefined) {
				if (radioObj.checked) {
					return radioObj.value;
				} else {
					return false;
				}
			}
			for (i = 0; i < radioLength; i++) {
				if (radioObj[i].checked) {
					return radioObj[i].value;
				}
			}
			return false;
		},
		// Returns radio answer values.
		getSingleAnswer: function (question) {
			var t = this,
				groupName = $(question).find('input').attr('name'), 
				checked = t.getCheckedValue($('[name="' + groupName + '"][type=radio]', question)), 
				option = $('[value="' + checked + '"]', question), 
				answerId = option.data('tracking-id');
			return answerId;
		},
		// Returns checkbox answer values.
		getMultiAnswers: function (questions) {
			var options = [], 
				groupName = $(questions).find('input').attr('name');
			$('input[name="' + groupName + '"]:checked').each(function () {
				options.push($(this).data('tracking-id'));
			});
			return options;
		},
		// Returns Bool answer.
		getBoolAnswer: function (question) {
			var t = this,
				groupName = $(question).find('input').attr('name'), 
				radios = $('[name="' + groupName + '"][type=radio]', question), 
				checkbox = $('[name="' + groupName + '"][type=checkbox]', question).first(),
				value = false;
			if (radios.length > 0) {
				value = t.getCheckedValue(radios);
			}
			else {
				if (checkbox.is(':checked')) {
					value = true;
				}
			}
			return value;
		},
		// Returns text answer.
		getTextAnswer: function (question) {
			var text = $(question).find('input').val();
			return text;
		},
		// Returns number answer.
		getNumberAnswer: function (question) {
			var number = $(question).find('input').val();
			return parseFloat(number);
		},
		// Logs the form data and sends the payload 
		// to the presentation manager.
		logExercise: function (e) {
			e.preventDefault();
			var exerciseForm = $(this).closest('form'), 
				exerciseId = exerciseForm.data('tracking-id'),
				exercise = {},
				answers = [];
			exercise.TrackingId = exerciseId;
			// Loop through each `[data-track="question"]` and get form data.	
			$('[data-track="question"]').each(function (index, element) {
				var questionType = $(this).data('question-type'), 
					questionId = $(this).data('tracking-id'), 
					answer = {};
				answer.TrackingId = questionId;
				answer.Type = questionType;
				// Process each question type.
				if (questionType === 'single') {
					var option = CLI.Tracking.getSingleAnswer(this);
					if (option !== undefined) {
						answer.Option = option;
						answers.push(answer);
					}
				}
				if (questionType === 'multi') {
					var options = CLI.Tracking.getMultiAnswers(this);
					if (options !== undefined && options.length > 0) {
						answer.Options = options;
						answers.push(answer);
					}
				}
				if (questionType === 'bool') {
					var value = CLI.Tracking.getBoolAnswer(this);
					if (value !== '') {
						// Sets the string to a boolen value,
						// this tracking data won't be captured 
						// by PM3 otherwise.
						value = value === "true" ? true : false;
						answer.Value = value;
						answers.push(answer);
					}
				}
				if (questionType === 'text') {
					var text = CLI.Tracking.getTextAnswer(this);
					if (text !== '') {
						answer.Text = text;
						answers.push(answer);
					}
				}
				if (questionType === 'number') {
					var number = CLI.Tracking.getNumberAnswer(this);
					answer.Number = number;
					answers.push(answer);
				}	
			});
			exercise.Answers = answers;
			payload = JSON.stringify(exercise);
			
			// Log data or send to presentation manager depending on platform.
			if ( navigator.userAgent.match(/iPad/i) && platform == 'pm3') {
				setTimeout(function () {
					window.location = "?cmd=track&type=exercise";
				}, 200);
			} else {
				console.log(exerciseId + " = " + payload);
			}

		},
		// Track overlays on click event. Add the following
		// data attributes to DOM element. 
		// `[data-track="o-open"]` `[data-track="o-close"]`.
		overlayTracking: function () {
			var $overlayOpen = $('[data-track="o-open"]'),
				$overlayClose = $('[data-track="o-close"]'),
				slideStack = [];
			$overlayOpen.on(CLI.Tracking.touchEvent, function (e) {
				var currSlide = $(this).closest('[data-page]'),
					overlayId = $(this).attr("href");
				slideStack.push(currSlide);
				CLI.Tracking.trackView($(overlayId));
			});
			$overlayClose.on(CLI.Tracking.touchEvent, function (e) {
				var prevSlide = slideStack.pop();
				CLI.Tracking.trackView(prevSlide);
			});
		},
		//Track tabs and videos
		eventTracking: function () {
		 	var $tabClick = $('.tabs li a, .vidlink, .tab');

		 	$tabClick.on(CLI.Tracking.touchEvent, function (e) {
		 		
		 		var viewTitle = $(this).data('tracking-title');
		 		var viewId = $(this).data('tracking-id');				
				
				saveClickStreamData(viewTitle, viewId);
		 	});			
		},
		// Track slide when CLI.Slides.scrollEnd is called. 
		slideTracking: function () {
			var oldScroll = CLI.Slides.scrollEnd;
			CLI.Slides.scrollEnd = function () { 
				oldScroll(); 
				CLI.Tracking.trackSlide(CLI.Slides.oScroller.currPageX + 1); 
			};
		},
		// Track exercise on click event.
		exerciseTracking: function () {
			var $submit = $('[data-track="submit"]');
			$submit.on(CLI.Tracking.touchEvent, CLI.Tracking.logExercise);
		},

		// Call page tracking when user lands
		// on the page.
		pageTracking: function () {
			// Test for #slideX on has if present asign it to hasSlide.
			var hashSlide = window.location.hash.split('#slide')[1];
			setTimeout(function () {
				//console.log(hashSlide);
				CLI.Tracking.trackPage(hashSlide);
			}, 100);
		},
		// If element isn't being tracked add the
		// following data attribute `[data-track="false"]`.
		noTrack: function (track) {
			if (track === "false") {
				window.setTimeout(function () {
					if ( navigator.userAgent.match(/iPad/i) ) {
						window.location = "?cmd=notrack";
					} else {
						console.log("No track");
					}
				}, 100);
			}
		},
		// Initilise tracking.
		init: function () {
			var t = this;
			t.renderTouchEvent();
			t.overlayTracking();
			t.eventTracking();
			t.slideTracking();
			t.exerciseTracking();
			t.pageTracking();
			t.trackCurrTime();
		}
	};
	// Load everything once the DOM is ready, using Zepto.ready.
	$(function () { CLI.Tracking.init(); });
}());


// Veeva tracking 
function saveSlideStreamData(slideData, slideName, duration){
	var slideStream = {};
	slideStream.Track_Element_Id_vod__c = slideData
	slideStream.Track_Element_Type_vod__c = slideName
	slideStream.Range_Value_vod__c = duration
	var slideJSONText = JSON.stringify(slideStream);

	if(navigator.userAgent.match(/iPad/i)){
		request = "veeva:saveObject(Call_Clickstream_vod__c),value(" + slideJSONText + "),callback(savedClickstream)";
		setTimeout(function(){document.location = request;},100);
		
	}else{
		console.log('VEEVA: ' + slideJSONText) ;
	}
}

function saveClickStreamData(title, clickedData){
	
	var clickStream = {};
	
	clickStream.Track_Element_Type_vod__c = title
	clickStream.Selected_Items_vod__c = clickedData
	clickStream.Survey_Type_vod__c = "freetext"
	clickStream.Text_Entered_vod__c = "textarea"
	var clickJSONText = JSON.stringify(clickStream);
	if(navigator.userAgent.match(/iPad/i)){
		request = "veeva:saveObject(Call_Clickstream_vod__c),value(" + clickJSONText + "),callback(savedClickstream)";
		setTimeout(function(){document.location = request;},100);
	}else{
		console.log('Click Data' + clickJSONText) ;
	}
	
}
// End of Veeva tracking 