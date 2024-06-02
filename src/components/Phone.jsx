import React from 'react';
import './Phone.css';

const Phone = ({numberOfPhones}) => {
    const phones = Array.from({length: numberOfPhones}, (_, index) => index + 1);
    const radius = 222;
    const angleStep = (2 * Math.PI) / numberOfPhones;

    return (
        <div className="phone-container">
            {phones.map((phone, index) => {
                const angle = index * angleStep;
                const x = radius * Math.cos(angle) + radius; // Adjust for center offset
                const y = radius * Math.sin(angle) + radius; // Adjust for center offset

                return (
                    <div
                        key={phone}
                        className="phone"
                        style={{
                            left: `${x}px`,
                            top: `${y}px`,
                        }}
                    >
                        {phone}
                    </div>
                );
            })}
        </div>
    );
};

export default Phone;
