// src/StartPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./StartPage.css";

export default function StartPage() {
  return (
    <div className="start-page">
      {/* NOWY wrapper z ramką */}
      <div className="start-page__container">
        <header className="start-page__header">
          <h1>FAMEOLOGY</h1>
          <p className="version">v. 0.0.1</p>
          <p className="shoutout">Pozdrawiam wszystkich chłopaków z Q22</p>
        </header>

        <div className="start-page__buttons">
          <Link to="/fighters"     className="btn">Lista zawodników</Link>
          <Link to="/add-fighter"  className="btn">Dodaj zawodnika</Link>
          <Link to="/events"       className="btn">Walki</Link>
          <Link to="/galas"       className="btn">Lista gal</Link>
        </div>
      </div>
    </div>
  );
}
