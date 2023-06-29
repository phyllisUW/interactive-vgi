// Initialize your map with Leaflet.js and set it to University of Washington, Seattle
var map = L.map('map').setView([47.655548, -122.303200], 13);

// Add a tile layer to the map (Mapbox Streets layer)
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; OpenStreetMap contributors, CC-BY-SA, Imagery © Mapbox',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY2xpcDM2IiwiYSI6ImNrbGQwbHkyODQzeXAyd3Vpbm0zcmtjZjMifQ.CP1WgT3qS4809VGPhGElJA' // replace with your Mapbox access token
}).addTo(map);

// Add a contextmenu event listener (right-click)
map.on('contextmenu', function(e) {
    // Get the geographic coordinates from the event
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    // Construct the prefilled form URL
    var formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdI-83LCMEzwYVzKuo0JdbJboqM-WnbOqfEv2iSOjohI1yw2Q/viewform?usp=pp_url';
    formUrl += '&entry.2007238900=' + lat;
    formUrl += '&entry.1635045261=' + lng;

    // Create a popup at the clicked location with a link to the form
    var popup = L.popup()
        .setLatLng(e.latlng)
        .setContent('<a href="' + formUrl + '" target="_blank">Submit a Contribution</a>')
        .openOn(map);
});

// Initialize sentiment counts
var sentimentCounts = { 'Positive': 0, 'Negative': 0, 'Neutral': 0, 'Unknown': 0 };

// Initialize the sentiment info control
var sentimentInfo = L.control();

sentimentInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
sentimentInfo.update = function () {
    this._div.innerHTML = '<h4>Sentiment Statistics</h4>' + 
                          'Positive: ' + sentimentCounts['Positive'] + '<br>' +
                          'Negative: ' + sentimentCounts['Negative'] + '<br>' +
                          'Neutral: ' + sentimentCounts['Neutral'] + '<br>' +
                          'Unknown: ' + sentimentCounts['Unknown'];
};

sentimentInfo.addTo(map);

// Fetch data from Google Spreadsheet
fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vT0FPOu3T5WRAO5EtiN7usivXcRuOfbRTnjO5z1iaQGSGPdDIf-AyVB0IVm7YwTWHjSbCwFW6c9SVZP/pub?output=csv')
    .then(response => response.text())
    .then(data => {
        // Parse the CSV data
        let csvData = Papa.parse(data, {header: true}).data;

        // Iterate over each row in the data
        for (let row of csvData) {
            // Get the latitude and longitude from the row
            let lat = row['Lat'];
            let lng = row['Long'];
            let name = row['Name'];
            let date = row['Date'];
            let experience = row['Share your experience in this place'];
            let sentiment = row['Was the experience...'];

            // Increment sentiment count
            if (sentiment in sentimentCounts) {
                sentimentCounts[sentiment]++;
            } else {
                sentimentCounts['Unknown']++;
            }

            // Determine color based on sentiment
            let color;
            switch (sentiment) {
                case 'Positive':
                    color = 'green';
                    break;
                case 'Negative':
                    color = 'red';
                    break;
                case 'Neutral':
                    color = 'blue';
                    break;
                default:
                    color = 'gray'; // default color if sentiment is missing or not recognized
            }

            // Add a circleMarker to the map at the latitude and longitude
            L.circleMarker([lat, lng], { color: color }).addTo(map)
                .bindPopup(`<b>${name}</b><br>${date}<br>${experience}`);
        }
        sentimentInfo.update();// update the sentiment statistics
    });

