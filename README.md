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

## Project files

- `index.html`: The main project page.
- `style.css`: CSS styles for layout and visual elements.
- `script.js`: JavaScript script for application logic.
- `img/`: Directory containing images used in the project.

## Usage

### Setup

To use this simulator, you can either:

1. Access the live version at [tanguy-portfolio.com/simulator](https://tanguy-portfolio.com/simulator).
2. Clone this repository and open `index.html` in your web browser.

> **Note:** This project is not optimized for small screens (less than 1100px wide). Please use a desktop browser for
> the best experience.

### Functionality

- Use the + and - buttons to adjust the number of phones, frequency bands, and HSN value.
- Use the slider to adjust the frequency hopping speed.
- Click the Play/Pause button to start or stop the simulation (alternatively, you can press the Space key).

## License and third-party licenses

This project is licensed under the terms of the MIT License. See the [LICENSE](LICENSE) file for details.

This project includes third-party components distributed under their own respective licenses. See the 
[THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md) file for details.

---

<sup>1</sup> The Hopping Sequence Number (HSN) is a parameter used in frequency hopping systems to determine the
sequence of frequency bands used by the system. In this simulator, the HSN determines the seed for a pseudo-random
sequence of frequency bands.
