import React from 'react';

const TOOLS = ['pointer', 'rectangle', 'pen', 'line', 'erasor', 'text'];

// NOTE:- This shows the the toolbar section(more like drawing secction). It takes all inputs from infiniteCanvas

export default function Toolbar({ activeTool, onSelectTool, onCheckMemory }) {
  return (
    <div style={{
      position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: '#2C2C2C', padding: '12px 24px', borderRadius: '12px',
      display: 'flex', gap: '16px', alignItems: 'center', zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      
      {TOOLS.map((tool) => (
        <button 
          key={tool}
          onClick={() => onSelectTool(tool)}
          style={{ 
            backgroundColor: activeTool === tool ? '#444' : 'transparent', 
            color: 'white', border: 'none', padding: '8px 16px', 
            borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize' 
          }}
        >
          {tool}
        </button>
      ))}

      <div style={{ width: '2px', height: '24px', backgroundColor: '#555' }} /> 

      <button onClick={onCheckMemory} style={{ color : 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}>
        Chk Mry
      </button>

    </div>
  );
}