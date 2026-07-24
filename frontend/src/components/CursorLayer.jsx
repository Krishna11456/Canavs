import { worldToScreen } from '../utils/coordinates';

export default function CursorLayer({ cursors, camera }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
      {Object.entries(cursors).map(([userId, pos]) => {
        const screenPos = worldToScreen(pos.x, pos.y, camera);
        return (
          <div key={userId} style={{
            position: 'absolute', left: screenPos.x, top: screenPos.y,
            transition: 'left 0.1s linear, top 0.1s linear', display: 'flex', flexDirection: 'column'
          }}>
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="white" strokeWidth="2">
                <path d="M5.65376 21.1497L2.45483 3.65582C2.10657 1.75168 4.22558 0.320499 5.86429 1.35336L21.4394 11.1687C23.0118 12.16 22.8427 14.5422 21.1448 15.3134L14.7792 18.2045L11.3999 26.5491C10.7303 28.2023 8.35824 28.2913 7.5583 26.691L5.65376 21.1497Z" fill="#FF5C00"/>
            </svg>
            <div style={{ backgroundColor: '#FF5C00', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', marginLeft: '12px', width: 'max-content' }}>
              User {userId}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// NOte:- this component shoes users cursor on screen.It takes data from InfiniteCanavs and useRoom hook(for cursors)