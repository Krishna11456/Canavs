export default function SyncOverlay() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#1e1e1e', color: 'white', zIndex: 9999,  
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h2>Connecting to Canvas...</h2>
      <p>Downloading master photograph from server</p>
    </div>
  );
}



// Note:- the overlay to show untill syncing is completed(with ws so updated shape shows)