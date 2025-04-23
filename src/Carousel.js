import React, { useRef } from "react";
import "./Carousel.css";

export default function Carousel({ items }) {
  const ref = useRef();

  const scroll = dir => {
    if (!ref.current) return;
    const w = ref.current.clientWidth;
    ref.current.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <div className="carousel-container">
      <button className="nav prev" onClick={() => scroll(-1)}>&lt;</button>
      <div className="carousel" ref={ref}>
        {items.map((it, i) => (
          <div key={i} className="carousel-item">
            <img src={it.logo} alt={it.name} />
            <div className="label">{it.name}</div>
          </div>
        ))}
      </div>
      <button className="nav next" onClick={() => scroll(1)}>&gt;</button>
    </div>
  );
}
