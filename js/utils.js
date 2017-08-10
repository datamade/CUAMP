// Used in chicago_gardens.js
var capitalizeConversion = function capitalizeConversion(str) {
  var lower = str.toLowerCase();
  return lower.replace(/(^| )(\w)/g, function(x) {
    return x.toUpperCase();
  });
};

var downloadCSV = function downloadCSV(csv_data) {
  // Reference: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
  downloadLink = document.createElement("a");
  blob = new Blob(["\ufeff", csv_data]);
  url = URL.createObjectURL(blob);
  downloadLink.href = url;
  downloadLink.download = "cuamp_gardens.csv";

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

// Used in chicago_gardens_map.js
var makeSelectData = function makeSelectData(array) {
  data_arr = []
  for(var i = 0; i < array.length; i++) {
    data_arr.push({ id: i, text: array[i]})
  }
  return data_arr
};

var convertBoolean =  function convertBoolean(text) {
  if (text == true) {
    return "<i class="+"'fa fa-check'"+" aria-hidden="+"'true'"+"></i>"
  }
  else if (text == false) {
    return "<i class="+"'fa fa-times'"+" aria-hidden="+"'true'"+"></i>"
  }
  else {
  }
};
