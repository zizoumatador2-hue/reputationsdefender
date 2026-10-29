// Menu search and footer year. No external requests.
(function () {
  var input = document.getElementById("q");
  var items = Array.prototype.slice.call(document.querySelectorAll(".item"));
  var cats = Array.prototype.slice.call(document.querySelectorAll(".cat"));
  var empty = document.getElementById("empty");
  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (li) {
        var match = !q || li.getAttribute("data-search").indexOf(q) !== -1;
        li.hidden = !match;
        if (match) shown++;
      });
      cats.forEach(function (sec) {
        sec.hidden = !sec.querySelector(".item:not([hidden])");
      });
      empty.hidden = shown !== 0;
    });
  }
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
