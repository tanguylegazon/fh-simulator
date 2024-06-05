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


/**************************
 * Global event listeners *
 **************************/
document.addEventListener('DOMContentLoaded', startSimulation);

numberPhonesInput.addEventListener('input', updateParameters);
numberFrequenciesInput.addEventListener('input', updateParameters);
speedInput.addEventListener('input', updateSpeed);
playButton.addEventListener('click', togglePlayPause);



function startSimulation() {
    if (intervalId) {
        clearInterval(intervalId);
    }

    updateInterval = 1000 / simulationSpeed;

    const ctx = document.getElementById('graph').getContext('2d');

    const graphData = [];
    const graphLabels = Array.from({length: graphWindowSize}, (_, i) => i + 1); // Initial 20 time slots

    for (let i = 0; i < numberOfPhones; ++i) {
        const graphLine = {
            label: `Phone ${i + 1}`,
            data: [],
            borderColor: getRandomColor(),
            fill: false
        };

        for (let j = 0; j < graphWindowSize; ++j) {
            graphLine.data.push(getFrequency(j, i, numberOfFrequencies));
        }

        graphData.push(graphLine);
    }

    // Destroy previous chart if exists
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: graphLabels,
            datasets: graphData
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

     timeSlotCounter = 20;

    updatePhonesDisplay();

    // Update the chart data periodically
    intervalId = setInterval(() => {
        updateChartData(chart, numberOfPhones, numberOfFrequencies);
    }, updateInterval); // Update interval based on speed
}

function updatePhonesDisplay() {
    const phonesContainer = document.getElementById('phones-container');
    phonesContainer.innerHTML = '';

    const phonesContainerHeight = phonesContainer.offsetHeight;
    const radius = phonesContainerHeight * 0.4;

    const angleStep = 360 / numberOfPhones;
    for (let i = 0; i < numberOfPhones; ++i) {
        const phone = document.createElement('div');
        phone.classList.add('phone');
        phone.textContent = `${i + 1}`;

        const angle = - 90 + i * angleStep;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);

        phone.style.transform = `translate(${x}px, ${y}px)`;
        phonesContainer.appendChild(phone);
    }
}

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
            borderColor: getRandomColor(),
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


function updateSpeed() {
    const speed = parseFloat(document.getElementById('speed').value);
    updateInterval = 1000 / speed;

    updateGraph();

}

function updateGraph() {
    if (intervalId) {
        clearInterval(intervalId);
    }

    if (isPlaying) {
        intervalId = setInterval(() => {
            updateChartData(chart, numberOfPhones, numberOfFrequencies);
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
            data: Array.from({length: 20}, (_, i) => getFrequency(timeSlotCounter - 19 + i, phoneIndex, numBands)),
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
