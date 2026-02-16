/* ===================================================================
 * Transcend - Main JS
 *
 * ------------------------------------------------------------------- */
(function ($) { // Begin jQuery
  $(function () { // DOM ready
    $('nav ul li a:not(:only-child)').click(function (e) {
      $(this).siblings('.nav-dropdown').toggle();
      // Close one dropdown when selecting another
      $('.nav-dropdown').not($(this).siblings()).hide();
      e.stopPropagation();
    });
    // Clicking away from dropdown will remove the dropdown class
    $('html').click(function () {
      $('.nav-dropdown').hide();
    });
    // Hamburger toggle — open/close mobile nav
    $(document).on('click', '#nav-toggle', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $list = $('.header-nav__list');
      $list.toggleClass('is-open');
      $(this).toggleClass('active');
    });
    // Close mobile nav when a link is clicked
    $('.header-nav__list a').on('click', function () {
      if ($(window).width() <= 800) {
        $('.header-nav__list').removeClass('is-open');
        $('#nav-toggle').removeClass('active');
      }
    });
  });
})(jQuery);


(function ($) {

  "use strict";

  var cfg = {
    scrollDuration: 800, // smoothscroll duration
    mailChimpURL: 'https://facebook.us8.list-manage.com/subscribe/post?u=cdb7b577e41181934ed6a6a44&amp;id=e6957d85dc'   // mailchimp url
  },

    $WIN = $(window);

  // Add the User Agent to the <html>
  // will be used for IE10 detection (Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0))
  var doc = document.documentElement;
  doc.setAttribute('data-useragent', navigator.userAgent);

  /* Project Card Overlay + Pagination
   * ----------------------------------------------------- */
  var clProjectOverlay = function () {
    var ITEMS_PER_PAGE = 6;
    var currentPage = 1;
    var $cards = $('.project-card');
    var $overlay = $('#project-overlay');

    function showPage(page) {
      currentPage = page;
      var start = (page - 1) * ITEMS_PER_PAGE;
      var end = start + ITEMS_PER_PAGE;

      $cards.each(function (i) {
        $(this).toggle(i >= start && i < end);
      });

      renderPagination();
      if (typeof AOS !== 'undefined') AOS.refresh();
    }

    function renderPagination() {
      var totalPages = Math.ceil($cards.length / ITEMS_PER_PAGE);
      var $pag = $('#projects-pagination');
      $pag.empty();
      if (totalPages <= 1) return;

      var html = '<div class="projects-pagination">';
      html += '<a href="javascript:void(0)" class="projects-pagination__btn' + (currentPage <= 1 ? ' disabled' : '') + '" id="proj-prev">&larr; Prev</a>';
      html += '<span class="projects-pagination__info">' + currentPage + ' / ' + totalPages + '</span>';
      html += '<a href="javascript:void(0)" class="projects-pagination__btn' + (currentPage >= totalPages ? ' disabled' : '') + '" id="proj-next">Next &rarr;</a>';
      html += '</div>';
      $pag.html(html);

      $('#proj-prev').on('click', function () {
        if (currentPage > 1) {
          showPage(currentPage - 1);
        }
      });
      $('#proj-next').on('click', function () {
        var totalPages = Math.ceil($cards.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
          showPage(currentPage + 1);
        }
      });
    }

    // init pagination
    showPage(1);

    // open overlay on card click
    $(document).on('click', '.project-card', function () {
      var $card = $(this);
      var imgSrc = $card.find('.project-card__img img').attr('src');
      var title = $card.find('.project-card__title').text();
      var descHtml = $card.find('.project-card__detail').html();

      var $desc = $('<div>').html(descHtml);
      // extract link buttons into their own area
      var $links = $desc.find('.project-card__links a');
      var linksArr = [];
      $links.each(function () {
        var $link = $(this);
        var text = $link.text().trim();
        var href = $link.attr('href');
        linksArr.push('<a href="' + href + '" target="_blank">' + text + ' <img src="https://cdn.prod.website-files.com/63dcb6e1a80e9454b630f4c4/63e0b50ea0956f4526968ef1_23-icon-external.svg" loading="lazy" alt="" class="icon-external"></a>');
      });
      var linksHtml = linksArr.join(' | ');
      $desc.find('.project-card__links').remove();

      $overlay.find('.project-overlay__img').attr('src', imgSrc);
      $overlay.find('.project-overlay__title').text(title);
      $overlay.find('.project-overlay__desc').html($desc.html());
      $overlay.find('.project-overlay__date').text("Feb'26");

      var $linkRow = $('#proj-link-row');
      if (linksArr.length > 0) {
        $overlay.find('.project-overlay__links').html(linksHtml);
        $linkRow.show();
      } else {
        $linkRow.hide();
      }

      $overlay.addClass('is-visible');
      $('body').css('overflow', 'hidden');
    });

    // close overlay
    $overlay.find('.project-overlay__close').on('click', function (e) {
      e.stopPropagation();
      $overlay.removeClass('is-visible');
      $('body').css('overflow', '');
    });

    // close on backdrop click
    $overlay.on('click', function (e) {
      if (!$(e.target).closest('.project-overlay__content').length) {
        $overlay.removeClass('is-visible');
        $('body').css('overflow', '');
      }
    });

    // close on ESC
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' && $overlay.hasClass('is-visible')) {
        $overlay.removeClass('is-visible');
        $('body').css('overflow', '');
      }
    });
  };


  /* Animate On Scroll
   * ------------------------------------------------------ */
  var clAOS = function () {
    AOS.init({
      offset: 100,
      duration: 200,
      easing: 'ease-in-sine',
      delay: 100,
      once: true,
      disable: 'mobile'
    });
  };


  /* Header Scroll Toggle
   * ------------------------------------------------------ */
  var clHeaderScroll = function () {
    var $header = $('.s-header');
    $WIN.on('scroll', function () {
      if ($WIN.scrollTop() > 50) {
        $header.addClass('scrolled');
      } else {
        $header.removeClass('scrolled');
      }
    });
  };


  /* Smooth Scroll for nav links
   * ------------------------------------------------------ */
  var clSmoothScroll = function () {
    $('a[href^="#"]:not(#nav-toggle)').on('click', function (e) {
      var target = $(this.getAttribute('href'));
      if (target.length) {
        e.preventDefault();
        $('html, body').stop().animate({
          scrollTop: target.offset().top
        }, cfg.scrollDuration, 'swing');
      }
    });
  };



  /* Initialize
   * ------------------------------------------------------ */
  (function clInit() {
    clProjectOverlay();
    clAOS();
    clSmoothScroll();
    clHeaderScroll();
  })();

})(jQuery);
