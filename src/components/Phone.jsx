import Draggable from 'react-draggable';
import './Phone.css';

function Phone() {
    return (
        <Draggable bounds="html">
            <div className="phone">
                Phone
            </div>
        </Draggable>
    );
}

export default Phone;