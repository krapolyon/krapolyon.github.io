 /* https://www.w3.org/WAI/tutorials/carousels/full-code/ */

/* Focusin/out event polyfill (for Firefox) by nuxodin
 * Source: https://gist.github.com/nuxodin/9250e56a3ce6c0446efa
 */

!function(){
  var w = window,
  d = w.document;

  if( w.onfocusin === undefined ){
    d.addEventListener('focus' ,addPolyfill ,true);
    d.addEventListener('blur' ,addPolyfill ,true);
    d.addEventListener('focusin' ,removePolyfill ,true);
    d.addEventListener('focusout' ,removePolyfill ,true);
  }
  function addPolyfill(e){
    var type = e.type === 'focus' ? 'focusin' : 'focusout';
    var event = new CustomEvent(type, { bubbles:true, cancelable:false });
    event.c1Generated = true;
    e.target.dispatchEvent( event );
  }
  function removePolyfill(e){
if(!e.c1Generated){ // focus after focusin, so chrome will the first time trigger two times focusin
  d.removeEventListener('focus' ,addPolyfill ,true);
  d.removeEventListener('blur' ,addPolyfill ,true);
  d.removeEventListener('focusin' ,removePolyfill ,true);
  d.removeEventListener('focusout' ,removePolyfill ,true);
}
setTimeout(function(){
  d.removeEventListener('focusin' ,removePolyfill ,true);
  d.removeEventListener('focusout' ,removePolyfill ,true);
});
}
}();

/*
   Carousel Prototype
   Eric Eggert for W3C
*/

var myCarousel = (function() {

  "use strict";

  // Initial variables
  var carousel, slides, index, slidenav, settings, timer, setFocus, transition, announceItem, animationSuspended;


  // Helper function: Iterates over an array of elements
  function forEachElement(elements, fn) {
    for (var i = 0; i < elements.length; i++)
      fn(elements[i], i);
  }

  // Helper function: Remove Class
  function removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  // Helper function: Test if element has a specific class
  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
  }


  // Helper function: Add Class
  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      if (! hasClass(el, className)) {
        el.className += " " + className;
      }
    }
  }

  // Initialization for the carousel
  // Argument: set = an object of settings
  // Possible settings:
  // id <string> ID of the carousel wrapper element (required).
  // slidenav <bool> If true, a list of slides is shown.
  // animate <bool> If true, the slides can be animated.
  // startAnimated <bool> If true, the animation begins
  //                        immediately.
  //                      If false, the animation needs
  //                        to be initiated by clicking
  //                        the play button.
  function init(set) {

    // Make settings available to all functions
    settings = set;

    // Select the element and the individual slides
    carousel = document.getElementById(settings.id);
    slides = carousel.querySelectorAll('.carousel__slide');

    if (! hasClass(carousel, 'carousel')) {
      addClass(carousel, 'carousel');
    }
    addClass(carousel, settings.class);

    // Create unordered list for controls, and attach click events to previous and next slide
    var ctrls = document.createElement('ul');

    ctrls.className = 'list carousel__controls';
    ctrls.innerHTML = '<li class="list-item carousel__control-item">' +
        '<button type="button" class="btn carousel__btn carousel__btn--prev"></button>' +
      '</li>' +
      '<li>' +
        '<button type="button" class="btn carousel__btn carousel__btn--next"></button>' +
      '</li>';

    ctrls.querySelector('.carousel__btn--prev')
      .addEventListener('click', function () {
        prevSlide(true);
      });
    ctrls.querySelector('.carousel__btn--next')
      .addEventListener('click', function () {
        nextSlide(true);
      });

    carousel.appendChild(ctrls);

    // If the carousel is animated or a slide navigation is requested in the settings, another unordered list that contains those elements is added. (Note that you cannot supress the navigation when it is animated.)
    if (settings.slidenav || settings.animate) {
      slidenav = document.createElement('ul');

      slidenav.className = 'list carousel__nav';

      if (settings.animate) {
        var li = document.createElement('li');
        li.className = 'list carousel__nav-item'

        if (settings.startAnimated) {
          li.innerHTML = '<button class="btn btn--primary carousel__nav-btn carousel__nav-btn--action" data-action="stop"></button>';
        } else {
          li.innerHTML = '<button class="btn btn--primary carousel__nav-btn carousel__nav-btn--action" data-action="start"></button>';
        }

        slidenav.appendChild(li);
      }

      if (settings.slidenav) {
        forEachElement(slides, function(el, i){
          var li = document.createElement('li');
          li.className = 'list carousel__nav-item'
          var klass = (i===0) ? 'class="btn btn--primary carousel__nav-btn carousel__nav-btn--current" ' : 'class="btn btn--primary carousel__nav-btn" ';

          li.innerHTML = '<button '+ klass +'data-slide="' + i + '">' + (i+1) + '</button>';
          slidenav.appendChild(li);
        });
      }

      slidenav.addEventListener('click', function(event) {
        var button = event.target;
        if (button.localName == 'button') {
          if (button.getAttribute('data-slide')) {
            stopAnimation();
            setSlides(button.getAttribute('data-slide'), true);
          } else if (button.getAttribute('data-action') == "stop") {
            stopAnimation();
          } else if (button.getAttribute('data-action') == "start") {
            startAnimation();
          }
        }
      }, true);

      addClass(carousel, 'carousel--with-slidenav');
      carousel.appendChild(slidenav);
    }

    // Add a live region to announce the slide number when using the previous/next buttons
    //var liveregion = document.createElement('div');
    //liveregion.setAttribute('aria-live', 'polite');
    //liveregion.setAttribute('aria-atomic', 'true');
    //liveregion.setAttribute('class', 'carousel__liveregion visuallyhidden');
    //carousel.appendChild(liveregion);

    // After the slide transitioned, remove the in-transition class, if focus should be set, set the tabindex attribute to -1 and focus the slide.
    slides[0].parentNode.addEventListener('transitionend', function (event) {
      var slide = event.target;
      removeClass(slide, 'carousel__slide--in-transition');
      if (hasClass(slide, 'carousel__slide--current'))  {
        if(setFocus) {
          slide.setAttribute('tabindex', '-1');
          slide.focus();
          setFocus = false;
        }
      }
    });

      // When the mouse enters the carousel, suspend the animation.
      carousel.addEventListener('mouseenter', suspendAnimation);

      // When the mouse leaves the carousel, and the animation is suspended, start the animation.
      carousel.addEventListener('mouseleave', function(event) {
        if (animationSuspended) {
          startAnimation();
        }
      });

      // When the focus enters the carousel, suspend the animation
      carousel.addEventListener('focusin', function(event) {
        if (!hasClass(event.target, 'slide')) {
          suspendAnimation();
        }
      });

      // When the focus leaves the carousel, and the animation is suspended, start the animation
      carousel.addEventListener('focusout', function(event) {
        if (!hasClass(event.target, 'slide') && animationSuspended) {
          startAnimation();
        }
      });

    // Set the index (=current slide) to 0 – the first slide
    index = 0;
    setSlides(index);

    // If the carousel is animated, advance to the
    // next slide after 5s
    if (settings.startAnimated) {
      timer = setTimeout(nextSlide, 5000);
    }
  }

  // Function to set a slide the current slide
  function setSlides(new_current, setFocusHere, transitionHere, announceItemHere) {
    // Focus, transition and announce Item are optional parameters.
    // focus denotes if the focus should be set after the
    // carousel advanced to slide number new_current.
    // transition denotes if the transition is going into the
    // next or previous direction.
    // If announceItem is set to true, the live region’s text is changed (and announced)
    // Here defaults are set:

    setFocus = typeof setFocusHere !== 'undefined' ? setFocusHere : false;
    transition = typeof transitionHere !== 'undefined' ? transitionHere : 'none';
    announceItem = typeof announceItemHere !== 'undefined' ? announceItemHere : false;

    new_current = parseFloat(new_current);

    var length = slides.length;
    var new_next = new_current+1;
    var new_prev = new_current-1;

    // If the next slide number is equal to the length,
    // the next slide should be the first one of the slides.
    // If the previous slide number is less than 0.
    // the previous slide is the last of the slides.
    if(new_next === length) {
      new_next = 0;
    } else if(new_prev < 0) {
      new_prev = length-1;
    }

    // Reset slide classes
    for (var i = slides.length - 1; i >= 0; i--) {
      slides[i].className = 'carousel__slide';
    }

    // Add classes to the previous, next and current slide
    addClass(slides[new_next], 'carousel__slide--next');
    if (transition == 'next') {
      addClass(slides[new_next], 'carousel__list-in-transition');
    }
    slides[new_next].setAttribute('aria-hidden', 'true');

    addClass(slides[new_prev], 'carousel__slide--prev');
    if (transition == 'prev') {
      addClass(slides[new_prev], 'carousel__list-in-transition');
    }
    slides[new_prev].setAttribute('aria-hidden', 'true');

    addClass(slides[new_current], 'carousel__slide--current');
    slides[new_current].removeAttribute('aria-hidden');

    // Update the text in the live region which is then announced by screen readers.
    // if (announceItem) {
    //   carousel.querySelector('.carousel__liveregion').textContent = 'Item ' + (new_current + 1) + ' of ' + slides.length;
    // }

    // Update the buttons in the slider navigation to match the currently displayed  item
    if(settings.slidenav) {
      var buttons = carousel.querySelectorAll('.carousel__nav-btn[data-slide]');
      for (var j = buttons.length - 1; j >= 0; j--) {
        removeClass(buttons[j], 'carousel__nav-btn--current');
        buttons[j].innerHTML = (j+1);
      }
      addClass(buttons[new_current], 'carousel__nav-btn--current');
    }

    // Set the global index to the new current value
    index = new_current;

  }

  // Function to advance to the next slide
  function nextSlide(announceItem) {
    announceItem = typeof announceItem !== 'undefined' ? announceItem : false;

    var length = slides.length,
    new_current = index + 1;

    if(new_current === length) {
      new_current = 0;
    }

    // If we advance to the next slide, the previous needs to be
    // visible to the user, so the third parameter is 'prev', not
    // next.
    setSlides(new_current, false, 'prev', announceItem);

    // If the carousel is animated, advance to the next
    // slide after 5s
    if (settings.animate) {
      timer = setTimeout(nextSlide, 5000);
    }

  }

  // Function to advance to the previous slide
  function prevSlide(announceItem) {
    announceItem = typeof announceItem !== 'undefined' ? announceItem : false;

    var length = slides.length,
    new_current = index - 1;

    // If we are already on the first slide, show the last slide instead.
    if(new_current < 0) {
      new_current = length-1;
    }

    // If we advance to the previous slide, the next needs to be
    // visible to the user, so the third parameter is 'next', not
    // prev.
    setSlides(new_current, false, 'next', announceItem);

  }

  // Function to stop the animation
  function stopAnimation() {
    clearTimeout(timer);
    settings.animate = false;
    animationSuspended = false;
    let _this = carousel.querySelector('.carousel__nav-btn--action[data-action]');
    _this.setAttribute('data-action', 'start');
  }

  // Function to start the animation
  function startAnimation() {
    settings.animate = true;
    animationSuspended = false;
    timer = setTimeout(nextSlide, 5000);
    let _this = carousel.querySelector('.carousel__nav-btn--action[data-action]');
    _this.setAttribute('data-action', 'stop');
  }

  // Function to suspend the animation
  function suspendAnimation() {
    if(settings.animate) {
      clearTimeout(timer);
      settings.animate = false;
      animationSuspended = true;
    }
  }

  // Making some functions public
  return {
    init:init,
    next:nextSlide,
    prev:prevSlide,
    goto:setSlides,
    stop:stopAnimation,
    start:startAnimation
  };
});


const mediaQueryList = window.matchMedia("(min-width: 768px)");

function handleWidthChange(mql) {
  // Set up carousel only for mobile devices
  if (!mediaQueryList.matches) { 
    var carousel_audio = new myCarousel();
    carousel_audio.init({
      id: 'media-audio-carousel',
      slidenav: false,
      animate: false,
      startAnimated: false,
      class: 'carousel--type-1'
    });

    var carousel_video = new myCarousel();
    carousel_video.init({
      id: 'media-video-carousel',
      slidenav: false,
      animate: false,
      startAnimated: false,
      class: 'carousel--type-2'
    });

  }
}

// Run the width change handle once
handleWidthChange(mediaQueryList);

// Add the callback function as a listener to the query list.
mediaQueryList.addEventListener("change", handleWidthChange);

