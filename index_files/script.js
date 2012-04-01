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
		
		//temporary
		$('#showToggle').click();
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
		
		function getSearchButton() {
			return $('#searchTextBtn');
		};
		
		function getContent() {
			return $('#content');
		};
		
		function getNext() {
			return $('#findNext');
		}
		
		function getPrev() {
			return $('#findPrev');
		}
		
		
		/**
		 * Get all the text on the page.
		 */
		finder.getText = function(element) {
			return $(element).text();
		}
		
		// Keep track of state
		finder.hasMatches = false;
		
		finder.textToSearch = '';
		
		/**
		 * Perform matching search
		 * @param <string> needle Text to find
		 * @param <string> haystack Text corpus to search
		 */
		finder.search = function(needle, haystack) {
			// Test whether string exists at all
			var pattern = new RegExp(needle);
			finder.textToSearch = haystack;
			
			if (finder.textToSearch.search(pattern) !== -1) {
				alert('yay');
				window.console.log(navigator.userAgent);
				// Build this for Mozilla/Webkit/Chrome first, add support for IE later
				if ($.browser.chrome == true) {
					window.console.log('sweet');
				}
				
			}
		};
		
		/**
		 * Do the actual highlighting.
		 */
		finder.highlight = function(needle, haystack) {
		
		};
		
		/**
		 * init
		 * Construct the finder div
		 */
		finder.init = function() {
			// Construct finder div
			var html = '<div class="findtoggle" id="showToggle"><a href="">Show page search</a></div><div id="findOnPage"><label for="searchText">Find</label><input type="text" id="searchText" name="searchText"><button id="searchTextBtn" name="searchTextBtn" value="Go">Go</button></div><div class="findtoggle" id="hideToggle"><a href="">Hide page search</a></div>';
			$('#content_wrapper').prepend($(html));
			
			// Click handlers
			$('#showToggle').click(function(e) {
				e.preventDefault();
				show();
			});
			
			$('#hideToggle').click(function(e) {
				e.preventDefault();
				hide();
			});
			
			$('#searchTextBtn').click(function(e) {
				var body = finder.getText(getContent());
				var query = $.trim(getSearchField().val());
				//window.console.log(body);
				if (query.length > 0) {
					getSearchField().css('background-color', '#FFFFFF');
					finder.search(query, body);
				} else {
					getSearchField().css('background-color', '#FF0000');					
				}
			});
			
		};
				
		return finder;
	})();
})(jQuery);
