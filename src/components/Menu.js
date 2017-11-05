import React, { Component } from 'react';

export default (props) => {
	return (
    <nav id="menu">
      <header className="major">
        <h2>Menú</h2>
      </header>
      <ul>
        <li><a href="/">Homepage</a></li>
        <li>
          <span className="opener">Gestión de Usuarios</span>
          <ul>
            <li><a href="/businessusers">Usuarios de Negocio</a></li>
            <li><a href="/users">Usuarios de Aplicación</a></li>
          </ul>
        </li>
        <li><a href="/appservers">Application Servers</a></li>
        <li><a href="#">Reportes y Estadísticas</a></li>
        <li><a href="#">Reglas de Negocio</a></li>
      </ul>
    </nav>
	)
}