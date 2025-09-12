import React from "react";
import { Link } from "react-router-dom";

const NewsMenu = () => (
  <div className="news-menu">
    <h2>Noticias RP</h2>
    <ul>
      <li><Link to="/news">Ver noticias</Link></li>
    </ul>
  </div>
);

export default NewsMenu;
