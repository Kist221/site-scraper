// button to clear db
$("#wrapper").on("click", "#clearBtn", function() {
  $.ajax({
    method: "GET",
    url: "/api/cleanup/"
  })
  .then(function() {
    location.reload();
  })
});

// When you click the savenote button
$("#wrapper").on("click", "#scrapeBtn", function() {
  $.ajax({
    method: "GET",
    url: "/api/scrape/"
  })
  .then(function() {
    location.reload();
  })
});

// goto single headline page with notes
$("#headlines").on("click", ".headline", function() {
  window.location = "/notes/" + $(this).attr("articleId");
});