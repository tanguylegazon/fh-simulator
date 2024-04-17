import Toolbar from './components/Toolbar';
import Antenna from './components/Antenna';
import StatsPanel from './components/StatsPanel';
import Phone from './components/Phone';

function App() {
    return (
        <div>
            <Toolbar>
                <Phone/>
            </Toolbar>
            <Antenna/>
            <StatsPanel/>
        </div>
    );
}

export default App;