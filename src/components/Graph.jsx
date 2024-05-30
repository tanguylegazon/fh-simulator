import React, { useState, useEffect } from 'react';
import './Graph.css';
import Phone from './Phone';

function Graph() {
    // Number of phones to display
    const phone_number = 4;
    // Create an array of Phone components
    const phones = Array.from({ length: phone_number }, (_, i) => <Phone key={i} index={i + 1} />);
    // List of frequency lists for each phone
    const frequencyLists = [
        ['F1', 'F2', 'F3'],
        ['F1', 'F4', 'F5'],
        ['F4', 'F6', 'F7'],
        ['F2', 'F5', 'F8']
    ];
    // State to keep track of time slots
    const [timeSlots, setTimeSlots] = useState(['TS1']);
    // State to keep track of HSN values, initialized to empty strings
    const [hsnValues, setHsnValues] = useState(['', '', '', '']);
    // State to keep track of frequencies used in each time slot for each phone, initialized to 'X'
    const [slotFrequencies, setSlotFrequencies] = useState([
        ['X'],
        ['X'],
        ['X'],
        ['X']
    ]);

    // Effect that runs every 5 seconds to update time slots and frequencies
    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeSlot = `TS${timeSlots.length + 1}`;

            // Determine new frequencies based on HSN values
            let newFrequencies = frequencyLists.map((frequencies, index) => {
                const hsnValue = parseInt(hsnValues[index % hsnValues.length], 10); // Parse HSN value as integer
                if (hsnValue === 0) {
                    // If HSN value is 0, use the frequency based on the current time slot index
                    return frequencies[timeSlots.length % frequencies.length];
                } else if (hsnValue >= 1 && hsnValue <= 63) {
                    // If HSN value is between 1 and 63, select a random frequency from the list
                    const randomIndex = Math.floor(Math.random() * frequencies.length);
                    return frequencies[randomIndex];
                } else {
                    // If HSN value is invalid, use 'X'
                    return 'X';
                }
            });

            // Update time slots by adding the new time slot
            setTimeSlots((prevTimeSlots) => [...prevTimeSlots, newTimeSlot]);

            // Update slot frequencies by adding the new frequencies for each phone
            setSlotFrequencies((prevFrequencies) =>
                prevFrequencies.map((frequencies, index) => [...frequencies, newFrequencies[index]])
            );
        }, 5000); // 5000 milliseconds = 5 seconds

        // Clean up the interval when the component is unmounted
        return () => clearInterval(interval);
    }, [timeSlots, frequencyLists, hsnValues]);

    // Handle changes to HSN input fields
    const handleInputChange = (event, index) => {
        const newHsnValues = [...hsnValues];
        newHsnValues[index] = event.target.value;
        setHsnValues(newHsnValues);
    };

    // Handle button click to validate HSN values
    const handleButtonClick = (index) => {
        alert(`HSN ${index + 1} is equal to ${hsnValues[index]}`);
    };

    return (
        <div className='div_graph'>
            <p className='graph_title'>Frequency Hopping</p>
            <div className='div_table'>
                <table className='table_graph'>
                    <thead>
                        <tr>
                            <th className='th_graph'></th>
                            {timeSlots.map((ts, index) => (
                                <th key={index} className='th_graph'>
                                    {ts}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {phones.map((phone, rowIndex) => (
                            <tr key={rowIndex}>
                                <td className='td_graph'>
                                    <div className='div_phone'>
                                        {phone}
                                    </div>
                                </td>
                                {slotFrequencies[rowIndex].map((frequency, colIndex) => (
                                    <td key={colIndex} className='td_graph'>
                                        {frequency}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {hsnValues.map((value, index) => (
                <div className='HSN_value' key={index}>
                    <p>HSN {index + 1}:</p>
                    <input type="text" value={value} onChange={(e) => handleInputChange(e, index)} />
                    <button onClick={() => handleButtonClick(index)}>Validate</button>
                </div>
            ))}
        </div>
    );
}

export default Graph;
