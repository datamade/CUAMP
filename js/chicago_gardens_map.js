$(function() {
  // Filter Options
  var ownerOptions = ["Private", "NeighborSpace", "City of Chicago", "Chicago Park District", "Chicago Public Schools", "Chicago Public Library"];
  var typeOptions = ["(Assisted) Housing", "Food Donation", "Pantry Garden", "Urban Farm", "Community Farm", "Community Garden", "Demo / Training / Program", "Ornamental / Beautification", "Habitat / Conservation / Prairie", "Single-tender Garden", "School Garden", "Urban Agriculture Organization", "Congregation Garden", "Restaurant / Catering Garden", "Orchard", "Pantry Garden", "Streetscape / Parkway", "Rooftop"];
  var siteStructures = ["Water Management", "Washing Area / Sinks", "Shed / Storage box", "Play Area", "Information Kiosk", "Grill / Cooking Station", "Fire Pit", "Electricity Outlet", "Covered Area", "Artwork / Sculptures", "Water Feature (ponds, fountain)", "Teaching Area", "Seating Area", "Performance Area", "Handicap accessible bed", "Gazebo", "Farm Stand", "Educational Signage", "Compost System"];
  var foodProductionOptions = ["Yes", "No"];
  var wardOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"];
  var districtOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"];
  var commareaOptions = ["ALBANY PARK", "ARCHER HEIGHTS", "ARMOUR SQUARE", "ASHBURN", "AUBURN GRESHAM", "AUSTIN", "AVALON PARK", "AVONDALE", "BELMONT CRAGIN", "BEVERLY", "BRIDGEPORT", "BRIGHTON PARK", "BURNSIDE", "CALUMET HEIGHTS", "CHATHAM", "CHICAGO LAWN", "CLEARING", "DOUGLAS", "DUNNING", "EAST GARFIELD PARK", "EAST SIDE", "EDGEWATER", "EDISON PARK", "ENGLEWOOD", "FULLER PARK", "GAGE PARK", "GARFIELD RIDGE", "GRAND BOULEVARD", "GREATER GRAND CROSSING", "HEGEWISCH", "HERMOSA", "HUMBOLDT PARK", "HYDE PARK", "IRVING PARK", "KENWOOD", "LAKE VIEW", "LINCOLN SQUARE", "LOGAN SQUARE", "LOOP", "LOWER WEST SIDE", "MCKINLEY PARK", "MONTCLARE", "MORGAN PARK", "MOUNT GREENWOOD", "NEAR WEST SIDE", "NEW CITY", "NORTH CENTER", "NORTH LAWNDALE", "NORTH PARK", "OAKLAND", "PORTAGE PARK", "PULLMAN", "RIVERDALE", "ROGERS PARK", "ROSELAND", "SOUTH DEERING", "SOUTH LAWNDALE", "WASHINGTON HEIGHTS", "WASHINGTON PARK", "WEST ELSDON", "WEST ENGLEWOOD", "WEST GARFIELD PARK", "WEST LAWN", "WEST PULLMAN", "WEST RIDGE", "WEST TOWN", "WOODLAWN"];

  // Create a map!
  chicagoGardens.initialize();
  chicagoGardens.addInfoBox('bottomright', 'infoBox');
  chicagoGardens.addInfoBox('topright', 'resultsBox', "Sites Found: <strong>" + chicagoGardens.resultsNumber + "</strong>");

  var layer1 = {
    sql: "SELECT * from " + chicagoGardens.cartoTableName,
    cartocss: $('#carto-result-style').html().trim(),
    interactivity: this.cartoFields,
  }

  $(".close-btn").on('click', function() {
    modalPop(null);
  });

  $("#btnSearch").on("click", function() {
    chicagoGardens.doSearch();
    $('#btnViewMode').html("<i class='fa fa-list'></i>");
    $('#listCanvas').hide();
    $('#mapCanvas').show();
  });

  $("#btnReset").on("click", function() {
    chicagoGardens.clearSearch();
  });

  $('#btnCSVDownload').on('click', function() {
    chicagoGardens.buildCSV();
  });

  $('#search-ownership, #search-ward, #search-neighborhood').select2();

  var ward_data = makeSelectData(wardOptions);
  var ownership_data = makeSelectData(ownerOptions);
  var garden_type_data = makeSelectData(typeOptions);
  var site_structures_data = makeSelectData(siteStructures);
  var commarea_data = makeSelectData(commareaOptions);
  var district_data = makeSelectData(districtOptions);

  $(".data-array-ward").select2({
    placeholder: "Ward",
    data: ward_data
  });

  $(".data-array-district").select2({
    placeholder: "District",
    data: district_data
  });

  $(".data-array-type").select2({
    placeholder: "Garden Type",
    data: garden_type_data
  });

  $(".data-array-structure").select2({
    placeholder: "Site Structures",
    data: site_structures_data
  });

  $(".data-array-ownership").select2({
    placeholder: "Owner",
    data: ownership_data
  });

  $(".data-array-neighborhood").select2({
    placeholder: "Community Area",
    data: commarea_data
  });

  function modalPop(data) {
    var contact = "<p id='modal-address'><i class='fa fa-map-marker' aria-hidden='true'></i> <strong>Address:</strong> " + data.address + '</p><br>' + '<p class="modal-directions"><a href="http://maps.google.com/?q=' + data.address + '" target="_blank">Get Directions</a></p>'
    $('#modal-pop').appendTo('body').modal();
    $('#modal-title, #address-header, #owner-header, #community-header, #production-header, #address-subsection, #owner-subsection, #community-subsection, #production-subsection, #locked-header, #locked-subsection, #commtype-header, #commtype-subsection, #types-header, #types-subsection, #water-header, #water-subsection, #compost-header, #compost-subsection, #structures-header, #structures-subsection, #seasonex-header, #seasonex-subsection, #animal-header, #animal-subsection, #dormant-header, #dormant-subsection, #support-header, #support-subsection, #website-header, #website-subsection, #facebook-header, #facebook-subsection, #fence-header, #fence-subsection, #description-header, #description-subsection, #ward-header, #ward-subsection, #commarea-header, #commarea-subsection, #contact-header, #contact-subsection, #with_contact, #with_location, #with_about, #with_features').empty();
    $('#modal-title').html(data.growing_site_name);
    $('#modal-main').html(contact);

    var address_list = data.address
    var owner_list = data.ownership
    var community_list = data.community_garden
    var production_list = data.food_producing
    var locked = data.is_growing_site_locked
    var comm_garden_type = data.if_it_s_a_community_garden_is_it_collective_or_allotment
    var types = data.choose_growing_site_types
    var water_system = data.water
    var compost = data.compost_system
    var structures = data.structures_and_features
    var season_extension = data.season_extension_techniques
    var animals = data.animals
    var dormant = data.is_growing_site_dormant
    var other_support = data.other_support_organization
    var website = data.growing_site_website
    var facebook = data.facebook
    var fence = data.is_growing_site_fenced
    var description = data.description
    var ward_num = data.ward
    var community_area = data.communities
    var contact_info = data.public_contact_info

    // Find all instances of "yes."
    if (address_list != null) {
        $("#address-header").append('<i class="fa fa-user" aria-hidden="true"></i> Address:');
        $("#address-subsection").append("<p>" + address_list + "</p>");
    }
    if (owner_list != "") {
        $("#owner-header").append('<i class="fa fa-usd" aria-hidden="true"></i> Ownership:');
        $("#owner-subsection").append("<p>" + owner_list + "</p>");
    }
    if (community_list != null) {
      $("#community-header").append('<i class="fa fa-users" aria-hidden="true"></i> Community Garden:');
      $("#community-subsection").append("<p>" + convertBoolean(community_list) + "</p>");
    }
    if (production_list != null) {
      $("#production-header").append('<i class="fa fa-cutlery" aria-hidden="true"></i> Food Producing:');
      $("#production-subsection").append("<p>" + convertBoolean(production_list) + "</p>")
    }
    if (locked != null) {
      $("#locked-header").append('<i class="fa fa-lock" aria-hidden="true"></i> Locked Site:');
      $("#locked-subsection").append("<p>" + convertBoolean(locked) + "</p>")
    }
    if (comm_garden_type != "") {
      $("#commtype-header").append('<i class="fa fa-thumbs-o-up" aria-hidden="true"></i> Community Garden Type:');
      $("#commtype-subsection").append("<p>" + comm_garden_type + "</p>")
    }
    if (types != "") {
      $("#types-header").append('<i class="fa fa-leaf" aria-hidden="true"></i> Garden Type:');
      $("#types-subsection").append("<p>" + types + "</p>")
    }
    if (water_system != "") {
      $("#water-header").append('<i class="fa fa-tint" aria-hidden="true"></i> Water System:');
      $("#water-subsection").append("<p>" + water_system + "</p>")
    }
    if (compost != null) {
      $("#compost-header").append('<i class="fa fa-recycle" aria-hidden="true"></i> Compost Available:');
      $("#compost-subsection").append("<p>" + convertBoolean(compost) + "</p>")
    }
    if (structures != "") {
      $("#structures-header").append('<i class="fa fa-building-o" aria-hidden="true"></i> Structures and Features:');
      $("#structures-subsection").append("<p>" + structures + "</p>")
    }
    if (season_extension != "") {
      $("#seasonex-header").append('<i class="fa fa-arrow-right" aria-hidden="true"></i> Season Extension Techniques:<br>');
      $("#seasonex-subsection").append("<p>" + season_extension+ "</p>")
    }
    if (animals != "") {
      $("#animal-header").append('<i class="fa fa-paw" aria-hidden="true"></i> Animals:');
      $("#animal-subsection").append("<p>" + animals + "</p>")
    }
    if (other_support != "") {
      $("#support-header").append('<i class="fa fa-signing" aria-hidden="true"></i> Support Organizations:');
      $("#support-subsection").append("<p>" + other_support + "</p>")
    }
    if (website != "") {
      $("#website-header").append('<i class="fa fa-bookmark" aria-hidden="true"></i> Website:');
      $("#website-subsection").append("<p><a href='" + website + "'>" + website + "</a></p>")
    }
    if (facebook != "") {
      $("#facebook-header").append('<i class="fa fa-facebook-square" aria-hidden="true"></i> <a href="' + facebook + '">Facebook Page</a>');
    }
    if (fence != null) {
      $("#fence-header").append('<i class="fa fa-bars" aria-hidden="true"></i> Fenced In:');
      $("#fence-subsection").append("<p>" + convertBoolean(fence) + "</p>")
    }
    if (description != "") {
      $("#description-header").append('<br><i class="fa fa-ellipsis-h" aria-hidden="true"></i> Description:');
      $("#description-subsection").append("<p>" + description + "</p>")
    }
    if (dormant != null) {
      $("#dormant-header").append('<i class="fa fa-pause" aria-hidden="true"></i> Dormant Site:');
      $("#dormant-subsection").append("<p>" + convertBoolean(dormant) + "</p>")
    }
    if (ward_num != null) {
      $("#ward-header").append('<i class="fa fa-university" aria-hidden="true"></i> Ward:');
      $("#ward-subsection").append("<p>" + ward_num + "</p>")
    }
    if (community_area != "") {
      $("#commarea-header").append('<i class="fa fa-map-marker" aria-hidden="true"></i> Community Area:');
      $("#commarea-subsection").append("<p>" + community_area + "</p>")
    }
    if (contact_info != "") {
      $("#contact-header").append('<i class="fa fa-phone aria-hidden="true"></i> Contact Info:');
      $("#contact-subsection").append("<p>" + contact_info + "</p>")
    }
    if ((contact_info != "") | (website != "") | (facebook != ""))  {
      $("#with_contact").append('<br><strong>Contact</strong><br>');
    }
    if ((community_area != "") | (ward_num != "")) {
      $("#with_location").append('<br><strong>Location</strong><br>');
    }
    if ((production_list != null) | (community_list != null) | (comm_garden_type != "") | (fence != null) | (locked != null) | (water_system != "") | (compost != null) | (season_extension != "") | (structures != "") | (animals != "")) {
      $("#with_features").append('<br><strong>Features</strong><br>');
    }
    if ((owner_list != "") | (other_support != "") | (types != "") | (description != "") | (dormant != null))  {
      $("#with_about").append('<br><strong>About</strong>');
    }

  };

  $('#btnViewMode').click(function(){
    if ($('#mapCanvas').is(":visible")){
      $('#btnViewMode').html("<i class='fa fa-map-marker'></i>");
      $('#listCanvas').show();
      $('#mapCanvas').hide();
    }
    else {
      $('#btnViewMode').html("<i class='fa fa-list'></i>");
      $('#listCanvas').hide();
      $('#mapCanvas').show();
    }
  });

})