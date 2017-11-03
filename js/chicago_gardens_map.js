$(function() {
  // Filter Options
  var ownerOptions = ['Chicago Public Library', 'Private', 'Chicago Housing Authority', 'City of Chicago', 'NeighborSpace', 'Chicago Park District', 'Chicago Public Schools'];
  var typeOptions = ['Food Donation', 'School Garden', '(Assisted) Housing', 'Pantry Garden', 'Congregation Garden', 'Urban Farm', 'Demo / Training / Program', 'Ornamental / Beautification', 'Urban Agriculture Organization', 'Habitat / Conservation / Prairie ', 'Community Garden', 'Community Farm', 'Orchard', 'Restaurant / Catering Garden', 'Rooftop', 'Single-tender Garden'];
  var siteStructures = ["Water Management", "Washing Area / Sinks", "Shed / Storage box", "Play Area", "Information Kiosk", "Grill / Cooking Station", "Fire Pit", "Electricity Outlet", "Covered Area", "Artwork / Sculptures", "Water Feature (ponds, fountain)", "Teaching Area", "Seating Area", "Performance Area", "Handicap accessible bed", "Gazebo", "Farm Stand", "Educational Signage", "Compost System"];
  var foodProductionOptions = ["Yes", "No"];
  var wardOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"];
  var districtOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"];
  var commareaOptions = ['ROGERS PARK', 'WEST RIDGE', 'UPTOWN', 'LINCOLN SQUARE', 'EDISON PARK', 'NORWOOD PARK', 'JEFFERSON PARK', 'FOREST GLEN', 'NORTH PARK', 'ALBANY PARK', 'OHARE', 'EDGEWATER', 'NORTH CENTER', 'LAKEVIEW', 'LINCOLN PARK', 'AVONDALE', 'LOGAN SQUARE', 'PORTAGE PARK', 'IRVING PARK', 'DUNNING', 'MONTCLARE', 'BELMONT CRAGIN', 'HERMOSA', 'NEAR NORTH SIDE', 'LOOP', 'NEAR SOUTH SIDE', 'HUMBOLDT PARK', 'WEST TOWN', 'AUSTIN', 'WEST GARFIELD PARK', 'EAST GARFIELD PARK', 'NEAR WEST SIDE', 'NORTH LAWNDALE', 'SOUTH LAWNDALE', 'LOWER WEST SIDE', 'GARFIELD RIDGE', 'ARCHER HEIGHTS', 'BRIGHTON PARK', 'MCKINLEY PARK', 'NEW CITY', 'WEST ELSDON', 'GAGE PARK', 'CLEARING', 'WEST LAWN', 'CHICAGO LAWN', 'WEST ENGLEWOOD', 'ENGLEWOOD', 'ARMOUR SQUARE', 'DOUGLAS', 'OAKLAND', 'FULLER PARK', 'GRAND BOULEVARD', 'KENWOOD', 'WASHINGTON PARK', 'HYDE PARK', 'WOODLAWN', 'SOUTH SHORE', 'BRIDGEPORT', 'GREATER GRAND CROSSING', 'ASHBURN', 'AUBURN GRESHAM', 'BEVERLY', 'WASHINGTON HEIGHTS', 'MOUNT GREENWOOD', 'MORGAN PARK', 'CHATHAM', 'AVALON PARK', 'SOUTH CHICAGO', 'BURNSIDE', 'CALUMET HEIGHTS', 'ROSELAND', 'PULLMAN', 'SOUTH DEERING', 'EAST SIDE', 'WEST PULLMAN', 'RIVERDALE', 'HEGEWISCH'];
  // Turn on autocomplete to predict address when user begins to type.
  new google.maps.places.Autocomplete(document.getElementById('search-address'));
  // Create a map!
  chicagoGardens.initialize();
  chicagoGardens.addInfoBox('bottomright', 'infoBox');
  chicagoGardens.addInfoBox('topright', 'resultsBox', "Sites Found: <strong>" + chicagoGardens.resultsNumber + "</strong>");

  var layer1 = {
    sql: "SELECT * from " + chicagoGardens.cartoTableName,
    cartocss: $('#carto-result-style').html().trim(),
    interactivity: this.cartoFields,
  }

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
    header_names = ["growing_site_name", "address", "growing_site_website", "public_contact_info", "facebook", "ward", "community", "district_n", "ownership",  "evidence_of_support_organizations", "is_growing_site_fenced", "is_growing_site_dormant", "food_producing", "compost_system", "is_growing_site_locked", "other_support_organization", "season_extension_techniques", "structures_and_features", "water", "choose_growing_site_types", "community_garden", "if_it_s_a_community_garden_is_it_collective_or_allotment"]

    chicagoGardens.buildCSV(header_names);
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

  hiddenLink();
})


  