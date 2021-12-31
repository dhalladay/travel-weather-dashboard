//declare variables
var searchHistory = [];

//update searchHistory if array exists in localStorage
var createSearchArr = function() {
  searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
  if (!searchHistory) {
    // return searchHistory = [];
    searchHistory = [];
  } else {
    // return searchHistory;
    searchHistory
  }
  displayHistorySearches(searchHistory);
};

//display historical searches
var displayHistorySearches = function(data) {
  //clear search history
  $('#history-search-list').html('');
  for (var i = 0; i < data.length; i++) {
    $('<li />', {
      'id': data[i],
      'html': `
      <button class="history btn btn-secondary btn-block mt-1">${data[i]}</button>
      `,
    }).appendTo('#history-search-list')
  };
};

//add event listener to search historical cities
$('#history-search-list').on("click", "button", function() {
  var previousCity = $(this).text();
  convertCity(previousCity);
});

//prepare user input to for fetch request
var formSubmitHandler = function(event) {
  event.preventDefault();
  var city = $('#city-name')
  .val()
  .trim()
  
  if (city) {
    convertCity(city);
    
  } else {
    alert("Please enter a City");
  }
  //clear user input
  $('#city-name').val('');
};

//add event listener for search form
$('#search-btn').on("click", formSubmitHandler);

//save successful city searches
var saveCity = function(city) {
  //only add to searchHistory if it doesn't already exist.
  if (searchHistory.indexOf(city) === -1) {
    //if the array is more than 9, remove first element in array and add new city to the end of the array
    if (searchHistory.length >= 9) {
      searchHistory.pop();
      searchHistory.unshift(city);
    }
    else {
      searchHistory.unshift(city);
    }
  }
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  //display city in history element
  displayHistorySearches(searchHistory);
};

//use openweathermap geo code search to convert city to lat and longtitude 
var convertCity = function(city) {
  var apiURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=9c2bde727734176187ec259dc26ddab0`;
  fetch(apiURL)
  .then(function(response) {
    if(response.ok) {
      response.json().then(function(data) {
        var locArr = [data[0].lat, data[0].lon];
        oneCall(city, locArr);
        saveCity(city);
      });
    } else {
      alert("Error: City not found. Try adding a comma and the state or country code");
    }
  })
  .catch(function(error) {
    alert("Unable to connect to Open Weather Map. Please try again later.")
  });
};

//insert lat and longtitute into URL for api fetch request
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
        //send successful data to be displayed
        displayCurrentWeather(city, currentData);
      })
    } else {
      alert("Unable to find weather data, please try again.");
    }
  })
  .catch("Unable to connect to Open Weather Map. Please try again later.")
};

//display current weather conditions
var displayCurrentWeather = function(city, currentData) {
  //create a new date object (multiply by 1000 to get in miliseconds)
  var date = new Date(currentData.dt * 1000);
  var month = date.getMonth() + 1;
  var day = date.getDate(); 
  var year = date.getFullYear();
  var uvIndex = '';
  //add background color class based on uvi value 
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
  
  $('#current').addClass('border rounded pl-1');
  
  $('#current')
  .html(
    `
    <h3>${city} (${month}/${day}/${year}) <img src="http://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png" alt="icon representing ${currentData.weather[0].main}" class="weatherIcon"></h3>
    <p>Temp: ${currentData.temp}° F</p>
    <p>Wind: ${currentData.wind_speed} MPH</p>
    <p>Humidity: ${currentData.humidity}%</p>
    <p>UV Index: <button id="uvi" class="btn ${uvIndex}">${currentData.uvi}</button></p>
    `
    );
    //send forecast data to displayForecast function
    displayForecast(forecastData);
  };
  
  //display 5 day forecast
  var displayForecast = function(forecastData) {
    //clear current html
    $('#forecastTitle').text('');
    $('#forecast').html('');
    //add 5-day forecast title
    $('#forecastTitle').text('5-day Weather Forecast: ')
    //loop through forecast data and add to html
    for (var i = 1; i < 6; i++) {
      var date = new Date(forecastData[i].dt * 1000);
      var month = date.getMonth() + 1;
      var day = date.getDate(); 
      var year = date.getFullYear();
      $('<div />', {
        'id': i,
        'class': 'card mt-1',
        'html': `
        <div class="card-body">
        <h5 class="card-title">${month}/${day}/${year}</h5>
        <img src="http://openweathermap.org/img/wn/${forecastData[i].weather[0].icon}@2x.png" alt="icon representing ${forecastData[i].weather[0].main}" class="weatherIcon">
        <p class="card-text">Temp: ${forecastData[i].temp.day}° F </p>
        <p class="card-text">Wind: ${forecastData[i].wind_speed} MPH</p>
        <p class="card-text">Humidity: ${forecastData[i].humidity}</p>
        </div>
        `,
      }).appendTo('#forecast')
    };
  };
  
  //load items from localStorage
  createSearchArr();