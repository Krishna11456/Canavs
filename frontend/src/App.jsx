import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
// import InfiniteCanvas from "./InfiniteCanvas/ColaborativeCanvas/Camera/script"
import LandingPage from "./LandingPage/LandingPage.jsx";

import InfiniteCanvas from "./InfiniteCanvas.jsx"

// This tiny wrapper grabs the "xyz-123" from the URL and passes it to your Canvas
function CanvasRoomWrapper() {
  const { roomId } = useParams();
  return <InfiniteCanvas roomId={roomId} />;
}


function App(){

  return(
    <BrowserRouter>
      <div style={{ position: 'fixed', top: 0, left: 0, background: 'yellow', color: 'black', padding: '10px', zIndex: 99999 }}>
        React is mounting! The router sees this path: {window.location.pathname}
      </div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/board/:roomId" element={<CanvasRoomWrapper />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 
