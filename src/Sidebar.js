import React from "react";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Freak Fight Manager</h2>
      <ul>
        <li>Panel główny</li>
        <li>Dodaj zawodnika</li>
        <li>Lista</li>
        <li>Statystyki (wkrótce)</li>
      </ul>
    </div>
  );
}

export default Sidebar;
