import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Game from "./pages/Game/Game";
import Create from "./pages/Create/Create";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="create" element={<Create />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
