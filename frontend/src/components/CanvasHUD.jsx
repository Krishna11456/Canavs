export default function CanvasHUD({ zoomDisplay }) {
  return (
    <div className="ui-overlay">
      <div className="zoom-badge">
        Zoom: {zoomDisplay}%
      </div>
      <div className="hint-box">
        💡 Hold <kbd className="kbd-key">Shift</kbd> + Drag or use <kbd className="kbd-key">Middle Click</kbd> to Pan
      </div>
    </div>
  );
}



// Note:- this component is just heads-up-display(like info painted on game, shoes zoom level...)