document.addEventListener("DOMContentLoaded", () => {
    const cameraResults = document.getElementById("camera-results");
    const priceRange = document.getElementById("price-range");
    const priceDisplay = document.getElementById("price-display");
    const filters = {
        brand: null,
        price: 500,
        sensorSize: [],
        sensorMegapixels: [],
        stillsResolution: [],
        videoResolution: []
    };

    // Fetch the cameras dataset
    fetch('cameras.json')
        .then(response => response.json())
        .then(cameras => {
            // Display cameras
            updateCameraList(cameras);

            // Add event listeners for filters
            document.querySelectorAll('input[name="brand"]').forEach(input => {
                input.addEventListener("change", () => {
                    filters.brand = input.value;
                    filterAndDisplayCameras(cameras, filters);
                });
            });

            priceRange.addEventListener("input", () => {
                filters.price = parseInt(priceRange.value);
                priceDisplay.textContent = filters.price;
                filterAndDisplayCameras(cameras, filters);
            });

            document.querySelectorAll('input[type="checkbox"]').forEach(input => {
                input.addEventListener("change", (event) => {
                    const filterKey = input.closest(".filter-group").querySelector("h3").textContent.replace(" ", "");
                    filters[filterKey.toLowerCase()] = getCheckedValues(filterKey.toLowerCase());
                    filterAndDisplayCameras(cameras, filters);
                });
            });
        });

    function updateCameraList(cameras) {
        cameraResults.innerHTML = cameras.length
            ? cameras.map(camera => `
                <div class="camera-item">
                    <h3>${camera.CameraName}</h3>
                    <p>Brand: ${camera.Brand}</p>
                    <p>Price: £${camera.Price}</p>
                    <p>Sensor Size: ${camera.SensorSize}</p>
                    <p>Sensor Megapixels: ${camera.SensorMegapixels} MP</p>
                    <p>Stills Resolution: ${camera.StillsResolution}</p>
                    <p>Video Resolution: ${camera.VideoResolution}</p>
                </div>
            `).join("")
            : "<p>No cameras match your filters.</p>";
    }

    function filterAndDisplayCameras(cameras, filters) {
        const filteredCameras = cameras.filter(camera => {
            return (!filters.brand || camera.Brand === filters.brand) &&
                   (camera.Price <= filters.price) &&
                   (!filters.sensorsize.length || filters.sensorsize.includes(camera.SensorSize)) &&
                   (!filters.sensormegapixels.length || filters.sensormegapixels.includes(camera.SensorMegapixels + " MP")) &&
                   (!filters.stillsresolution.length || filters.stillsresolution.includes(camera.StillsResolution)) &&
                   (!filters.videoresolution.length || filters.videoresolution.includes(camera.VideoResolution));
        });
        updateCameraList(filteredCameras);
    }

    function getCheckedValues(filterKey) {
        return Array.from(document.querySelectorAll(`input[type="checkbox"]:checked`))
            .filter(checkbox => checkbox.closest(".filter-group").querySelector("h3").textContent.replace(" ", "").toLowerCase() === filterKey)
            .map(checkbox => checkbox.value);
    }
});
