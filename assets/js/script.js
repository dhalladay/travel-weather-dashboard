var cityInputEl = document.querySelector("#city-name");
var currentInputEL = document.querySelector("#current");
var searchHistory = [];

var loadHistory = function() {
  searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
  if (!searchHistory) {
    return searchHistory = [];
  }

}

var formSubmitHandler = function(event) {
  event.preventDefault();
  var city = cityInputEl.value.trim();

  if (city) {
    convertCity(city);

  } else {
    alert("Please enter a City");
  }
  cityInputEl.value = '';
};

$('#search-btn').on("click", formSubmitHandler);

var convertCity = function(city) {
  var apiURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=9c2bde727734176187ec259dc26ddab0`;
  fetch(apiURL)
  .then(function(response) {
    if(response.ok) {
      response.json().then(function(data) {
        var locArr = [data[0].lat, data[0].lon];
        oneCall(city, locArr);
      });
    } else {
      alert("Error: City not found. Try adding a comma and the state or country code");
    }
  })
  .catch(function(error) {
    alert("Unable to connect to Open Weather Map. Please try again later.")
  });
};

var oneCall = function(city, locArr) {
  var lat = locArr[0];
  var lon = locArr[1];
  var apiURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=9c2bde727734176187ec259dc26ddab0&units=imperial`;
  fetch(apiURL)
  .then(function(response) {
    if(response.ok) {
      response.json().then(function(data) {
        currentData = data.current;
        forecastData = data.daily;
        displayCurrentWeather(city, currentData);
        displayForecast(forecastData);
      })
    } else {
      alert("Unable to find weather data, please try again.");
    }
  })
  .catch("Unable to connect to Open Weather Map. Please try again later.")
};

var displayCurrentWeather = function(city, currentData) {
  var date = new Date(currentData.dt * 1000);
  var month = date.getMonth() + 1;
  var day = date.getDate(); 
  var year = date.getFullYear();
  var uvIndex = '';
  var getUvIndex = function(uvi) {
    if (uvi < 3) {
      return uvIndex = 'btn-success';
    } else if (uvi >= 3 && currentData.uvi <= 5) {
      return uvIndex = "btn-warning";
    } else if (uvi > 5) {
      return uvIndex = "btn-danger";
    }
  };

  getUvIndex(currentData.uvi);

  currentInputEL.classList = "border rounded pl-1"
  
  currentInputEL.innerHTML = `
    <h3>${city} (${month}/${day}/${year}) <img src="http://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png" alt="icon representing ${currentData.weather[0].main}" class="weatherIcon"></h3>
    <p>Temp: ${currentData.temp}° F</p>
    <p>Wind: ${currentData.wind_speed} MPH</p>
    <p>Humidity: ${currentData.humidity}%</p>
    <p>UV Index: <button class="btn ${uvIndex}">${currentData.uvi}</button></p>
  `;
}

var displayForecast = function(forecastData) {
  //clear current html
  $('#forecastTitle').text('');
  $('#forecast').html('');
  //add 5-day forecast title
  $('#forecastTitle').text('5-day Weather Forecast: ')
  //loop through forecast data and add to html
  for (var i = 0; i < 5; i++) {
    var date = new Date(forecastData[i].dt * 1000);
    var month = date.getMonth() + 1;
    var day = date.getDate(); 
    var year = date.getFullYear();
    $('<div />', {
      'id': i,
      'class': 'card mt-1',
      'html': `
      <div class="card-body">
        <h5 class="card-title">(${month}/${day}/${year})</h5>
        <img src="http://openweathermap.org/img/wn/${forecastData[i].weather[0].icon}@2x.png" alt="icon representing ${forecastData[i].weather[0].main}" class="weatherIconSmall">
        <p class="card-text">Temp: ${forecastData[i].temp.day}° F </p>
        <p class="card-text">Wind: ${forecastData[i].wind_speed} MPH</p>
        <p class="card-text">Humidity: ${forecastData[i].humidity}</p>
      </div>
      `,
   }).appendTo('#forecast')
  };
};

