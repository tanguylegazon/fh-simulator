/*!
 * This file is licensed under the MIT License.
 * For more information, see https://github.com/tanguylegazon/fh-simulator/blob/main/LICENSE.
 */

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

let graph;
let intervalId;
let updateInterval;
let timeSlotCounter = 1;
let isPlaying = true;
let numberOfPhones;
let numberOfFrequencies;
let hsnValue;
let simulationSpeed;


/*********************
 * Document elements *
 *********************/
const numberPhonesInput = document.getElementById('nb-phones');
const numberFrequenciesInput = document.getElementById('nb-frequencies');
const hsn = document.getElementById('hsn');
const speedSlider = document.getElementById('speed-slider');
const speedOutput = document.getElementById('speed-output');
const playButton = document.getElementById('play-button');
const playButtonText = document.getElementById('play-text');
const decreaseButtons = document.querySelectorAll('.counter-decrease');
const increaseButtons = document.querySelectorAll('.counter-increase');


/**************************
 * Global event listeners *
 **************************/
document.addEventListener('DOMContentLoaded', initialize);
numberPhonesInput.addEventListener('input', updateSimulationParameters);
numberFrequenciesInput.addEventListener('input', updateSimulationParameters);
hsn.addEventListener('input', updateSimulationParameters);
hsn.addEventListener('focus', function () {
    this.select();
});
hsn.addEventListener('blur', function () {
    hsn.value = String(hsnValue);
});

hsn.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        hsn.value = String(hsnValue);
        this.blur();
    }
});
speedSlider.addEventListener('input', updateSimulationParameters);
playButton.addEventListener('click', togglePlayPause);
decreaseButtons.forEach(button => button.addEventListener('click', decreaseInputValue));
increaseButtons.forEach(button => button.addEventListener('click', increaseInputValue));
window.addEventListener('resize', updatePhonesDisplay);
document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        event.preventDefault();
        togglePlayPause();
    }
});

/**
 * Initializes the code by updating the parameters and starting the simulation.
 */
function initialize() {
    updateSimulationParameters();
    startSimulation();
}

/**
 * Starts the simulation by creating the graph.
 */
function startSimulation() {
    const context = document.getElementById('graph').getContext('2d');
    const graphData = [];
    const graphLabels = Array.from({length: graphWindowSize}, (_, i) => i + timeSlotCounter);

    // Create a graph line for each phone
    for (let phoneIndex = 0; phoneIndex < numberOfPhones; ++phoneIndex) {
        graphData.push(createGraphLine(phoneIndex));
    }

    // Destroy the previous graph if it exists
    if (graph) {
        graph.destroy();
    }

    // Create a new graph
    graph = createGraph(context, graphLabels, graphData);

    clearInterval(intervalId);
    intervalId = setInterval(updateGraphData, updateInterval);
}

/**
 * Creates a graph object.
 * @param {CanvasRenderingContext2D} context - The canvas rendering context.
 * @param {Array} labels - The labels for the x-axis.
 * @param {Array} data - The data for the graph.
 * @returns {Chart} - The graph object.
 */
function createGraph(context, labels, data) {
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
 * Creates a graph line for a phone.
 * @param {number} phoneIndex - The index of the phone.
 * @returns {Object} - The graph line object.
 */
function createGraphLine(phoneIndex) {
    return {
        label: `Phone ${phoneIndex + 1}`,
        data: Array(Math.min(timeSlotCounter - 1, graphWindowSize)).fill(null),
        borderColor: getColor(phoneIndex),
        borderWidth: Math.ceil((phoneIndex + 1) / numberOfFrequencies) * 3.5,
        backgroundColor: changeLightness(getColor(phoneIndex), 15),
        fill: false
    };
}

/**
 * Updates the simulation parameters based on the user input.
 */
function updateSimulationParameters() {
    // Retrieve the user input values
    numberOfPhones = parseInt(numberPhonesInput.value);
    numberOfFrequencies = parseInt(numberFrequenciesInput.value);
    simulationSpeed = parseFloat(speedSlider.value) || 0.5;
    hsnValue = (hsn.value === '' ? 0 : parseInt(hsn.value)) < 0 ? 0 : (hsn.value === '' ? 0 : parseInt(hsn.value)) > 63 ? 63 : (hsn.value === '' ? 0 : parseInt(hsn.value));
    updateInterval = defaultUpdateInterval / simulationSpeed;

    // Update the displayed values
    hsn.value = String(hsnValue);
    speedOutput.textContent = `${simulationSpeed}x`;

    updateGraphParameters();
    updatePhonesDisplay();
}

/**
 * Updates the graph every update interval when the simulation is playing.
 */
function updateGraph() {
    clearInterval(intervalId);
    if (isPlaying) {
        intervalId = setInterval(updateGraphData, updateInterval);
    }
}

/**
 * Updates the graph parameters based on the simulation parameters.
 */
function updateGraphParameters() {
    if (graph) {
        graph.options.scales.y.max = numberOfFrequencies + 0.2;

        // Remove a phone if the number of phones has decreased
        while (graph.data.datasets.length > numberOfPhones) {
            graph.data.datasets.pop();
        }

        // Add a phone if the number of phones has increased
        while (graph.data.datasets.length < numberOfPhones) {
            const phoneIndex = graph.data.datasets.length;
            const graphLine = createGraphLine(phoneIndex);
            graph.data.datasets.push(graphLine);
        }

        updateGraph();
        graph.update();
    }
}

/**
 * Updates the graph data.
 */
function updateGraphData() {
    // Add a new time slot to the graph (x-axis)
    if (timeSlotCounter > graphWindowSize) {
        graph.data.labels.push(timeSlotCounter);
        graph.data.labels.shift();
    }

    // Add the frequency of each phone to the graph (y-axis)
    graph.data.datasets.forEach((dataset, phoneIndex) => {
        if (phoneIndex < numberOfPhones) {
            dataset.data.push(getFrequencyHSN(timeSlotCounter, phoneIndex));
            if (timeSlotCounter > graphWindowSize) dataset.data.shift();
            dataset.borderWidth = Math.ceil((phoneIndex + 1) / numberOfFrequencies) * 3.5;
        } else {
            dataset.data = [];
        }
    });

    graph.update('none');

    ++timeSlotCounter;
}

/**
 * Updates the display of the phones around the antenna.
 */
function updatePhonesDisplay() {
    const phonesContainer = document.getElementById('phones-container');
    phonesContainer.innerHTML = '';

    // Calculate the radius and angle step for the phones to be evenly distributed around the antenna
    const radius = phonesContainer.offsetHeight * 0.4;
    const angleStep = 360 / numberOfPhones;

    // Create a phone icon for each phone and position it on the page
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


/*********
 * Utils *
 *********/
/**
 * Gets the assigned frequency for a phone at a given time slot based on the HSN value. HSN0 use a different logic than
 * other HSN values.
 * @param {number} timeSlot - The time slot.
 * @param {number} phoneIndex - The index of the phone.
 * @returns {number} - The assigned frequency.
 */
function getFrequencyHSN(timeSlot, phoneIndex) {
    if (hsnValue === 0) {
        return (timeSlot + phoneIndex) % numberOfFrequencies + 1;
    } else {
        const sequenceLength = numberOfFrequencies + hsnValue;
        const sequenceIndex = (timeSlot - 1) % sequenceLength;
        const seed = hsnValue * (phoneIndex + 1) * sequenceIndex;
        return (getPseudoRandom(seed) + phoneIndex) % numberOfFrequencies + 1;
    }
}

/**
 * Generates a pseudo-random number based on a seed.
 * CAUTION: This function is not cryptographically secure.
 * @param seed - The seed which generates the pseudo-random number.
 * @returns {number} - A pseudo-random number between 0 and 2147483646.
 */
function getPseudoRandom(seed) {
    return (1103515245 * seed + 12345) % 2147483647;
}

/**
 * Gets a color from the color palette based on the phone index.
 * @param {number} phoneIndex - The index of the phone.
 * @returns {string} - The color in hexadecimal format.
 */
function getColor(phoneIndex) {
    return colorPalette[phoneIndex % colorPalette.length];
}

/**
 * Changes the lightness of an hexadecimal color.
 * @param hex - The color in hexadecimal format.
 * @param gap - The gap to change the lightness.
 * @returns {string} - The new color in hexadecimal format.
 */
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


/*****************************
 * HTML buttons & animations *
 *****************************/
/**
 * Toggles the play/pause state.
 */
function togglePlayPause() {
    isPlaying = !isPlaying;
    playButtonText.textContent = isPlaying ? 'Pause' : 'Play';
    if (isPlaying) {
        playButton.classList.add('playing');
    } else {
        playButton.classList.remove('playing');
    }
    togglePulseAnimation();
    updateGraph();
}

/**
 * Toggles the radio pulse animation on the antenna.
 */
function togglePulseAnimation() {
    const pulseElements = document.querySelectorAll('.pulse');
    pulseElements.forEach(pulse => {
        if (isPlaying) {
            pulse.classList.add('animating');
        } else {
            pulse.classList.remove('animating');
        }
    });
}

/**
 * Decreases the input value by one.
 */
function decreaseInputValue() {
    const input = this.nextElementSibling;
    if (parseInt(input.value) > parseInt(input.min)) {
        --input.value;
        input.dispatchEvent(new Event('input'));
    }
}

/**
 * Increases the input value by one.
 */
function increaseInputValue() {
    const input = this.previousElementSibling;
    if (parseInt(input.value) < parseInt(input.max)) {
        ++input.value;
        input.dispatchEvent(new Event('input'));
    }
}