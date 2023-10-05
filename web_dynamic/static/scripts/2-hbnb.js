$(document).ready(function () {
  $.getJSON('http://0.0.0.0:5001/api/v1/status/', function (data) {
    console.log('data', data);
    if (data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('header#api_status').removeClass('available');
    }
  });
});
