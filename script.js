/********************
 * Global variables *
 ********************/
const graphWindowSize = 15;
const defaultUpdateInterval = 1000; // 1 second
const colorPalette = [
    "#36A2EB", // Blue
    "#FF6384", // Red
    "#FF9F40", // Orange
    "#4BC0C0", // Cyan
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
const numberPhonesInput = document.getElementById('nb-phones');
const numberFrequenciesInput = document.getElementById('nb-frequencies');
const hsnSlider = document.getElementById('hsn-slider');
const hsnOutput = document.getElementById('hsn-output');
const speedSlider = document.getElementById('speed-slider');
const speedOutput = document.getElementById('speed-output');
const playButton = document.getElementById('play-button');
const playButtonText = document.getElementById('play-text');

const decreaseButtons = document.querySelectorAll('.counter-decrease');
const increaseButtons = document.querySelectorAll('.counter-increase');

let numberOfPhones = parseInt(numberPhonesInput.value);
let numberOfFrequencies = parseInt(numberFrequenciesInput.value);
let simulationSpeed = parseFloat(speedSlider.value) || 0.5;
let hsnValue = parseFloat(hsnSlider.value);

hsnOutput.textContent = `${hsnValue}`;
speedOutput.textContent = `${simulationSpeed}x`;

/**************************
 * Global event listeners *
 **************************/
document.addEventListener('DOMContentLoaded', startSimulation);
numberPhonesInput.addEventListener('input', updateParameters);
numberFrequenciesInput.addEventListener('input', updateParameters);
hsnSlider.addEventListener('input', updateParameters);
speedSlider.addEventListener('input', updateParameters);
playButton.addEventListener('click', togglePlayPause);
document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        event.preventDefault();
        togglePlayPause();
    }
});
decreaseButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.nextElementSibling;
        if (parseInt(input.value) > parseInt(input.min)) {
            --input.value;
            input.dispatchEvent(new Event('input'));
        }
    });
});
increaseButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        if (parseInt(input.value) < parseInt(input.max)) {
            ++input.value;
            input.dispatchEvent(new Event('input'));
        }
    });
});
window.addEventListener('resize', function (event) {
    updatePhonesDisplay();
});

playButton.addEventListener('click', () => {

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
 * @param {number} [timeSlot] - The time slot for which the graph line is created.
 * If not provided, the current time slot is used.
 * @returns {Object} - The graph line object.
 */
function createGraphLine(phoneIndex, timeSlot = timeSlotCounter) {
    return {
        label: `Phone ${phoneIndex + 1}`,
        data: Array(graphWindowSize).fill(null),
        borderColor: getColor(phoneIndex),
        borderWidth: Math.ceil((phoneIndex + 1) / numberOfFrequencies) * 3.5,
        backgroundColor: changeLightness(getColor(phoneIndex), 15),
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
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: {
                    tension: 0,
                    borderJoinStyle: 'round'
                }
            },
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
                        stepSize: 1,
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
    simulationSpeed = parseFloat(speedSlider.value) || 0.5;
    hsnValue = parseFloat(hsnSlider.value);
    hsnOutput.textContent = `${hsnValue}`;
    speedOutput.textContent = `${simulationSpeed}x`;

    updateInterval = defaultUpdateInterval / simulationSpeed;
    chart.options.scales.y.max = numberOfFrequencies + 0.2;

    while (chart.data.datasets.length > numberOfPhones) {
        chart.data.datasets.pop();
    }

    while (chart.data.datasets.length < numberOfPhones) {
        const phoneIndex = chart.data.datasets.length;
        const graphLine = createGraphLine(phoneIndex);
        chart.data.datasets.push(graphLine);
    }

    chart.data.datasets.forEach((dataset, phoneIndex) => {
        const futureData = Array.from({length: graphWindowSize - dataset.data.length}, (_, i) => getFrequencyHSN(timeSlotCounter + i + 1, phoneIndex, numberOfFrequencies));
        dataset.data = dataset.data.concat(futureData);
        dataset.borderWidth = Math.ceil((phoneIndex + 1) / numberOfFrequencies) * 3.5;
    });

    updateGraph();

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
function getFrequencyHSN(timeSlot, phoneIndex) {
    if (hsnValue === 0) {
        return (timeSlot + phoneIndex) % numberOfFrequencies + 1;
    } else {
        const sequenceLength = numberOfFrequencies + hsnValue;
        const sequenceIndex = (timeSlot - 1) % sequenceLength;
        const seed = hsnValue * (phoneIndex + 1) * sequenceIndex;
        return getPseudoRandom(seed) % numberOfFrequencies + 1;
    }
}

/**
 * Updates the chart data.
 */
function updateChartData() {
    chart.data.labels.push(timeSlotCounter + 1);
    chart.data.labels.shift();

    chart.data.datasets.forEach((dataset, phoneIndex) => {
        if (phoneIndex < numberOfPhones) {
            dataset.data.push(getFrequencyHSN(timeSlotCounter, phoneIndex));
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
    playButtonText.textContent = isPlaying ? 'Pause' : 'Play';
    if (isPlaying) {
        playButton.classList.add('playing');
    } else {
        playButton.classList.remove('playing');
    }
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

function changeLightness(hex, gap) {
    let [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16) / 255);
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    let d = max - min;

    if (d === 0) {
        h = s = 0;
    } else {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    l = Math.min(1, l + gap / 100);

    const hue2rgb = (p, q, t) => {
        t = (t < 0) ? t + 1 : (t > 1) ? t - 1 : t;
        return t < 1 / 6 ? p + (q - p) * 6 * t :
            t < 1 / 2 ? q :
                t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
    };

    if (s === 0) {
        r = g = b = l;
    } else {
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return "#" + [r, g, b].map(x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}


function getPseudoRandom(seed) {
    return (1103515245 * seed + 12345) % 2147483647;
}