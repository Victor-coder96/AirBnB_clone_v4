$(document).ready(function () {
  let amenities = []; let cities = []; let states = [];
  const checkedAmenities = {}; const checkedCities = {}; const checkedStates = {};

  $('div.amenities li input[type=checkbox]').change(function () {
    const id = $(this).attr('data-id');
    const name = $(this).attr('data-name');
    if ($(this).is(':checked')) {
      checkedAmenities[id] = name;
    } else {
      delete checkedAmenities[id];
    }
    $('div.amenities h4').text(Object.values(checkedAmenities).join(', '));
    amenities = Object.keys(checkedAmenities);
  });

  $('div.locations input[data-type="state"]').change(function () {
    const id = $(this).attr('data-id');
    const name = $(this).attr('data-name');
    const stateCities = $(this).parent().find('input[data-type="city"]');
    const stateChecked = $(this).is(':checked');

    if ($(this).is(':checked')) {
      checkedStates[id] = name;
      stateCities.prop('checked', true);
      stateCities.each(function () {
        delete checkedCities[$(this).attr('data-id')];
      });
    } else {
      if (id in checkedStates) {
        delete checkedStates[id];
        stateCities.prop('checked', false);
      }
    }
    if (!stateChecked) {
      stateCities.each(function () {
        if ($(this).is(':checked')) {
          checkedCities[$(this).attr('data-id')] = $(this).attr('data-name');
        } else {
          delete checkedCities[$(this).attr('data-id')];
        }
      });
    }
    cities = Object.keys(checkedCities);
    states = Object.keys(checkedStates);
    updateList({
      cities: checkedCities,
      states: checkedStates
    });
  });

  $('div.locations input[data-type="city"]').change(function () {
    const id = $(this).attr('data-id');
    const name = $(this).attr('data-name');
    const stateId = $(this).attr('data-state-id');
    const state = $(`input[data-id=${stateId}]`);

    if ($(this).is(':checked')) {
      checkedCities[id] = name;
      if ($(`input[data-state-id=${stateId}]`).not(':checked').length === 0) {
        state.prop('checked', true);
        checkedStates[stateId] = state.attr('data-name');
        const rm = $(`input[data-state-id="${stateId}"]`)
          .map(function () { return $(this).attr('data-id'); })
          .get();
        rm.forEach((item) => {
          delete checkedCities[item];
        });
      }
    } else {
      if (stateId in checkedStates) {
        delete checkedStates[stateId];
        state.prop('checked', false);
      }
      delete checkedCities[id];
    }
    cities = Object.keys(checkedCities);
    states = Object.keys(checkedStates);
    updateList({
      cities: checkedCities,
      states: checkedStates
    });
  });

  $.getJSON('http://0.0.0.0:5001/api/v1/status/', function (data) {
    if (data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });

  makePlacesRequst();

  $('button').click(function () {
    makePlacesRequst({ states, cities, amenities });
  });
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
                <div class="description">${place.description}</div>
                <div class="reviews">
                  <h2>Reviews</h2>
                  <span id="toggle-reviews" data-place-id=${place.id}>show</span>
                  <ul></ul>
                </div>
              </article>`);
    }, '');
    $('section.places').append(html);
    getReviews();
  });
}

function getReviews () {
  $('span#toggle-reviews').click(async function () {
    const placeId = $(this).attr('data-place-id');
    $(this).next().css('display', 'block');

    if ($(this).text() === 'show') {
      let reviews = await $.getJSON(`http://0.0.0.0:5001/api/v1/places/${placeId}/reviews`, function (data) {
        return data;
      });
      reviews = (await Promise.all(reviews.map(async function (review) {
        const user = await $.getJSON(`http://0.0.0.0:5001/api/v1/users/${review.user_id}`, function (data) {
          return data;
        });
        const updatedAt = new Date(review.updatedAt);
        const month = updatedAt.toLocaleString('default', { month: 'long' });
        const date = updatedAt.getDate();
        const year = updatedAt.getFullYear();
        return (`<li>
                  <h3>From ${user.first_name}: ${month} ${date}, ${year}</h3>
                  <p>${review.text}</p>
                  </li>`
        );
      }))).join('');
      $(this).next().empty().append(reviews);
      $(this).text('hide');
    } else {
      // $('.reviews ul').css("display", "none");
      $(this).next().css('display', 'none');
      $(this).text('show');
    }
  });
}

function updateList ({ cities, states }) {
  const _states = Object.keys(states).reduce((acc, curr) => {
    const _state = states[curr];
    const _cities = $(`input[data-state-id="${curr}"]`)
      .map(function () { return $(this).attr('data-name'); })
      .get();
    return [...acc, { [_state]: _cities.join(', ') }];
  }, []);
  const n = _states.length;
  const statesSpans = `
        <span class="states_list">${_states.reduce((acc, curr, idx) => {
          const k = Object.keys(curr)[0];
          const v = Object.values(curr)[0];
          acc += `<span class="tooltip">
              ${k}
            <span class="tooltiptext">${v}</span>
          </span>`;
          if (idx + 1 !== n) {
            acc += ', ';
          }
          return acc;
          }, '')}
        </span>`;
  const citiesSpans = `<span class="cities_list">${Object.values(cities).map((city) => city).join(', ')}</span>`;

  $('div.locations h4').empty().append(`${statesSpans}${citiesSpans}`);
}
