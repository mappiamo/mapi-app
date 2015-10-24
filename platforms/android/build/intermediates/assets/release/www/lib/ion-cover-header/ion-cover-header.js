// custom directive to fade in the header bar after scrolling 

(function() {
  'use strict';

  angular
    .module('dbaq.ionCoverHeader', [])
    .directive('ionCoverHeader', IonCoverHeader);

  function IonCoverHeader() {

    /**
     * updates the background opacity of an element
     *
     * this method retrieves automatically the background RGB and set the alpha
     *
     * @param elem, the DOM element to update the background opacity
     * @param alpha, the opacity to apply, anything between 0 and 1.
     */
    var updateBackgroundAlpha = function(elem, alpha) {
      var currentColor = getComputedStyle(elem).getPropertyValue('background-color');
      var match = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*\d+[\.\d+]*)*\)/g.exec(currentColor);
      elem.style.backgroundColor = 'rgba(' + [match[1], match[2], match[3], alpha].join(',') + ')';
    };

    /**
     * shows the header bar
     *
     * @param header, the bar-header DOM element 
     * @param headerTitle, the title DOM element in the bar-header (could be null)
     * @param opaqueAt, the value in pixels where the bar-header should be totaly opaque
     * @param amt, the current scrolling value, the value in pixels from the top
     */
    var showHeader = function(header, headerTitle, opaqueAt, amt) {
      var fadeAmt = 1 - (Math.min(opaqueAt, amt) / opaqueAt);
      ionic.requestAnimationFrame(function() {
        updateBackgroundAlpha(header, (1 - fadeAmt));

        if (headerTitle) {
          headerTitle.style.opacity = (1 - fadeAmt);
        }
      });
    };

    /**
     * applies the required style on the header bar and the content
     *
     * - set the background opacity to 0
     * - set the .title element opacity to 0 if exists
     * - remove the background image of the header bar
     * - set the content top property to 0
     *
     * @param header, the bar-header DOM element 
     * @param headerTitle, the title DOM element in the bar-header (could be null)
     * @param content, the scroll-content DOM element
     */
    var initStyles = function(header, headerTitle, content) {
      //header bar background opacity to 0
      updateBackgroundAlpha(header, 0);
      //header bar background image to none
      header.style.backgroundImage = 'none';
      //header bar title opactity to 0
      if (headerTitle) {
        headerTitle.style.opacity = 0;
      }
      //set the content top property to 0
      content.style.top = 0;
    };

    return {
      restrict: 'A',
      link: function($scope, $element, $attr) {
        var opaqueAt = $attr.ionCoverHeader || 200;

        //retrieves elements that we need, the header bar, the header bar title, the content
        var headerElem = $element[0].querySelector('.bar-header');
        var contentElem = $element[0].querySelector('.scroll-content');

        //check if elems exist
        if (!headerElem) {
          console.error('ionCoverHeader - no .bar-header element found.');
          return;
        }
        if (!contentElem) {
          console.error('ionCoverHeader - no .scroll-content element found. Scroll must be enabled on your ion-content.');
          return;
        }

        var headerTitleElem = headerElem.querySelector('.title');

        //makes the header bar transparent and the content stick to the top
        initStyles(headerElem, headerTitleElem, contentElem);

        //binds the scroll event to the content
        angular.element(contentElem).bind('scroll', function(e) {
          var scrollTop = e.detail ? e.detail.scrollTop : (e.target ? e.target.scrollTop : null);
          var amt = scrollTop > 0 ? (opaqueAt - Math.max(0, (opaqueAt - scrollTop))) : 0;
          showHeader(headerElem, headerTitleElem, opaqueAt, amt);
        });
      }
    };
  }
})();