$(document).foundation();

jQuery(document).ready(function($) {
  var $window = $(window),
      $header = $("header");

  // FitText Settings
    setTimeout(function() {
      $('h1.responsive-headline').fitText(1, {
        minFontSize: '40px',
        maxFontSize: '90px'
      });
    }, 100);

  // Smooth Scrolling
    $('.smooth-scroll').on('click', function (e) {
      e.preventDefault();

      var target = this.hash,
          $target = $(target);

      $('html, body').stop().animate({
        'scrollTop': $target.offset().top
      }, 800, 'swing', function () {
        window.location.hash = target;
      });
    });

  // Highlight the current section in the navigation bar
    var sections = $("section"),
        navigation_links = $("#nav-wrap a");

    sections.waypoint({
      handler: function(event, direction) {
        var active_section = $(this);

        if (direction === "up") {
          active_section = active_section.prev();
        }

        var active_link = $('#nav-wrap a[href="#' + active_section.attr("id") + '"]');

        navigation_links.parent().removeClass("current");
        active_link.parent().addClass("current");
      },
      offset: '35%'
    });

  // Make sure that #header-background-image height is equal to the browser height.
    function setHeaderHeight() {
      var wH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      if (wH < 800) {
        wH = 800;
      }

      $header.css({
        "height": wH + "px"
      });
    };

    setHeaderHeight();

    $window.on("resize", function() {
      setHeaderHeight();
    });

  // Fade In/Out Primary Navigation
    // $window.on('scroll', function() {
    //   var h = $('header').height(),
    //       y = $window.scrollTop(),
    //       nav = $('#nav-wrap');

    //   if ((y > h*.20) && (y < h) && ($window.outerWidth() > 768)) {
    //     nav.fadeOut('fast');
    //   } else {
    //     if (y < h*.20) {
    //       nav.removeClass('opaque').fadeIn('fast');
    //     } else {
    //       nav.addClass('opaque').fadeIn('fast');
    //     }
    //   }
    // });

  // PhotoSwipe - http://codepen.io/dimsemenov/pen/ZYbPJM/
    var initPhotoSwipeFromDOM = function(gallerySelector) {
      // Parse slide data (url, title, size ...) from DOM elements
      var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
          numNodes = thumbElements.length,
          items = [],
          figureEl,
          linkEl,
          size,
          item;

        for (var i = 0; i < numNodes; i++) {
          figureEl = thumbElements[i]; // <figure> element

          // include only element nodes
          if (figureEl.nodeType !== 1) {
            continue;
          }

          linkEl = figureEl.children[0]; // <a> element

          size = linkEl.getAttribute('data-size');
          if (size === null) {
            var metaTags = figureEl.querySelectorAll("meta"),
                width = null,
                height = null;

            console.log(metaTags.length);
            for (var j = 0; j < metaTags.length; j++) {
              if (metaTags[j].getAttribute("itemprop") === "width") {
                width = metaTags[j].getAttribute("content")
              }

              if (metaTags[j].getAttribute("itemprop") === "height") {
                height = metaTags[j].getAttribute("content")
              }
            };

            if (height === null) {
              height = width;
            }

            size = [width, height];
          } else {
            size = size.split('x');
          }
          console.log(size);

          // create slide object
          item = {
            src: linkEl.getAttribute('href'),
            w: parseInt(size[0], 10),
            h: parseInt(size[1], 10)
          };

          if (figureEl.children.length > 1) {
            // <figcaption> content
            item.title = figureEl.children[1].innerHTML;
          }

          if (linkEl.children.length > 0) {
            // <img> thumbnail element, retrieving thumbnail url
            item.msrc = linkEl.children[0].getAttribute('src');
          }

          item.el = figureEl; // save link to element for getThumbBoundsFn
          items.push(item);
        }

        return items;
      };

      // Find nearest parent element
      var closest = function closest(el, fn) {
        return el && (fn(el) ? el : closest(el.parentNode, fn));
      };

      // Triggers when user clicks on thumbnail
      var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
          return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if (!clickedListItem) {
          return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
          if (childNodes[i].nodeType !== 1) {
            continue;
          }

          if (childNodes[i] === clickedListItem) {
            index = nodeIndex;

            break;
          }

          nodeIndex++;
        }

        if (index >= 0) {
          // open PhotoSwipe if valid index found
          openPhotoSwipe(index, clickedGallery);
        }

        return false;
      };

      var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {
          // define gallery index (for URL)
          galleryUID: galleryElement.getAttribute('data-pswp-uid'),

          getThumbBoundsFn: function(index) {
            // See Options -> getThumbBoundsFn section of documentation for more info
            var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect();

            return {
              x: rect.left,
              y: rect.top + pageYScroll,
              w: rect.width
            };
          }
        };

        // PhotoSwipe opened from URL
        if (fromURL) {
          if (options.galleryPIDs) {
            // parse real index when custom PIDs are used
            // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
            for (var j = 0; j < items.length; j++) {
              if (items[j].pid == index) {
                options.index = j;

                break;
              }
            }
          } else {
            // in URL indexes start from 1
            options.index = parseInt(index, 10) - 1;
          }
        } else {
          options.index = parseInt(index, 10);
        }

        // exit if index not found
        if (isNaN(options.index)) {
          return;
        }

        if (disableAnimation) {
          options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
      };

      // Loop through all gallery elements...
      var galleryElements = document.querySelectorAll(gallerySelector);
      // ...and bind click event
      for (var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i + 1);
        galleryElements[i].onclick = onThumbnailsClick;
      }
    };

    // initPhotoSwipeFromDOM('#portfolio-wrapper');

  // Magnific Popup
    $('.portfolio-item a').magnificPopup({
      type: 'inline',
      fixedContentPos: false,
      removalDelay: 200,
      showCloseBtn: false,
      mainClass: 'mfp-fade'
    });

    $(document).on('click', '.popup-modal-dismiss', function(e) {
      e.preventDefault();

      $.magnificPopup.close();
    });

  // Flexslider
    $('.flexslider').flexslider({
      namespace: "flex-",
      controlsContainer: ".flex-container",
      animation: 'slide',
      controlNav: true,
      directionNav: false,
      smoothHeight: true,
      slideshowSpeed: 7000,
      animationSpeed: 600,
      randomize: false,
    });

  // Contact form
    $('form#contactForm button.submit').click(function() {
      $('#image-loader').fadeIn();

      var contactName = $('#contactForm #contactName').val(),
          contactEmail = $('#contactForm #contactEmail').val(),
          contactSubject = $('#contactForm #contactSubject').val(),
          contactMessage = $('#contactForm #contactMessage').val(),
          data = 'contactName=' + contactName +
              '&contactEmail=' + contactEmail +
              '&contactSubject=' + contactSubject +
              '&contactMessage=' + contactMessage;

      $.ajax({
        type: "POST",
        url: "inc/sendEmail.php",
        data: data,
        success: function(msg) {
          if (msg == 'OK') {
            // Message was sent
            $('#image-loader').fadeOut();
            $('#message-warning').hide();
            $('#contactForm').fadeOut();
            $('#message-success').fadeIn();
          } else {
            // There was an error
            $('#image-loader').fadeOut();
            $('#message-warning').html(msg);
            $('#message-warning').fadeIn();
          }
        }
      });

      return false;
    });
});
