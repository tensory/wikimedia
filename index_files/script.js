/*
 * By Ari Lacenski
 * 03302012
 */
;(function($) {
	$(document).ready(function() {
		// Reset sizing on all document images
		Optimize.resetImageSizing($('img'));

		// Set up resize handlers for orientationchange events
		Optimize.bindOrientation();
		
		Finder.init();
	}); 
	
	/**
	 * Optimize module
	 * Offers display optimization functions 
	 */
	var Optimize = (function() {
		var optimize = {};
		
		// Private fns
		var fillResize = function(img) { 
			if ($(img).width() > $(window).width()) {
				$(img).css('width', '100%');
			}
		};
	
	/**
	 * resetImageSizing
	 * Forces images larger than the window to scale to 100% of available width
	 * @param <object> images Image group to scale
	 */
       optimize.resetImageSizing = function(images) {
	       $.each(images, function(index, img) {
		       // On image load, resize it if needed
		       $(img).bind('load', function() {
			       fillResize(img);
		       });
	       });			
       };
       
       /**
		 * bindOrientation
		 * Reset image widths to window width on 
		 */
		optimize.bindOrientation = function() {
			var checkOrientation = function() {
				fillResize($('img'));
			};
			window.addEventListener("resize", checkOrientation, false);
			window.addEventListener("orientationchange", checkOrientation, false);
		};
		
		return optimize;
	})();
	
	/**
	 * Find On Page module
	 * Offers display optimization functions 
	 */
	var Finder = (function() {
		var finder = {};
		
		finder.colors = {
			highlight: '#00FF00',
			error: '#FF0000',
			clear: '#FFFFFF'
		};
		
		finder.options = {
			startTag: '<span class="matches">',
			endTag: '</span>',
			matchClass: 'matches',
			onClass: 'enabled'
		};
		
		finder.current = 0;
		
		// Private fns
		var show = function() {
			$('#showToggle').hide();
			$('#findOnPage').show();
			$('#hideToggle').show();
		};
		
		var hide = function() {
			$('#findOnPage').hide();
			$('#hideToggle').hide();
			$('#showToggle').show();
		};
		
		function getSearchField() {
			return $('#searchText');
		};		
		
		function getContent() {
			return $('#content');
		};
		
		function getNext() {
			return $('#findNext');
		}
		
		function getPrevious() {
			return $('#findPrevious');
		}
		
		
		/**
		 * Get all the text on the page.
		 */
		finder.getText = function(element) {
			return $(element).text();
		}
		
		finder.searchBegan = false;
		
		/** 
		* Go to next or previous
		* @param <string> direction next or previous
		*/
		finder.move = function(direction) {
		   var directions = {
			   next: 'next',
			   back: 'back'
		   };
		   var matches = $('.' + finder.options.matchClass);
		   var currentIndex, nextIndex;
		   if (directions[direction].length > 0) {
			   if (direction == directions['next']) {
				   // Test whether a next exists
				   if (matches.length > finder.current) {
					   nextIndex = finder.current + 1;
				   } else {
					   nextIndex = 0;
				   }
			   } else if (direction == directions['back']) {
				   if (finder.current == 0) {
					   nextIndex = matches.length - 1;
				   } else {
					   nextIndex = finder.current - 1;
				   }
			   }
			   
			   // Modify classes on elements
			   $(matches[finder.current]).removeClass(finder.options.onClass);
			   $(matches[nextIndex]).addClass(finder.options.onClass);
			   finder.current = nextIndex;
		   } else {
			   return false; // Not a real argument
		   }
		};
		
		/**
		 * Apply highlights
		 * @param int position Location to highlight
		 * @param int length Number of characters to highlight
		 */
		finder.highlightAll = function(query) {
		  	var queryArray = [query];
 /*
  if (!document.body || typeof(document.body.innerHTML) == "undefined") {
    if (warnOnFailure) {
      alert("Sorry, for some reason the text of this page is unavailable. Searching will not work.");
    }
    return false;
  }
  */
	  		var bodyText = $('#content')[0].innerHTML;
	
			for (var i = 0; i < queryArray.length; i++) {
				bodyText = tagAll(bodyText, queryArray[i]);
			}
  
			$('#content')[0].innerHTML = bodyText;
			return true;
		};

		/**
		 * Search function borrowed from http://www.nsftools.com/misc/SearchAndHighlight.htm 
		 */ 		
		function tagAll(bodyText, searchTerm) {  
			// Find all occurrences of the search term in the given text,
			// and add some "highlight" tags to them (we're not using a
			// regular expression search, because we want to filter out
			// matches that occur within HTML tags and script blocks, so
			// we have to do a little extra validation)
			var newText = "";
			var i = -1;
			var lcSearchTerm = searchTerm.toLowerCase();
			var lcBodyText = bodyText.toLowerCase();
		
			while (bodyText.length > 0) {
				i = lcBodyText.indexOf(lcSearchTerm, i+1);
				if (i < 0) {
					newText += bodyText;
					bodyText = "";
				} else {
					// skip anything inside an HTML tag
					if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
					// skip anything inside a <script> block
						if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
							newText += bodyText.substring(0, i) + finder.options.startTag + bodyText.substr(i, searchTerm.length) + finder.options.endTag;
							bodyText = bodyText.substr(i + searchTerm.length);
							lcBodyText = bodyText.toLowerCase();
							i = -1;
						}
					}
				}
			}
			return newText;
		}

		/**
		 * clearTags
		 * Remove all prior search tags
		 */
		finder.clearTags = function() {
			$('.' + finder.options.matchClass).contents().unwrap();
		};
		
		/**
		 * init
		 * Construct the finder div
		 */
		finder.init = function() {
			// Construct finder div
			var html = '<div class="findtoggle" id="showToggle"><a href="">Show page search</a></div>' + 
			'<div id="findOnPage">' +
			'<a class="icons delete" id="hideToggle"></a>' +
			'<label for="searchText">Find</label>' + 
			'<input type="text" id="searchText" name="searchText">' +
				'<div id="findNav">' +
					'<a href="#" class="icons prev disabled" id="findPrevious"></a>' +
					'<a href="#" class="icons next" id="findNext"></a>' +
				'</div>' +
			'</div>';
			
			
			$('#content_wrapper').prepend($(html));
			
			$(getSearchField()).blur(function(e) {
				if ($(this).val().length > 0) {
					finder.searchBegan = false;
					finder.clearTags();
				}
			});
			
			// Click handlers
			$('#showToggle').click(function(e) {
				e.preventDefault();
				show();
			});
			
			$('#hideToggle').click(function(e) {
				e.preventDefault();
				// Destroy search information
				finder.clearTags();
				finder.searchBegan = false;
				hide();
			});
			
			/** 
			 * Highlight the next match, if any
			 */
			getNext().click(function(e) {
				e.preventDefault();
				finder.move('next');
			});
			
			getPrevious().click(function(e) {
				e.preventDefault();
				finder.move('back');
			});	
			
			// Assign different behavior to findNext depending on whether search has begun 
			$('#findNext').delegate(this, 'click', function(e) {
				e.preventDefault();
				window.console.log('clicked next');				
				if (finder.searchBegan) {
					finder.move('next');
				} else {
					// Clear any existing matches
					finder.clearTags();
					// Start over with new content				
					var body = finder.getText(getContent());
					var query = $.trim(getSearchField().val());
					//window.console.log(body);
					if (query.length > 0) {
						getSearchField().css('background-color', finder.colors.clear);
	
						finder.current = 0;
						if (body.search(new RegExp(query)) !== -1) {
							finder.highlightAll(query);
							
							// Enable first highlight
							var first = $('.' + finder.options.matchClass).get(finder.current);
							$(first).addClass('enabled');
							finder.searchBegan = true;
						}
					} else {
						//getSearchField().css('background-color', finder.colors.error);					
					}
				}
			});
		};
				
		return finder;
	})();
})(jQuery);
