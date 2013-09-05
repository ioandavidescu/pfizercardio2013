document.addEventListener('touchmove', function(e) { 	e.preventDefault();		 });

// Create CLI namespace if it doesn't already exist.
var CLI = CLI || {};

(function () {
	// Enable ECMAScript 5 'Strict Mode'.
    "use strict";
	// Slides Literal Object: Initialises iScroll
	// ------------------------------------------
	CLI.Slides = {
		cCount: null,
		oScroller: null,
		oSlideScrollTo: null,
		oSlideWidth: 1024,
		$indicator: null,
		$slides: null,
		$slide: null,
		scrollEl: null,
		swipeLeftLocation: null,
		swipeRightLocation: null,
		// Add iScroll.
		addScroll: function () {
			var t = this;
			// Count the total number of slide and mulitply 
			// by slide width to set slide container width.
			t.$slides.css('width', t.cCount * t.oSlideWidth + 'px');
			// Add `translate3d` to prevent flicker.
			t.$slide[0].style.webkitTransform = '-webkit-perspective: 1000; -webkit-backface-visibility: hidden;';
			// Create new iScroll instance and set options.
			t.oScroller = new iScroll(t.scrollEl, {
				momentum: false,
				bounce: false,
				hScrollbar: false,
				// Ensure iScroll snaps to `sections`.
				snap: t.$slides,
				vScroll: false,
				vScrollbar: false,
				onScrollEnd: function () {
					t.scrollEnd();
				}
			});
		},
		// Populate slide indicator.
		populateIndicator: function () {
			var t = this;			
			for (var i = 0; i < t.cCount; i++) {
				$('<li></li>').appendTo(t.$indicator);
			}
			t.$indicator.find('li').eq(0).addClass('active');
		},
		// On scroll end update slide indicator 
		// and call onScrollEndCallback.
		scrollEnd: function () {
			var cSlide = CLI.Slides.oScroller.currPageX;
			// Call onScrollEndCallback
			if (typeof CLI.onScrollEndCallback === 'function') {
				CLI.onScrollEndCallback();
			}
			// Update slide indicator if `#Indicator` exists.
			if (CLI.Slides.$indicator.length) {
				CLI.Slides.$indicator.find('li').removeClass('active');
				CLI.Slides.$indicator.find('li').eq(cSlide).addClass('active');
			}
		},
		getSlideHash: function () {
			var getHash = parseInt(window.location.hash.toLowerCase().split('#slide')[1], 10);
			if (!getHash) { return false; }
			return getHash;
		},
		pageSwipeUpdateLocation: function () {
			if(CLI.Slides.swipeLeftLocation != null) {				
				CLI.Slides.$slide.last().on('swipeLeft', function() {
					//console.log('swipeLeftLocation: '+CLI.Slides.swipeLeftLocation);
					CLI.Slides.passSectionTrack(CLI.Slides.swipeLeftLocation)	
				});	
			}
			if(CLI.Slides.swipeRightLocation != null) {				
				CLI.Slides.$slide.first().on('swipeRight', function() {
					//console.log('swipeRightLocation: '+CLI.Slides.swipeRightLocation);
					CLI.Slides.passSectionTrack(CLI.Slides.swipeRightLocation)
				});
			}
		},
		passSectionTrack: function (passLinkLocation) {
			sessionStorage.setItem("trackDuration", CLI.Tracking.trackDuration());
			setTimeout(function () {				
				window.location = passLinkLocation;
			}, 200);
		},
		init: function () {
			var t = this,
				scrollX,
				slideHash = t.getSlideHash();
			// Assign dom elements.
			t.$indicator = $('#Indicator'); // Indicator container.
			t.$slides = $('#Slides'); // Slide container.
			t.$slide = $('.slide'); // Individual slide.
			t.scrollEl = "Wrapper"; // iScroll element.
			// Get number of slides.
			t.cCount = $('.slide').length;			
			// If `.slide` is present more than once
			// **intialise iScroll**.
			if (t.cCount > 1) {
				t.addScroll();
				t.populateIndicator();				
			}
			// If `#` exists, **load iScroll at correct slide**.
			if (slideHash) {
				scrollX = -t.oSlideWidth * (slideHash - 1);
				t.oScroller.currPageX = slideHash - 1;
				t.oScroller.scrollTo(scrollX, 0);
				// Remove hash to re-apply slide to.
				window.location.hash = '';
			}
			// **Slide to** - Watch for hashchange and slide to.
			$(window).bind('hashchange', function (e) {
				// Make sure we've got a slide.
				if (t.getSlideHash()) {
					// Slide iScroll to new slide.
					t.oScroller.scrollToPage((t.getSlideHash() - 1));
					// Remove hash to re-apply slide to.
					window.location.hash = '';
				}
			});
		}
	};
	// Popups Literal Object
	// ----------------------
	CLI.Popups = {
		// Adds a class of `.bgfix` to element to hide additional overlays.
		toggleOverlayBackground: function (el) {
			if ($(el).hasClass('bgfix')) {
				$(el).removeClass('bgfix');
			} else {
				$(el).addClass('bgfix');
			}
		},
		// Toggle popups - Overlays.
		overlays: function () {
			var $overlays = $('#Overlays'),
				$overlay = $('.overlay'),
				$overlayCta = $('.overlay-cta'),
				$overlayClose = $('.overlay-close'),
				overlayActive = 'overlay-active',
				showOverlays,
				hideOverlays;
			if ($overlays.length) {
				// Show overlay.
				showOverlays = function (e) {
					e.preventDefault();
					var tOverlayId = $(this).attr("href");
					$overlays.show();
					$(tOverlayId).addClass(overlayActive);
				};
				// Hide overlay.
				hideOverlays = function (e) {
					e.preventDefault();
					$overlays.hide();
					$overlay.removeClass(overlayActive);
				};
				// Bind touch event using `.live()` method to ensure 
				// the selector is bound, now and in the future.
				$overlayCta.live(CLI.G.touchEvent, showOverlays);
				$overlayClose.live(CLI.G.touchEvent, hideOverlays);
				$overlay.on('touchmove', function(e){ 
					e.preventDefault(); 
				});
			}
		},
		// Toggle popups - References.
		references: function () {
			var $references = $('#References'),
				$reference = $('.reference'),
				$referenceCta = $('.reference-cta, .reference-cta-abs'),
				$referenceClose = $('.reference-close'),
				referenceActive = 'reference-active',
				showReferences,
				hideReferences;
			if ($references.length) {
				// Show reference.
				showReferences = function (e) {
					e.preventDefault();
					var tReferenceId = $(this).attr("href");
					$references.show();
					$(tReferenceId).addClass(referenceActive);
					// Add .bgfix to #Overlays.
					CLI.Popups.toggleOverlayBackground('#Overlays');
				};
				// Hide reference.
				hideReferences = function (e) {
					e.preventDefault();
					$references.hide();
					// Remove `.reference-active` class from current reference.
					$reference.removeClass(referenceActive);
					// Remove `.bgfix` from `#Overlays`.
					CLI.Popups.toggleOverlayBackground('#Overlays');
				};
				// Bind touch event using `.live()` method to ensure 
				// the selector is bound, now and in the future.
				$referenceCta.live(CLI.G.touchEvent, showReferences);
				$referenceClose.live(CLI.G.touchEvent, hideReferences);
			}
		},
		tabs: function () {
			var $panels = $('.tab-wrapper article'),
				$tabs = $('.tab-wrapper .tabs a, .tab-wrapper a.tab'),
				showTab;
			
			if ($panels.length) {				
				showTab = function (e) {
					e.preventDefault();	
					var tTabId = $(this).attr("href");
					//limit filtering to current wrapper
					$(this).parents('.tab-wrapper').find('article').removeClass('tab-active');
					$(tTabId).addClass('tab-active');
					e.stopPropagation();
				};
				$tabs.on(CLI.G.touchEvent, showTab);				
			}
		},	

		init: function () {
			var t = this;
			t.overlays();
			t.references();
			t.tabs();
		}
	};
	// Global Literal Object: Site-wide functions 
	// -------------------------------------------
	CLI.G = {
		touchEvent: null,
		// Include navigation functionality here.
		navigation: function () {
			var $menu = $('#accordionMenu'),
				$menuLink =  $('#accordionMenu li a'),
				$handle = $('nav').find('#dropDown a'),
				getCurrentHTMLPage = document.location.pathname.slice(1),
				showMenu,
				hideMenu,
				expandMenu;

			showMenu = function (e) {
				e.preventDefault();
				if( !$(this).hasClass('active') ){
					$(this).addClass('active');
					$('#accordionMenu').addClass('reveal');
				} else {
					hideMenu();
				}
			};

			hideMenu = function () {
				$menu.find('ul').height('0');
				$menu.find('li').removeClass('active');
				setTimeout(function() {
					$handle.removeClass('active');
					$menu.removeClass('reveal');
				},200)
			};

			expandMenu = function (e) {
				e.preventDefault();
				var url = $(this).attr("href"),
					$resetheights = $('ul', '#accordionMenu'),
					$levelCheck = $(this).closest('ul').children('li'),
					activeParent = $(this).closest('ul').parent().hasClass('active'),
					subItemCount = $(this).next('ul').children().length,
					subItemHeight = (subItemCount) * 40,
					parentChildCount = $(this).closest('ul').children().length,
					parentheight = subItemHeight + (parentChildCount * 40);

				if (url == '#') {					
					if ( !$(this).closest('ul').hasClass('active') && activeParent == true ) {
						$levelCheck.removeClass('active');
						$levelCheck.find('ul').height('0');
						$(this).next().height(subItemHeight);
						$(this).closest('ul').height(parentheight);						
						$(this).parent().addClass('active');
					} else if ( !$(this).parent().hasClass('active') ) {
						$resetheights.height('0');
						$levelCheck.removeClass('active');
						$(this).next().height(subItemHeight);
						$(this).parent().addClass('active');						
					} else {
						return false;
					}
				} else {
					window.location = url
				}
			};
			
			$handle.bind(CLI.G.touchEvent, showMenu); 
			$('#Content').bind(CLI.G.touchEvent, hideMenu);
			$menuLink.bind(CLI.G.touchEvent, expandMenu);
			//If link is the same as the current html page do not track
			setTimeout(function() {				
				$('#accordionMenu a[href*="' + getCurrentHTMLPage + '"]').addClass('no-track');
			}, 300)
		},
		// Animation loop
		animationLoop: function (animSpeed) {
			var seqAnimation = $('ul.animate li');
			var showImage;
			
			if (seqAnimation.length) {	
				setTimeout(function(){
					$('.bg-flick').addClass('reveal');
				}, 300)				
				setTimeout(function () {	
					showImage = function (i, seqAnimation) {
						setTimeout(function () {
							$(seqAnimation[i]).addClass('show');
						}, i * animSpeed)
					};
		
					for (var i = 0; i < seqAnimation.length; i++) {
						showImage(i, seqAnimation);
					}
				}, 700)
			}
		},
		// Sets `touchstart` touch event as a string
		// if viewing on an iPad and `click` if using a
		// browser. Note that `touchstart` is noticeably 
		// faster on the iPad.
		renderTouchEvent: function () {
			if (navigator.userAgent.match(/iPad/i)) {
				CLI.G.touchEvent = "touchstart";
			} else {
				CLI.G.touchEvent = "click";
			}
		},
		// Exit application in PM3 by adding `[data-role="exit"]`
		// to DOM element.
		exitApp: function () {
			var $exitApp = $('[data-role="exit"]'), exit;
			exit = function (e) {
				e.preventDefault();
				window.setTimeout(function () {
					window.location = 'call?cmd=exit';
				}, 200);
			};
			$exitApp.bind(CLI.G.touchEvent, exit);
		},
		init: function () {
			var t = this;
			t.renderTouchEvent(); //Every function depends on this, therefore define it first, otherwise touch event = null.
			t.navigation();						
			t.exitApp();
		}
	};
	
	// Videos
  	// -------------------------------------------
  	CLI.Videos = {

  		oSlides: null,
  		oSlide: null,
  		oLastVideo: null,
  		cLastX: null,
  		cPageX: null,

	  	init : function() {
	  		CLI.Videos.oSlides =  $('#Slides .slide'),

	  		CLI.Videos.cPageX = parseInt(CLI.Slides.oScroller.currPageX,10);

	      	// If page hasn't changed
	      	if ( CLI.Videos.cPageX === CLI.Videos.cLastX ) { return; }

	      	// Update cLastX
	      	CLI.Videos.cLastX = CLI.Videos.cPageX;

	     	// Stop current video playing
	      	if ( CLI.Videos.oLastVideo ) {
	      		CLI.Videos.oLastVideo.pause();
	      		CLI.Videos.oLastVideo.currentTime = 0.0;
	      	}

	      	CLI.Videos.oSlide = $(CLI.Videos.oSlides.get(CLI.Videos.cPageX));

	      	if ( CLI.Videos.oSlide.data('video') ) {

		        // Get video element
		        var tVideo = CLI.Videos.oSlide.find('video');
		        var tVideo0 = tVideo[0];
		        CLI.Videos.oLastVideo = tVideo0;
		        var tVideoLength = CLI.Videos.oSlide.data('video-length');
		        //var tVideoTitle = CLI.Videos.oSlide.find('.video-title');
		        // Force video to play then puase
		        tVideo0.play();

		        // Remove any existing timeupdate events
		        tVideo.off('timeupdate');
		        // Bind one time event to time update for video end
		        tVideo.on('timeupdate', function() {

		        	// On ready state, bring video into view
		          	if ( tVideo0.readyState > 0 ) {
		          	tVideo.css('-webkit-transform', 'translateX(0)');
		        	}

		        	tVideo0.addEventListener('ended', function(){
		          		$('img.shim').addClass('show');
		          		$('video').addClass('hide');
			          	setTimeout(function () {
			          		$('video').hide();
			          	}, 700);
		          	});
		      	});
	    	}
		}
	};

	// Load everything once the DOM is ready, using Zepto.ready.
	$(function () {
		
		CLI.G.init();
		CLI.Popups.init();
		// Only load iScroll if slides exist.
		if ($('.slide').length) { CLI.Slides.init(); }
		// Call onLoadCallback if it exists.
		if (typeof CLI.onLoadCallback === 'function') {
			CLI.onLoadCallback();
		}
		CLI.Slides.pageSwipeUpdateLocation();
		// Handles Dropdown navigation and Secondary navigation
		$('.liveLink a').on( CLI.G.touchEvent, function(e) {
			e.preventDefault(); 
			var passLinkLocation = $(this).attr('href');			
			if( $(this).parents('#dropDown').length ) {
				return false;
			} else if ( !$(this).hasClass('no-track') ) {				
				CLI.Slides.passSectionTrack(passLinkLocation)
			} 
		});

		// Call trakcing function to handle links to sections other than the one you're currently in.
		if ( $('section a.defer-link').length ) {
			$('section a.defer-link').on( CLI.G.touchEvent, function(e) {
				e.preventDefault();
				var passLinkLocation = $(this).attr('href');
				CLI.Slides.passSectionTrack(passLinkLocation)
			});
		}		

		// Tracking links to sections other than the one you're currently in.
		function skipSectionTracker(e, passLinkLocation) {
			e.preventDefault();
			CLI.Slides.passSectionTrack(passLinkLocation);			
		}

	});
	
}());