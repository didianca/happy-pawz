$(document).ready(function () {
  $('.btn').click(function () {
    $(this).toggleClass('active');
    return $('.box').toggleClass('open');
  });

});

