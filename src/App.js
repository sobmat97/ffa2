// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage    from "./StartPage";
import FightersPage from "./FightersPage";
import AddFighter   from "./AddFighter";
import EventsPage   from "./EventsPage";
import GalasPage    from "./GalasPage";
import OrganizationsPage from "./OrganizationsPage";
import AddGala      from "./AddGala";
import EloPage          from "./EloPage";
import FightCardBuilder from "./components/FightCardBuilder";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<StartPage />} />
        <Route path="/fighters"   element={<FightersPage />} />
        <Route path="/add-fighter" element={<AddFighter onFighterAdded={() => window.location = "/fighters"} />} />
        <Route path="/add-gala" element={<AddGala onGalaAdded={()=>window.location="/galas"} />} />
        <Route path="/events"   element={<EventsPage />} />
        <Route path="/galas"    element={<GalasPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/elo" element={<EloPage/>} />
        <Route path="/build-card" element={<FightCardBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}
