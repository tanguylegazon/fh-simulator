import * as React from 'react';
import Toolbar from './components/Toolbar';
import Phone from './components/Phone';
import Antenna from './components/Antenna';
import StatsPanel from './components/StatsPanel';

function App() {
    return (
        <div>
            <Toolbar />
            <Phone />
            <Antenna />
            <StatsPanel />
        </div>
    );
}

export default App;