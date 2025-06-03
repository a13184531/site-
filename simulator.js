document.addEventListener('DOMContentLoaded', () => {

    // 1. Data Store for Cars
    const carData = {
        'tesla_model_3_75': { name: 'Tesla Model 3 (75kWh)', capacity: 75 },
        'renault_zoe_52': { name: 'Renault Zoe (52kWh)', capacity: 52 },
        'nissan_leaf_40': { name: 'Nissan Leaf (40kWh)', capacity: 40 }
        // "custom" is handled directly in logic
    };

    // 2. DOM Element Selection
    const carModelSelect = document.getElementById('car-model');
    const batteryCapacityInput = document.getElementById('battery-capacity');
    const customCapacityGroup = document.getElementById('custom-battery-capacity-group');
    const currentChargeInput = document.getElementById('current-charge');
    const desiredChargeInput = document.getElementById('desired-charge');
    const chargerTypeSelect = document.getElementById('charger-type');
    const form = document.getElementById('charging-simulator-form');
    const resultsDiv = document.getElementById('simulation-results');
    const formErrorsDiv = document.getElementById('form-errors');

    // 3. Populate Car Model Dropdown & Handle Capacity Input
    // Car models are already in HTML, so no population needed here.

    if (carModelSelect && batteryCapacityInput && customCapacityGroup) {
        carModelSelect.addEventListener('change', () => {
            const selectedModelKey = carModelSelect.value;
            if (selectedModelKey && carData[selectedModelKey]) {
                batteryCapacityInput.value = carData[selectedModelKey].capacity;
                batteryCapacityInput.setAttribute('readonly', true);
                customCapacityGroup.style.display = 'none';
            } else if (selectedModelKey === 'custom') {
                batteryCapacityInput.value = '';
                batteryCapacityInput.removeAttribute('readonly');
                batteryCapacityInput.placeholder = 'e.g., 75';
                customCapacityGroup.style.display = 'block'; // Show the group
                // Defensive check before focus
                if (customCapacityGroup.style.display === 'block' && !batteryCapacityInput.hasAttribute('readonly') && !batteryCapacityInput.disabled) {
                    batteryCapacityInput.focus();
                }
            } else { // "Select Car Model" or other empty value
                batteryCapacityInput.value = '';
                batteryCapacityInput.setAttribute('readonly', true); // Default to readonly if no specific car or custom
                customCapacityGroup.style.display = 'none';
            }
        });
    }

    // 4. Form Submission and Calculation Logic
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            // Clear previous results and errors
            resultsDiv.innerHTML = '<p>Please fill in the details above to estimate charging time.</p>';
            resultsDiv.classList.remove('is-visible'); // Hide for animation if it was visible
            formErrorsDiv.innerHTML = '';
            formErrorsDiv.style.display = 'none';

            let errors = [];

            // Get Input Values
            const selectedCarModelValue = carModelSelect.value;
            let batteryCapacity = parseFloat(batteryCapacityInput.value);
            const currentCharge = parseFloat(currentChargeInput.value);
            const desiredCharge = parseFloat(desiredChargeInput.value);
            const chargerPower = parseFloat(chargerTypeSelect.value);

            // Input Validation
            if (selectedCarModelValue === 'custom' && (isNaN(batteryCapacity) || batteryCapacity <= 0)) {
                errors.push('Battery Capacity must be a positive number when "Other" is selected.');
            } else if (selectedCarModelValue !== 'custom' && (!carData[selectedCarModelValue] || isNaN(batteryCapacity) || batteryCapacity <=0 )) {
                 // This case should ideally not happen if dropdown is correctly populating capacity
                errors.push('Please select a valid car model or enter battery capacity manually.');
            }


            if (isNaN(currentCharge) || currentCharge < 0 || currentCharge > 100) {
                errors.push('Current Charge Level must be between 0 and 100.');
            }
            if (isNaN(desiredCharge) || desiredCharge < 0 || desiredCharge > 100) {
                errors.push('Desired Charge Level must be between 0 and 100.');
            }
            if (!isNaN(currentCharge) && !isNaN(desiredCharge) && desiredCharge <= currentCharge) {
                errors.push('Desired Charge Level must be greater than Current Charge Level.');
            }
            if (isNaN(chargerPower) || chargerPower <= 0) {
                errors.push('Please select a valid Charger Type.');
            }
             if (selectedCarModelValue === "") {
                errors.push('Please select a Car Model.');
            }


            if (errors.length > 0) {
                let errorHTML = '<ul>';
                errors.forEach(error => {
                    errorHTML += `<li>${error}</li>`;
                });
                errorHTML += '</ul>';
                formErrorsDiv.innerHTML = errorHTML;
                formErrorsDiv.style.display = 'block';
                resultsDiv.innerHTML = '<p>Please correct the errors above.</p>'; // Keep results area clean
                return;
            }

            // Calculation
            const energyNeeded_kWh = (desiredCharge - currentCharge) / 100 * batteryCapacity;

            // Determine charging efficiency
            let efficiencyFactor = 0.85; // Default for AC chargers (e.g., < 50kW)
            if (chargerPower >= 150) { // Very high power DC
                efficiencyFactor = 0.92;
            } else if (chargerPower >= 50) { // Standard DC Fast Chargers (50kW to 149kW)
                efficiencyFactor = 0.90;
            }
            // AC chargers (like 7kW, 22kW) will remain at 0.85


            const actualEnergyToSupply_kWh = energyNeeded_kWh / efficiencyFactor;
            const chargingTime_hours = actualEnergyToSupply_kWh / chargerPower;

            // Format and Display Results
            let hours = Math.floor(chargingTime_hours);
            let minutes = Math.round((chargingTime_hours - hours) * 60);

            // Handle cases where minutes might be 60
            if (minutes === 60) {
                hours += 1;
                minutes = 0;
            }

            let timeString = "";
            if (hours > 0) {
                timeString += `${hours} hour${hours > 1 ? 's' : ''}`;
            }
            if (minutes > 0) {
                if (hours > 0) timeString += " and ";
                timeString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
            }
            if (timeString === "") { // Should not happen with valid inputs but good fallback
                timeString = "Less than a minute (or inputs result in zero time)";
            }

            const carName = selectedCarModelValue === 'custom' ? 'Your vehicle' : carData[selectedCarModelValue]?.name || 'Selected vehicle';

            resultsDiv.innerHTML = `
                <h2>Estimated Charging Time</h2>
                <p class="estimated-time">${timeString}</p>
                <p class="details">
                    To charge ${carName} (Battery: ${batteryCapacity}kWh)
                    from ${currentCharge}% to ${desiredCharge}%
                    using a ${chargerPower}kW charger (assuming ~${(efficiencyFactor * 100).toFixed(0)}% efficiency).
                </p>
                <p class="details" style="font-size:0.8em; margin-top:15px;">
                    Note: This is an estimate. Actual charging times may vary due to battery temperature, age, charging curve, and other factors.
                </p>
            `;
            resultsDiv.classList.add('is-visible'); // For reveal animation

            // Scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // 5. Initial Setup
    // Trigger change on carModelSelect to set initial state of batteryCapacityInput and customCapacityGroup
    if (carModelSelect) {
        const initialEvent = new Event('change');
        carModelSelect.dispatchEvent(initialEvent);
    }
});
