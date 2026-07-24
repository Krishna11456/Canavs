import { SHAPE_CONFIGS } from '../constants'




export default function ContextAwareOverlay({ activeTool, currentStyles, onStyleChange}){

    const config = SHAPE_CONFIGS[activeTool] || {};

    // If the active tool doesn't have any configurable UI items, hide the overlay completely
    if (!config.showStroke && !config.showFill && !config.showEdges && !config.showText) {
        return null;
    }


    return (
        <div
            style={{
            position: 'fixed',    // fixed there, stiched.. this div won't move no matter what
            top: '110px', /* Sits below the main top toolbar */
            left: '16px',
            width: '220px',
            display: 'flex',
            flexDirection: 'column', // Fixed: camelCase
            gap: '16px',             // Fixed: wrapped in quotes, ends with comma
            padding: '12px',         // Fixed: wrapped in quotes, ends with comma
            backgroundColor: '#ffffff', // Fixed: camelCase and wrapped in quotes
            border: '1px solid #e0e0e0', // Fixed: wrapped in quotes
            borderRadius: '8px',     // Fixed: camelCase and wrapped in quotes
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            zIndex: 999,
            
            /* Smooth enter/exit transition */
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            opacity: 1, // Changed to 1 so you can see it while testing! Switch to state variable later.
            transform: 'translateX(0px)', // Changed to 0px so it's fully visible on screen
            pointerEvents: 'auto', // Fixed: camelCase, wrapped in quotes, changed to auto for interaction
            }}
        >
            
            {/* 1. Dynamic Stroke Section */}
            {config.showStroke && (
                <div style={sectionStyle}>
                    <span style={labelStyle}>STROKE COLOR</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center'}}>
                        
                        {/* The Standard Core Quick Colors Palette */}
                        {availableColors.map((color) => (
                            <div
                                key={color}
                                onPointerDown={(e) => {
                                    e.preventDefault();   // Stop native focus stealing
                                    e.stopPropagation();  // Stop event from hitting the canvas kill-switch
                                }}
                                onClick={() => onStyleChange('stroke', color)}
                                style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '4px',
                                    backgroundColor: color,
                                    cursor: 'pointer',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    outline: currentStyles?.stroke === color ? '2px solid #6965db' : 'none',
                                    outlineOffset: '2px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        ))}

                        <div style={{ width: '2px', height: '22px', backgroundColor: '#555' }} />

                        {/* The Rightmost Custom Color Picker Grid Slot */}
                        <div
                            style={{
                                position: 'relative',
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                                border: '1px solid rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#495057',

                                // If current custom style color is not one of the core colors, paint this custom box
                                                   // if [].colors have don't have current style
                                                   // '?.' -> optional chaining operator....(safeguard from undefined etc..)
                                backgroundColor: !availableColors.includes(currentStyles?.stroke) ? currentStyles?.stroke : '#f1f3f5',
                                outline: !availableColors.includes(currentStyles?.stroke) ? '2px solid #6965db' : 'none',
                                outlineOffset: '2px',
                            }}
                        >
                            {/* Visual Anchor Indicator symbol (+) when no custom color is actively active */}
                            {availableColors.includes(currentStyles?.stroke) ? '+' : ''}

                            {/* Invisible native color input panel overlaying the button wrapper box */}
                            <input
                                type="color"
                                value={currentStyles?.stroke || '#1e1e1e'}
                                onPointerDown={(e) => {
                                    e.preventDefault();   // Stop native focus stealing
                                    e.stopPropagation();  // Stop event from hitting the canvas kill-switch
                                }}
                                onChange={(e) => onStyleChange('stroke', e.target.value)}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0, // Keeps native input hidden while letting click pass through
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                    </div>
                </div>
            )}

             {/* 2. BACKGROUND COLOR SECTION */}
            {config.showFill && (
                <div style={sectionStyle}>
                    <span style={labelStyle}>BACKGROUND COLOR</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {availableFills.map((color) => (
                            <div
                                key={color}
                                onClick={() => onStyleChange('fill', color)}
                                style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '4px',
                                    backgroundColor: color,
                                    cursor: 'pointer',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    outline: currentStyles?.fill === color ? '2px solid #6965db' : 'none',
                                    outlineOffset: '2px',
                                    boxSizing: 'border-box',

                                    background: color === 'transparent' 
                                        ? 'linear-gradient(to top left, #ffffff calc(50% - 1.5px), #ff4d4f calc(50% - 1.5px), #ff4d4f calc(50% + 1.5px), #ffffff calc(50% + 1.5px))' 
                                        : color
                                }}
                            />
                        ))}


                        <div style={{ width: '2px', height: '22px', backgroundColor: '#555' }} />

                        {/* Custom Fill Color Picker input */}
                        <div
                            style={{
                                position: 'relative',
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: '1px solid rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                color: '#495057',
                                backgroundColor: !availableFills.includes(currentStyles?.fill) ? currentStyles?.fill : '#f1f3f5',
                                outline: !availableFills.includes(currentStyles?.fill) ? '2px solid #6965db' : 'none',
                                outlineOffset: '2px',
                                boxSizing: 'border-box'
                            }}
                        >

                        
                            {availableFills.includes(currentStyles?.fillColor) ? '+' : ''}
                            <input
                                type="color"
                                value={currentStyles?.fill === 'transparent' ? '#ffffff' : (currentStyles?.fill || '#ffffff')}
                                onChange={(e) => onStyleChange('fill', e.target.value)}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. DYNAMIC STROKE WIDTH SECTION */}
            {config.showStroke && 
             config.strokeWidth && (
                <div style={sectionStyle}>
                    <span style={labelStyle}>STROKE WIDTH</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[
                            { key: 'thin', label: 'Thin', height: '2px' },
                            { key: 'bold', label: 'Bold', height: '4px' },
                            { key: 'extraBold', label: 'Extra', height: '7px' }
                        ].map((option) => {
                            // Check if this specific thickness button is currently active
                            const isActive = currentStyles?.strokeWidth === option.key;

                            return (
                                <div
                                    key={option.key}
                                    onMouseDown={() => {console.log('mousedown fired')}}
                                    onClick={() => {onStyleChange('strokeWidth', option.key)}}
                                    style={{
                                        ...buttonStyle,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        padding: '4px 0',
                                        height: '34px', // Slightly taller to fit the preview line comfortably
                                        backgroundColor: isActive ? '#e0e0ff' : '#f1f3f5',
                                        color: isActive ? '#6965db' : '#495057',
                                        border: isActive ? '1px solid #6965db' : '1px solid #dee2e6',
                                    }}
                                    title={`${option.label} Stroke`}
                                >
                                    {/* Visual indicator line showing thickness */}
                                    <div style={{ 
                                        height: option.height, 
                                        backgroundColor: isActive ? '#6965db' : '#495057',
                                        width: '24px',
                                        borderRadius: '1px'
                                    }} />
                                    
                                    <span style={{ fontSize: '9px', fontWeight: 'bold' }}>
                                        {option.label.toUpperCase()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


           {/* 4. DYNAMIC TEXT-ALIGN CHANGER */}
            {config.showTextAlign && (
                <div style={sectionStyle} >
                    <span style={labelStyle}>TEXT ALIGN</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[
                            { key: 'left', label: 'Left', alignItems: 'flex-start' },
                            { key: 'center', label: 'Center', alignItems: 'center' },
                            { key: 'right', label: 'Right', alignItems: 'flex-end' }
                        ].map((option) => {
                            // Check if this alignment is currently active
                            const isActive = currentStyles?.textAlign === option.key;
                            // currentStyles?.fill === color

                            return (
                                <div
                                    key={option.key}
                                    // 👇 PROTECT YOUR TEXTAREA FOCUS HERE 👇
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => {onStyleChange('textAlign', option.key)}}
                                    style={{
                                        ...buttonStyle,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        padding: '4px 0',
                                        height: '34px',
                                        backgroundColor: isActive ? '#e0e0ff' : '#f1f3f5',
                                        color: isActive ? '#6965db' : '#495057',
                                        border: isActive ? '1px solid #6965db' : '1px solid #dee2e6',
                                        cursor: 'pointer'
                                    }}
                                    title={`${option.label} Align`}
                                >
                                    {/* Mini CSS icon representing left/center/right text */}
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: option.alignItems, 
                                        gap: '2px',
                                        width: '16px' 
                                    }}>
                                        <div style={{ height: '2px', width: '100%', backgroundColor: isActive ? '#6965db' : '#495057' }} />
                                        <div style={{ height: '2px', width: '60%', backgroundColor: isActive ? '#6965db' : '#495057' }} />
                                        <div style={{ height: '2px', width: '80%', backgroundColor: isActive ? '#6965db' : '#495057' }} />
                                    </div>
                                    
                                    <span style={{ fontSize: '9px', fontWeight: 'bold' }}>
                                        {option.label.toUpperCase()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 4. DYNAMIC EDGES CORNER STYLE CHANGER */}
            {config.showEdges && (
                <div style={sectionStyle}>
                    <span style={labelStyle}>EDGES</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[
                            { key: 'sharp', text: '⌜ Sharp' },
                            { key: 'round', text: '⊂ Round' }
                        ].map((option) => {
                            const isActive = currentStyles?.edges === option.key;

                            return (
                                <div
                                    key={option.key}
                                    onClick={() => onStyleChange('edges', option.key)}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: isActive ? '#e0e0ff' : '#f1f3f5',
                                        color: isActive ? '#6965db' : '#495057',
                                        border: isActive ? '1px solid #6965db' : '1px solid #dee2e6',
                                        // Match the button corner shapes visually to what they represent!
                                        borderRadius: option.key === 'round' ? '8px' : '2px',
                                    }}
                                >
                                    {option.text}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );

}



// Standard static arrays since your config file only holds true/false flags
const availableColors = ["#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00"];
const availableFills = ["transparent", "#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00"];


const sectionStyle = { display: 'flex', flexDirection: 'column', gap: '6px'};
const labelStyle = { fontSize: '10px', color: '#868e96', fontWeight: '600', letterSpacing: '0.3px' };
const buttonStyle = { flex: 1, height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500', borderRadius: '4px', cursor: 'pointer', userSelect: 'none', boxSizing: 'border-box' };



// note:-

/* Why onPointerDown instead of onMouseDown?
Your canvas is listening for onPointerDown.

Browsers fire events in a specific order: pointerdown -> mousedown -> click.

If you only block mousedown on the button, the pointerdown event already fired milliseconds earlier and escaped 
up to the canvas. By blocking onPointerDown, you catch the event at the very beginning of the cycle, stopping both
the focus shift (preventDefault) and the bubble to the canvas (stopPropagation) at the exact same time. */