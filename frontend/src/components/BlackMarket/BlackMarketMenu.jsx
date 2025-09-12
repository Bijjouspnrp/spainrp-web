import React from "react";
import { Link } from "react-router-dom";

const BlackMarketMenu = () => (
  <div className="blackmarket-menu">
    <h2>Marketplace Negro</h2>
    <ul>
      <li><Link to="/blackmarket">Ver productos</Link></li>
    </ul>
  </div>
);

export default BlackMarketMenu;
