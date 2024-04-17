import Draggable from 'react-draggable';
import './Phone.css';

function Phone({ index }) {
    return (
        <Draggable bounds="html">
            <div className="phone">
                {`Phone ${index}`}
            </div>
        </Draggable>
    );
}

export default Phone;