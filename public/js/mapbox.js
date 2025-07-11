console.log("Hello From The Client Side Server");


document.addEventListener('DOMContentLoaded', function() {
    let locations;
    locations = JSON.parse(document.getElementById('map').dataset.locations);
    console.log(locations);
});