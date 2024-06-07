# Frequency Hopping Simulator

## Description

The **Frequency Hopping Simulator** is a student project that simulates the frequency hopping technique used in wireless
communications. This simulator allows users to visualize and experiment with different configurations of phones and
frequency bands.

## Features

- Adjustment of the number of simulated phones.
- Adjustment of the number of frequency bands.
- Choice of the Hopping Sequence Number (HSN)<sup>1</sup>.
- Control of the hopping speed.
- Real-time visualization of frequency hopping on a chart.

## Technologies Used

- **HTML** for page structure.
- **CSS** for styling and layout.
- **JavaScript** for application logic and user interactions.
    - **Chart.js** for graphical data visualization.

## Project Files

- `index.html`: The main project page.
- `style.css`: CSS styles for layout and visual elements.
- `script.js`: JavaScript script for application logic.
- `img/antenna.png` and `img/phone.png`: Images used to represent the antenna and phones.

## Usage

### Setup

To use this simulator, you can either:

1. Access the live version at [tanguy-portfolio.com/simulator](https://tanguy-portfolio.com/simulator).
2. Download the project files and open the `index.html` in your web browser.

### Functionality

- Use the <control>+</control> and <control>-</control> buttons to adjust the number of phones, frequency bands, and
  HSN.
- Use the slider to adjust the frequency hopping speed.
- Click the <control>Play</control>/<control>Pause</control> button to start or stop the simulation (alternatively, you
  can press the Space key).

## Authors

- [Corentin](https://github.com/cocoutbm)
- [Lukman]()
- [Nicolas](https://github.com/nic0c0)
- [Tanguy](https://github.com/Eseltwift)

---

<sup>1</sup> The Hopping Sequence Number (HSN) is a parameter used in frequency hopping systems to determine the
sequence of frequencies used by the system. In this simulator, the HSN determines the seed for a pseudo-random sequence
of frequencies.