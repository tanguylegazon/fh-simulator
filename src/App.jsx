import Toolbar from './components/Toolbar';
import Antenna from './components/Antenna';
import StatsPanel from './components/StatsPanel';
import Phone from './components/Phone';

function App() {
    const phone_number = 3;
    const phones = Array.from({length: phone_number}, (_, i) => <Phone key={i} index={phone_number - i}/>);

    return (
        <div>
            <Toolbar>
                {phones}
                <div style={{border: '3px dashed red', borderRadius: '50%', width: '44px', height: '44px'}}></div>
            </Toolbar>
            <Antenna/>
            <StatsPanel/>
        </div>
    );
}

export default App;