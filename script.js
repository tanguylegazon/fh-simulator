let chart;
let intervalId;
let timeSlotCounter = 0;
let updateInterval = 1000;

document.addEventListener('DOMContentLoaded', function () {
    // Include Chart.js library
    document.getElementById('simulateBtn').addEventListener('click', startSimulation);

    document.getElementById('number-phones').addEventListener('input', updateParameters);
    document.getElementById('number-frequencies').addEventListener('input', updateParameters);
    document.getElementById('number-hsn').addEventListener('change', updateParameters);
    document.getElementById('speed').addEventListener('input', updateSpeed);
});

function startSimulation() {
    if (intervalId) {
        clearInterval(intervalId);
    }

    const numPhones = parseInt(document.getElementById('number-phones').value);
    const numBands = parseInt(document.getElementById('number-frequencies').value);
    const hsn = parseInt(document.getElementById('number-hsn').value);
    const speed = parseFloat(document.getElementById('speed').value);

    updateInterval = 1000 / speed;

    const ctx = document.getElementById('frequencyChart').getContext('2d');

    // Generate initial frequency hopping data based on HSN
    const data = [];
    const labels = Array.from({ length: 20 }, (_, i) => i + 1); // Initial 20 time slots

    for (let i = 0; i < numPhones; i++) {
        const phoneData = {
            label: `Phone ${i + 1}`,
            data: [],
            borderColor: getRandomColor(),
            fill: false
        };

        for (let j = 0; j < 20; j++) {
            phoneData.data.push(getFrequency(j, i, numBands, hsn));
        }

        data.push(phoneData);
    }

    // Destroy previous chart if exists
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: data
        },
        options: {
            animation: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time Slot'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency Band'
                    },
                    min: 1,
                    max: numBands
                }
            }
        }
    });

    // Initialize timeSlotCounter
    timeSlotCounter = 20;

    // Update the chart data periodically
    intervalId = setInterval(() => {
        updateChartData(chart, numPhones, numBands, hsn);
    }, updateInterval); // Update interval based on speed
}

function updateParameters() {
    const numPhones = parseInt(document.getElementById('number-phones').value);
    const numBands = parseInt(document.getElementById('number-frequencies').value);
    const hsn = parseInt(document.getElementById('number-hsn').value);

    // Adjust the chart's y-axis max value
    chart.options.scales.y.max = numBands;

    // Adjust the datasets
    while (chart.data.datasets.length > numPhones) {
        chart.data.datasets.pop();
    }

    while (chart.data.datasets.length < numPhones) {
        const phoneIndex = chart.data.datasets.length;
        const phoneData = {
            label: `Phone ${phoneIndex + 1}`,
            data: Array(20).fill(null),
            borderColor: getRandomColor(),
            fill: false
        };
        chart.data.datasets.push(phoneData);
    }

    // Ensure current datasets are updated
    chart.data.datasets.forEach((dataset, phoneIndex) => {
        if (dataset.data.length < 20) {
            dataset.data = Array(20).fill(null);
        }
        dataset.label = `Phone ${phoneIndex + 1}`;
    });

    // Apply new settings immediately
    chart.update();
}

function updateSpeed() {
    const speed = parseFloat(document.getElementById('speed').value);
    updateInterval = 1000 / speed;

    if (intervalId) {
        clearInterval(intervalId);
    }

    const numPhones = parseInt(document.getElementById('number-phones').value);
    const numBands = parseInt(document.getElementById('number-frequencies').value);
    const hsn = parseInt(document.getElementById('number-hsn').value);

    intervalId = setInterval(() => {
        updateChartData(chart, numPhones, numBands, hsn);
    }, updateInterval); // Update interval based on speed
}

function getFrequency(timeSlot, phoneIndex, numBands, hsn) {
    switch (hsn) {
        case 0:
            return (timeSlot + phoneIndex) % numBands + 1;
        case 1:
            return (timeSlot * phoneIndex) % numBands + 1;
        case 2:
            return ((timeSlot + phoneIndex) * 2) % numBands + 1;
        case 3:
            return ((timeSlot + phoneIndex) * 3 + 1) % numBands + 1;
        default:
            return (timeSlot + phoneIndex) % numBands + 1;
    }
}

function updateChartData(chart, numPhones, numBands, hsn) {
    chart.data.labels.push(timeSlotCounter + 1);
    chart.data.labels.shift(); // Keep only the latest 20 time slots

    chart.data.datasets.forEach((dataset, phoneIndex) => {
        if (phoneIndex < numPhones) {
            dataset.data.push(getFrequency(timeSlotCounter, phoneIndex, numBands, hsn));
            dataset.data.shift(); // Keep only the latest 20 data points
        } else {
            dataset.data = []; // Clear data for phones that are no longer present
        }
    });

    while (chart.data.datasets.length < numPhones) {
        const phoneIndex = chart.data.datasets.length;
        const phoneData = {
            label: `Phone ${phoneIndex + 1}`,
            data: Array.from({ length: 20 }, (_, i) => getFrequency(timeSlotCounter - 19 + i, phoneIndex, numBands, hsn)),
            borderColor: getRandomColor(),
            fill: false
        };
        chart.data.datasets.push(phoneData);
    }

    chart.options.scales.y.max = numBands;

    timeSlotCounter++; // Increment the time slot counter

    chart.update('none'); // Prevent animation during update
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}