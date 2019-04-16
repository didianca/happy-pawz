AOS.init();
$(document).ready(function() {
  let stickyNavTop = $(".nav-header").offset().top;

  let stickyNav = function() {
    let scrollTop = $(window).scrollTop();

    if (scrollTop > stickyNavTop) {
      $(".nav-header").addClass("sticky");
    } else {
      $(".nav-header").removeClass("sticky");
    }
  };

  stickyNav();

  $(window).scroll(function() {
    stickyNav();
  });
});
