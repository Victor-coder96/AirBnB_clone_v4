$(document).ready(function () {
  const checkedAmenities = {};
  $('div.amenities li input[type=checkbox]').change(function () {
    const id = $(this).attr('data-id');
    const name = $(this).attr('data-name');
    if ($(this).is(':checked')) {
      checkedAmenities[id] = name;
    } else {
      delete checkedAmenities[id];
    }
    $('div.amenities h4').text(Object.values(checkedAmenities).join(', '));
  });
  $.getJSON('http://0.0.0.0:5001/api/v1/status/', function (data) {
    if (data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
  makePlacesRequst();
});

function makePlacesRequst (post = {}) {
  $.post({
    url: 'http://0.0.0.0:5001/api/v1/places_search/',
    dataType: 'json',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(post)
  }, function (data) {
    $('section.places').empty();
    const html = data.reduce((articles, place) => {
      return (articles + `
        <article>
          <div class="title_box">
            <h2>${place.name}</h2>
            <div class="price_by_night">$${place.price_by_night}</div>
          </div>
          <div class="information">
            <div class="max_guest">${place.max_guest} Guest${place.max_guest !== 1 ? 's' : ''}</div>
            <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}</div>
            <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms !== 1 ? 's' : ''}</div>
          </div>
          <div class="user"></div>
          <div class="description">${place.description}</div>
        </article>`);
    }, '');
    $('section.places').append(html);
  });
}
