class KitManager {
    static addItem(type, item) {
        const kitItems = JSON.parse(localStorage.getItem('kitItems') || '{}');
        kitItems[type] = item;
        localStorage.setItem('kitItems', JSON.stringify(kitItems));
        window.history.back(); // Return to kit builder
    }
}

// Camera filtering functionality
class CameraFilter {
    constructor() {
        this.cameras = [];
        this.filters = {
            brand: null,
            sensorSize: [],
            megapixels: [],
            stillsResolution: [],
            videoResolution: [],
            lensMount: null,
            maxPrice: 10000
        };
    }

    async loadCameras() {
        try {
            const response = await fetch('datasets/camera_body_dataset.csv');
            const csvText = await response.text();
            this.cameras = this.parseCSV(csvText);
            this.displayResults(this.cameras);
        } catch (error) {
            console.error('Error loading cameras:', error);
        }
    }

    parseCSV(csvText) {
        try {
            const lines = csvText.split('\n');
            if (lines.length === 0) {
                console.error('CSV file is empty');
                return [];
            }
            
            const headers = lines[0].split(',').map(h => h.trim());
            console.log('CSV Headers:', headers); // Debug log
            
            const cameras = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const camera = {};
                headers.forEach((header, index) => {
                    camera[header] = values[index];
                });
                return camera;
            });
            
            console.log('Parsed cameras:', cameras); // Debug log
            return cameras;
            
        } catch (error) {
            console.error('Error parsing CSV:', error);
            return [];
        }
    }

    applyFilters() {
        let filtered = this.cameras;

        // Brand filter
        if (this.filters.brand) {
            filtered = filtered.filter(camera => camera.Brand === this.filters.brand);
        }

        // Sensor size filter
        if (this.filters.sensorSize.length) {
            filtered = filtered.filter(camera => 
                this.filters.sensorSize.includes(camera.SensorSize)
            );
        }

        // Megapixels filter
        if (this.filters.megapixels.length) {
            filtered = filtered.filter(camera => {
                const mp = parseFloat(camera.SensorMegapixels);
                return this.filters.megapixels.some(range => {
                    if (range === "20-24 MP") return mp >= 20 && mp < 24;
                    if (range === "24-36 MP") return mp >= 24 && mp < 36;
                    if (range === "36+ MP") return mp >= 36;
                    return false;
                });
            });
        }

        // Resolution filters
        if (this.filters.stillsResolution.length) {
            filtered = filtered.filter(camera =>
                this.filters.stillsResolution.includes(camera.StillsResolution)
            );
        }

        if (this.filters.videoResolution.length) {
            filtered = filtered.filter(camera =>
                this.filters.videoResolution.includes(camera.VideoResolution)
            );
        }

        // Lens mount filter
        if (this.filters.lensMount) {
            filtered = filtered.filter(camera => 
                camera.LensMountType === this.filters.lensMount
            );
        }

        // Price filter
        filtered = filtered.filter(camera => 
            parseFloat(camera.Price) <= this.filters.maxPrice
        );

        this.displayResults(filtered);
    }

    displayResults(cameras) {
        const resultsDiv = document.getElementById('camera-results');
        if (!resultsDiv) {
            console.error('Could not find camera-results element');
            return;
        }
        
        if (cameras.length === 0) {
            resultsDiv.innerHTML = '<p>No cameras match your filters.</p>';
            return;
        }

        console.log('Displaying cameras:', cameras); // Debug log

        resultsDiv.innerHTML = cameras.map(camera => `
            <div class="camera-item">
                <div class="camera-info">
                    <h3>${camera.CameraName}</h3>
                    <p class="price">£${parseFloat(camera.Price).toLocaleString()}</p>
                    <p><strong>Sensor:</strong> ${camera.SensorSize} (${camera.SensorMegapixels}MP)</p>
                    <p><strong>Resolution:</strong> ${camera.StillsResolution} Stills, ${camera.VideoResolution} Video</p>
                    <p><strong>Mount:</strong> ${camera.LensMountType}</p>
                    <p><strong>Weight:</strong> ${camera.Weight}g</p>
                </div>
                <button onclick="KitManager.addItem('camera', {
                    name: '${camera.CameraName}',
                    price: ${camera.Price},
                    weight: ${camera.Weight},
                    mount: '${camera.LensMountType}'
                })">Add to Kit</button>
            </div>
        `).join('');
    }
}

// Initialize filters when page loads
document.addEventListener('DOMContentLoaded', () => {
    const cameraFilter = new CameraFilter();
    cameraFilter.loadCameras();

    // Brand radio buttons
    document.querySelectorAll('input[name="brand"]').forEach(input => {
        input.addEventListener('change', (e) => {
            cameraFilter.filters.brand = e.target.value;
            cameraFilter.applyFilters();
        });
    });

    // Sensor size checkboxes
    document.querySelectorAll('input[value="Full Frame"], input[value="APS-C"], input[value="Micro Four Thirds"]')
        .forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    cameraFilter.filters.sensorSize.push(e.target.value);
                } else {
                    cameraFilter.filters.sensorSize = cameraFilter.filters.sensorSize
                        .filter(size => size !== e.target.value);
                }
                cameraFilter.applyFilters();
            });
        });

    // Megapixels checkboxes
    document.querySelectorAll('input[value="20-24 MP"], input[value="24-36 MP"], input[value="36+ MP"]')
        .forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    cameraFilter.filters.megapixels.push(e.target.value);
                } else {
                    cameraFilter.filters.megapixels = cameraFilter.filters.megapixels
                        .filter(range => range !== e.target.value);
                }
                cameraFilter.applyFilters();
            });
        });

    // Resolution checkboxes
    document.querySelectorAll('input[value="4K"], input[value="8K"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const filterType = e.target.closest('.filter-group').querySelector('h3').textContent.includes('Video') 
                ? 'videoResolution' 
                : 'stillsResolution';
            
            if (e.target.checked) {
                cameraFilter.filters[filterType].push(e.target.value);
            } else {
                cameraFilter.filters[filterType] = cameraFilter.filters[filterType]
                    .filter(res => res !== e.target.value);
            }
            cameraFilter.applyFilters();
        });
    });

    // Lens mount radio buttons
    document.querySelectorAll('input[name="LensMount"]').forEach(input => {
        input.addEventListener('change', (e) => {
            cameraFilter.filters.lensMount = e.target.value;
            cameraFilter.applyFilters();
        });
    });

    // Price range slider
    const priceRange = document.getElementById('price-range');
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            cameraFilter.filters.maxPrice = parseFloat(e.target.value);
            cameraFilter.applyFilters();
        });
    }
});
