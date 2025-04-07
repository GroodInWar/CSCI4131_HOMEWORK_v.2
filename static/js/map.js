let map;
let directionsService;
let directionsRenderer;
let markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 44.9778, lng: -93.2650 },
        zoom: 13,
        mapId: "DEMO_MAP_ID"
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map, suppressMarkers: true });

    document.querySelectorAll('.locations').forEach(async (element) => {
        const rawText = element.textContent.trim();
        const locationText = enhanceAddress(rawText);

        try {
            const { results } = await new google.maps.Geocoder().geocode({ address: locationText });
            if (results[0]) {
                const marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    title: rawText
                });

                // Info Window implementation
                const infowindow = new google.maps.InfoWindow({
                    content: `<strong>${rawText}</strong>`
                });

                marker.addListener('mouseover', () => infowindow.open(map, marker));
                marker.addListener('mouseout', () => infowindow.close());

                markers.push(marker);
            }
        } catch (error) {
            console.error('Geocode failed for:', rawText, error);
        }
    });

    // Form submission handler
    document.getElementById('map_search').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateAndDisplayRoute();
    });
}

function enhanceAddress(address) {
    if (['Home', 'Online'].includes(address)) return null;
    if (!address.includes(',')) {
        return `${address}, Minneapolis, MN 55455, USA`;
    }
    return address;
}

function calculateAndDisplayRoute() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const start = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                const end = document.getElementById('destination').value;
                const selectedMode = document.querySelector('input[name="direction"]:checked').value.toUpperCase();

                directionsService.route({
                    origin: start,
                    destination: end,
                    travelMode: google.maps.TravelMode[selectedMode]
                }, (response, status) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(response);
                    } else {
                        alert('Directions request failed: ' + status);
                    }
                });
            },
            () => alert('Error: Geolocation failed.')
        );
    } else {
        alert('Error: Browser doesn\'t support geolocation.');
    }
}