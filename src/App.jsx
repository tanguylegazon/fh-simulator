import React from 'react';
import NumberOfPhone from './components/NumberOfPhone';
import Toolbar from './components/Toolbar';
import Antenna from './components/Antenna';
import StatsPanel from './components/StatsPanel';
import Phone from './components/Phone';
import Graph from './components/Graph';

const App = () => {
    return (
        <div>
            <NumberOfPhone/>
            <Antenna/>
            <StatsPanel/>
            <Graph/>
        </div>
    );
};

export default App;