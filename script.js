let chart;
let intervalId;
let timeSlotCounter = 0;
let updateInterval = 1000;
let isPlaying = true;

document.addEventListener('DOMContentLoaded', function () {
    startSimulation();

    document.getElementById('number-phones').addEventListener('input', updateParameters);
    document.getElementById('number-frequencies').addEventListener('input', updateParameters);
    document.getElementById('speed').addEventListener('input', updateSpeed);
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
});

function startSimulation() {
    if (intervalId) {
        clearInterval(intervalId);
    }

    const numPhones = parseInt(document.getElementById('number-phones').value);
    const numBands = parseInt(document.getElementById('number-frequencies').value);
    const speed = parseFloat(document.getElementById('speed').value);

    updateInterval = 1000 / speed;

    const ctx = document.getElementById('frequencyChart').getContext('2d');

    // Generate initial frequency hopping data based on HSN0
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
            phoneData.data.push(getFrequency(j, i, numBands));
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

    // Add phones around the antenna
    updatePhones(numPhones);

    // Update the chart data periodically
    intervalId = setInterval(() => {
        updateChartData(chart, numPhones, numBands);
    }, updateInterval); // Update interval based on speed
}

function updatePhones(numPhones) {
    const phonesContainer = document.getElementById('phones-container');
    phonesContainer.innerHTML = '';

    const containerWidth = phonesContainer.offsetWidth;
    const containerHeight = phonesContainer.offsetHeight;
    const radius = Math.min(containerWidth, containerHeight) * 0.4;

    const angleStep = 360 / numPhones;
    for (let i = 0; i < numPhones; i++) {
        const phone = document.createElement('div');
        phone.classList.add('phone');
        phone.textContent = `${i + 1}`;

        const angle = i * angleStep;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);

        phone.style.transform = `translate(${x}px, ${y}px)`;
        phonesContainer.appendChild(phone);
    }
}

function updateParameters() {
    const numPhones = parseInt(document.getElementById('number-phones').value);
    const numBands = parseInt(document.getElementById('number-frequencies').value);

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
    updatePhones(numPhones);
}

function updateSpeed() {
    const speed = parseFloat(document.getElementById('speed').value);
    updateInterval = 1000 / speed;

    if (intervalId) {
        clearInterval(intervalId);
    }

    const numPhones = parseInt(document.getElementById('number-phones').value);
    const numBands = parseInt(document.getElementById('number-frequencies').value);

    if (isPlaying) {
        intervalId = setInterval(() => {
            updateChartData(chart, numPhones, numBands);
        }, updateInterval); // Update interval based on speed
    }
}

function togglePlayPause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (isPlaying) {
        clearInterval(intervalId);
        playPauseBtn.textContent = 'Play';
    } else {
        const numPhones = parseInt(document.getElementById('number-phones').value);
        const numBands = parseInt(document.getElementById('number-frequencies').value);
        intervalId = setInterval(() => {
            updateChartData(chart, numPhones, numBands);
        }, updateInterval);
        playPauseBtn.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
}

function getFrequency(timeSlot, phoneIndex, numBands) {
    return (timeSlot + phoneIndex) % numBands + 1;
}

function updateChartData(chart, numPhones, numBands) {
    chart.data.labels.push(timeSlotCounter + 1);
    chart.data.labels.shift(); // Keep only the latest 20 time slots

    chart.data.datasets.forEach((dataset, phoneIndex) => {
        if (phoneIndex < numPhones) {
            dataset.data.push(getFrequency(timeSlotCounter, phoneIndex, numBands));
            dataset.data.shift(); // Keep only the latest 20 data points
        } else {
            dataset.data = []; // Clear data for phones that are no longer present
        }
    });

    while (chart.data.datasets.length < numPhones) {
        const phoneIndex = chart.data.datasets.length;
        const phoneData = {
            label: `Phone ${phoneIndex + 1}`,
            data: Array.from({ length: 20 }, (_, i) => getFrequency(timeSlotCounter - 19 + i, phoneIndex, numBands)),
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
