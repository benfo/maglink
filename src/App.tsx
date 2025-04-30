import { Route, Routes, useNavigate } from "react-router";
import Home from "./routes/home";
import { useState } from "react";
import IncomingShare from "./routes/incoming-share";

function App() {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleIncomingShare = (data: { text?: string }) => {
    if (data.text) {
      setText(data.text);
    }
    navigate("/", { replace: true });
  };

  return (
    <Routes>
      <Route index element={<Home initialHash={text} />} />
      <Route
        path="/incoming-share"
        element={<IncomingShare onPopulate={handleIncomingShare} />}
      />
    </Routes>
  );
}

export default App;
