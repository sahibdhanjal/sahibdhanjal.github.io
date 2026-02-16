/* ===================================================================
 * Blog Section - Fetches Medium RSS feed and renders compact blog list
 * ------------------------------------------------------------------- */

(function ($) {
  "use strict";

  var RSS_URL = "https://sahibdhanjal.medium.com/feed";
  var API_URL =
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent(RSS_URL);
  var ITEMS_PER_PAGE = 5;
  var blogItems = [];
  var currentPage = 1;

  function fetchBlogData() {
    $.ajax({
      url: API_URL,
      method: "GET",
      dataType: "json",
      success: function (data) {
        if (data.status === "ok") {
          blogItems = data.items;
          renderBlog();
        } else {
          $("#blog-list").html(
            '<p style="color:rgba(255,255,255,0.5);">Could not load blog posts.</p>'
          );
        }
      },
      error: function () {
        $("#blog-list").html(
          '<p style="color:rgba(255,255,255,0.5);">Could not load blog posts.</p>'
        );
      },
    });
  }

  function renderBlog() {
    var startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    var endIndex = startIndex + ITEMS_PER_PAGE;
    var pageItems = blogItems.slice(startIndex, endIndex);
    var $list = $("#blog-list");
    $list.empty();

    if (pageItems.length === 0) {
      $list.html('<p style="color:rgba(255,255,255,0.5);">No posts to show.</p>');
      return;
    }

    pageItems.forEach(function (item) {
      var date = new Date(item.pubDate);
      var dateStr = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      var snippet = item.description.replace(/<[^>]+>/g, "").trim();
      // Strip "Continue reading on ... »" from the snippet
      snippet = snippet.replace(/Continue reading on\s+.+?\s*»/, "").trim();
      if (snippet.length > 160) {
        snippet = snippet.substring(0, 160) + "…";
      }

      var tags = "";
      if (item.categories && item.categories.length > 0) {
        tags = item.categories
          .slice(0, 5)
          .map(function (t) {
            return '<span class="blog-tag">' + t + "</span>";
          })
          .join(" ");
      }

      // Extract thumbnail
      var thumbnail = item.thumbnail || "";
      if (!thumbnail) {
        var imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) thumbnail = imgMatch[1];
      }

      var imgHtml = thumbnail
        ? '<div class="blog-post__thumb"><a href="' + item.link + '" target="_blank" rel="noopener"><img src="' + thumbnail + '" alt="' + item.title + '"></a></div>'
        : "";

      var html =
        '<article class="blog-post">' +
        imgHtml +
        '<div class="blog-post__body">' +
        '<div class="blog-post__title-row">' +
        '<h3 class="blog-post__title"><a href="' +
        item.link + '" target="_blank" rel="noopener">' + item.title +
        "</a></h3>" +
        '<span class="blog-post__date">' + dateStr + "</span>" +
        "</div>" +
        '<p class="blog-post__snippet">' + snippet + "</p>" +
        (tags ? '<span class="blog-post__tags">' + tags + "</span>" : "") +
        "</div>" +
        "</article>";

      $list.append(html);
    });

    renderPagination();
  }

  function renderPagination() {
    var totalPages = Math.ceil(blogItems.length / ITEMS_PER_PAGE);
    var $pagination = $("#blog-pagination");
    $pagination.empty();

    if (totalPages <= 1) return;

    var html = '<div class="blog-pagination">';
    html += '<a href="javascript:void(0)" class="blog-pagination__btn' + (currentPage === 1 ? ' disabled' : '') + '" id="blog-prev">&larr; Prev</a>';
    html += '<span class="blog-pagination__info">' + currentPage + ' / ' + totalPages + '</span>';
    html += '<a href="javascript:void(0)" class="blog-pagination__btn' + (currentPage === totalPages ? ' disabled' : '') + '" id="blog-next">Next &rarr;</a>';
    html += '</div>';
    $pagination.html(html);

    $("#blog-prev").on("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderBlog();
        $("html, body").animate({ scrollTop: $("#blog").offset().top - 96 }, 400);
      }
    });

    $("#blog-next").on("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        renderBlog();
        $("html, body").animate({ scrollTop: $("#blog").offset().top - 96 }, 400);
      }
    });
  }

  $(document).ready(function () {
    if ($("#blog").length) {
      fetchBlogData();
    }
  });
})(jQuery);
