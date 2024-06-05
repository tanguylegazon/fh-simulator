/********************
 * Global variables *
 ********************/
let chart;
let intervalId;
let timeSlotCounter = 0;
let updateInterval = 1000; // 1 second
let isPlaying = true;
const graphWindowSize = 10;


/*********************
 * Document elements *
 *********************/
const numberPhonesInput = document.getElementById('number-phones');
const numberFrequenciesInput = document.getElementById('number-frequencies');
const speedInput = document.getElementById('speed');
const playButton = document.getElementById('play-button');

let numberOfPhones = parseInt(numberPhonesInput.value);
let numberOfFrequencies = parseInt(numberFrequenciesInput.value);
let simulationSpeed = parseFloat(speedInput.value);

const colorPalette = [
    "#36A2EB", // Blue
    "#FF6384", // Red
    "#4BC0C0", // Cyan
    "#FF9F40", // Orange
    "#9966FF", // Purple
    "#FFCD56", // Yellow
    "#C9CBCF", // Gray
    "#66E8FF", // Sky Blue
    "#FF99DF", // Pink
    "#99FF99"  // Lime Green
];


/**************************
 * Global event listeners *
 **************************/
document.addEventListener('DOMContentLoaded', startSimulation);
numberPhonesInput.addEventListener('input', updateParameters);
numberFrequenciesInput.addEventListener('input', updateParameters);
speedInput.addEventListener('input', updateSpeed);
playButton.addEventListener('click', togglePlayPause);

// Start simulation
function startSimulation() {
    clearInterval(intervalId);
    updateInterval = 1000 / simulationSpeed;
    const ctx = document.getElementById('graph').getContext('2d');
    const graphData = [];
    const graphLabels = Array.from({length: graphWindowSize}, (_, i) => i + 1);

    for (let i = 0; i < numberOfPhones; ++i) {
        graphData.push(createGraphLine(i));
    }

    if (chart) {
        chart.destroy();
    }

    chart = createChart(ctx, graphLabels, graphData);
    timeSlotCounter = graphWindowSize;
    updatePhonesDisplay();
    intervalId = setInterval(updateChartData, updateInterval);
}

// Create graph line
function createGraphLine(phoneIndex) {
    return {
        label: `Phone ${phoneIndex + 1}`,
        data: Array.from({length: graphWindowSize}, (_, i) => getFrequency(i, phoneIndex)),
        borderColor: getColor(phoneIndex),
        fill: false
    };
}

// Create chart
function createChart(ctx, labels, data) {
    return new Chart(ctx, {
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
                    max: numberOfFrequencies,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update phones display
function updatePhonesDisplay() {
    const phonesContainer = document.getElementById('phones-container');
    phonesContainer.innerHTML = '';
    const radius = phonesContainer.offsetHeight * 0.4;
    const angleStep = 360 / numberOfPhones;

    for (let i = 0; i < numberOfPhones; ++i) {
        const phone = document.createElement('div');
        phone.classList.add('phone');
        phone.textContent = `${i + 1}`;
        const angle = -90 + i * angleStep;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);
        phone.style.transform = `translate(${x}px, ${y}px)`;
        phonesContainer.appendChild(phone);
    }
}

// Update parameters
function updateParameters() {
    numberOfPhones = parseInt(numberPhonesInput.value);
    numberOfFrequencies = parseInt(numberFrequenciesInput.value);
    simulationSpeed = parseFloat(speedInput.value);

    // Adjust the chart's y-axis max value
    chart.options.scales.y.max = numberOfFrequencies;

    // Adjust the datasets
    while (chart.data.datasets.length > numberOfPhones) {
        chart.data.datasets.pop();
    }

    while (chart.data.datasets.length < numberOfPhones) {
        const phoneIndex = chart.data.datasets.length;
        const graphLine = {
            label: `Phone ${phoneIndex + 1}`,
            data: Array(graphWindowSize).fill(null),
            borderColor: getColor(phoneIndex),
            fill: false
        };
        chart.data.datasets.push(graphLine);
    }

    // Update the data of each dataset for future time slots
    chart.data.datasets.forEach((dataset, phoneIndex) => {
        const futureData = Array.from({length: graphWindowSize - dataset.data.length}, (_, i) => getFrequency(timeSlotCounter + i + 1, phoneIndex, numberOfFrequencies));
        dataset.data = dataset.data.concat(futureData);
    });

    updateGraph();

    // Apply new settings immediately
    chart.update();
    updatePhonesDisplay();
}

// Update speed
function updateSpeed() {
    simulationSpeed = parseFloat(speedInput.value);
    updateInterval = 1000 / simulationSpeed;
    updateGraph();
}

// Update graph
function updateGraph() {
    clearInterval(intervalId);
    if (isPlaying) {
        intervalId = setInterval(updateChartData, updateInterval);
    }
}

// Toggle play/pause
function togglePlayPause() {
    isPlaying = !isPlaying;
    playButton.textContent = isPlaying ? 'Pause' : 'Play';
    updateGraph();
}

// Get frequency
function getFrequency(timeSlot, phoneIndex) {
    return (timeSlot + phoneIndex) % numberOfFrequencies + 1;
}

// Update chart data
function updateChartData() {
    chart.data.labels.push(timeSlotCounter + 1);
    chart.data.labels.shift();

    chart.data.datasets.forEach((dataset, phoneIndex) => {
        if (phoneIndex < numberOfPhones) {
            dataset.data.push(getFrequency(timeSlotCounter, phoneIndex));
            dataset.data.shift();
        } else {
            dataset.data = [];
        }
    });

    timeSlotCounter++;
    chart.update('none');
}

// Get color
function getColor(phoneIndex) {
    return colorPalette[phoneIndex % colorPalette.length];
}
