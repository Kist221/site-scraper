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

// When you click the scrape button
$("#wrapper").on("click", "#scrapeBtn", function() {
  $.ajax({
    method: "GET",
    url: "/api/scrape/"
  })
  .then(function() {
    location.reload();
  })
});

// goto single headline page with comments
$("#headlines").on("click", ".headline", function() {
  window.location = "/article/" + $(this).attr("articleId");
});

// add comments to the headlines
$("#wrapper").on("click", "#addComment", function() {
  // grab headline ID
  const thisID = $(this).attr("data-id");
  // post comment data for creation
  $.ajax({
      method: "POST",
      url: "/api/articles/" + thisID,
      data: {
        title: $("#titleInput").val(),
        body: $("#bodyInput").val()
      }
    })
    .then(function(data) {
      console.log(data);
    })
  location.reload();
});