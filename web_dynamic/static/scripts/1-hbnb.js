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
});
