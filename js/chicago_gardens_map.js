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
})



  