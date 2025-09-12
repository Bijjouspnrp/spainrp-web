import React from "react";
import { Link } from "react-router-dom";

const StockMarketMenu = () => (
  <div className="stockmarket-menu">
    <h2>Bolsa SpainRP</h2>
    <ul>
      <li><Link to="/stockmarket">Ver bolsa</Link></li>
    </ul>
  </div>
);

export default StockMarketMenu;
