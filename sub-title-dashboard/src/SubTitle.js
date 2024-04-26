import React from 'react';
import './App.css';

const SubtitleComponent = ({ subtitle_1, subtitle_2, nextStep, prevStep }) => {

    return (
        <div style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div className="backgroundDiv" style={{ margin: '0 10px' }}>
                <h2 className='displayed-text'>{subtitle_1}</h2>
            </div>
            <div style={{ margin: '0 10px', width: '600px', minHeight: '50px' }}>
            </div>
            <div className="backgroundDiv" style={{ margin: '0 10px' }}>
                <h2 className='displayed-text'>{subtitle_2}</h2>
            </div>
            <button className='prev-btn' onClick={prevStep}>Previous</button>
            <button className="next-btn" onClick={nextStep}>Next</button>
        </div>
    );
};

export default SubtitleComponent;
