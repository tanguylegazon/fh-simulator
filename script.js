/********************
 * Global variables *
 ********************/
const graphWindowSize = 15;
const defaultUpdateInterval = 1000; // 1 second
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

let chart;
let intervalId;
let updateInterval;
let timeSlotCounter = 0;
let isPlaying = true;


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


/**************************
 * Global event listeners *
 **************************/
document.addEventListener('DOMContentLoaded', startSimulation);
numberPhonesInput.addEventListener('input', updateParameters);
numberFrequenciesInput.addEventListener('input', updateParameters);
speedInput.addEventListener('input', updateParameters);
playButton.addEventListener('click', togglePlayPause);
document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        event.preventDefault();
        togglePlayPause();
    }
});

/**
 * Starts the simulation.
 */
function startSimulation() {
    clearInterval(intervalId);
    updateInterval = defaultUpdateInterval / simulationSpeed;
    const context = document.getElementById('graph').getContext('2d');
    const graphData = [];
    const graphLabels = Array.from({length: graphWindowSize}, (_, i) => i + 1);

    for (let phoneIndex = 0; phoneIndex < numberOfPhones; ++phoneIndex) {
        graphData.push(createGraphLine(phoneIndex));
    }

    if (chart) {
        chart.destroy();
    }

    chart = createChart(context, graphLabels, graphData);
    timeSlotCounter = graphWindowSize;
    updatePhonesDisplay();
    intervalId = setInterval(updateChartData, updateInterval);
}

/**
 * Creates a graph line for a phone.
 * @param {number} phoneIndex - The index of the phone.
 * @returns {Object} - The graph line object.
 */
function createGraphLine(phoneIndex) {
    return {
        label: `Phone ${phoneIndex + 1}`,
        data: Array.from({length: graphWindowSize}, (_, i) => getFrequency(i, phoneIndex)),
        borderColor: getColor(phoneIndex),
        borderWidth: Math.ceil((phoneIndex + 1) / numberOfFrequencies) * 3.5,
        pointBackgroundColor: getColor(phoneIndex),
        fill: false
    };
}


/**
 * Creates a chart.
 * @param {CanvasRenderingContext2D} context - The canvas rendering context.
 * @param {Array} labels - The labels for the x-axis.
 * @param {Array} data - The data for the chart.
 * @returns {Chart} - The chart object.
 */
function createChart(context, labels, data) {
    return new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: data
        },
        options: {

            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time Slot'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency Band'
                    },
                    min: 0.8,
                    max: numberOfFrequencies + 0.2,
                    ticks: {
                        callback: function (value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Updates the phones display.
 */
function updatePhonesDisplay() {
    const phonesContainer = document.getElementById('phones-container');
    phonesContainer.innerHTML = '';
    const radius = phonesContainer.offsetHeight * 0.4;
    const angleStep = 360 / numberOfPhones;

    for (let phoneIndex = 0; phoneIndex < numberOfPhones; ++phoneIndex) {
        const phone = document.createElement('div');
        phone.classList.add('phone');
        phone.textContent = `${phoneIndex + 1}`;
        const angle = -90 + phoneIndex * angleStep;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);
        phone.style.transform = `translate(${x}px, ${y}px)`;
        phonesContainer.appendChild(phone);
    }
}

/**
 * Updates the simulation parameters.
 */
function updateParameters() {
    numberOfPhones = parseInt(numberPhonesInput.value);
    numberOfFrequencies = parseInt(numberFrequenciesInput.value);
    simulationSpeed = parseFloat(speedInput.value);

    updateInterval = defaultUpdateInterval / simulationSpeed;

    // Adjust the chart's y-axis max value
    chart.options.scales.y.max = numberOfFrequencies + 0.2;

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
        dataset.borderWidth = Math.ceil((phoneIndex + 1) / numberOfFrequencies) * 3.5;
    });

    updateGraph();

    // Apply new settings immediately
    chart.update();
    updatePhonesDisplay();
}

/**
 * Updates the graph.
 */
function updateGraph() {
    clearInterval(intervalId);
    if (isPlaying) {
        intervalId = setInterval(updateChartData, updateInterval);
    }
}

/**
 * Calculates the frequency for a given time slot and phone index.
 * @param {number} timeSlot - The time slot.
 * @param {number} phoneIndex - The index of the phone.
 * @returns {number} - The frequency.
 */
function getFrequency(timeSlot, phoneIndex) {
    return (timeSlot + phoneIndex) % numberOfFrequencies + 1;
}

/**
 * Updates the chart data.
 */
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

    ++timeSlotCounter;
    chart.update('none');
}

/**
 * Toggles play/pause.
 */
function togglePlayPause() {
    isPlaying = !isPlaying;
    playButton.textContent = isPlaying ? 'Pause' : 'Play';
    updateGraph();
}

/**
 * Gets the color for a phone.
 * @param {number} phoneIndex - The index of the phone.
 * @returns {string} - The color.
 */
function getColor(phoneIndex) {
    return colorPalette[phoneIndex % colorPalette.length];
}