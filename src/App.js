import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./chat";
import Login from "./login";
import Signup from "./signup";

function App() {
  const [username, setUsername] = useState("");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUsername={setUsername} />} />
        <Route path="/signup" element={<Signup />} /> {/* new signup route */}
        <Route path="/chat" element={<Chat username={username} />} />
      </Routes>
    </Router>
  );
}

export default App;