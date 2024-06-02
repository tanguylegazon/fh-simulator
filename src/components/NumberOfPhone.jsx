import React, { useState } from 'react';
import Phone from './Phone';

const NumberOfPhone = () => {
    const [numberOfPhones, setNumberOfPhones] = useState(1);

    const handleChange = (event) => {
        setNumberOfPhones(Number(event.target.value));
    };

    const handleKeyDown = (event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.preventDefault();
        }
    };

    return (
        <div>
            <label htmlFor="nb-phone">Number of phones: </label>
            <input
                id="nb-phone"
                type="number"
                value={numberOfPhones}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                min="0"
                max="10"
            />
            <Phone numberOfPhones={numberOfPhones} />
        </div>
    );
};

export default NumberOfPhone;
