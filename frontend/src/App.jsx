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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/board/:roomId" element={<CanvasRoomWrapper />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 
