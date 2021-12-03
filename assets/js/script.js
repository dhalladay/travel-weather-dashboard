var cityButtonsEl = document.querySelector("#search-btn");
var cityInputEl = document.querySelector("#city-name");
var formInputEl = document.querySelector("#search-box");

var formSubmitHandler = function(event) {
  event.preventDefault();
  var cityName = cityInputEl.value.trim();

  if (cityName) {
    // getUserRepos(username);
    // nameInputEl.value="";
    console.log(cityName);
  } else {
    alert("Please enter a Github username");
  }
  console.log("hello", event);
};

formInputEl.addEventListener("submit", formSubmitHandler);

var convertCity = function(city) {
  var apiURL = "http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=9c2bde727734176187ec259dc26ddab0";
  fetch(apiURL)
  .then(function(response) {
    if(response.ok) {
      response.json().then(function(data) {
        console.log(data);
        var locArr = [data[0].lat, data[0].lon];
        console.log(locArr);
        oneCall(locArr);
      });
    } else {
      alert("Error: City not found. Try adding a comma and the state or country");
    }
  })
  .catch(function(error) {
    alert("Unable to connect")
  });
};

convertCity();

var oneCall = function(locArr) {
  var lat = locArr[0];
  var lon = locArr[1];
  console.log(lat,lon)
  var apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&appid=9c2bde727734176187ec259dc26ddab0";
  fetch(apiURL)
  .then(function(response) {
    if(response.ok) {
      response.json().then(function(data) {
        console.log(data)
      })
    }
  })
};