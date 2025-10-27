import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Informativa.css";
import Logo from "../img/Logo.jpg";
import Huella from "../img/Huella.png";

const Informativa: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleHuellaClick = () => {
    window.open("/huella-ambiental", "_blank");
  };

  return (
    <div className="informativa-container">
      {/* Header */}
      <header className="informativa-header">
        <h1>
          <span role="img" aria-label="vaca"></span> {t('acerca_de_nosotros')}
        </h1>
      </header>

      {/* Espacio para el logo */}
      <div className="logo-space">
        <img src={Logo} alt="Logo Ganado360" style={{height: 100}} />
      </div>

      {/* Introducción */}
      <section className="info-card">
        <h2>Introducción</h2>
        <p>
          Ganado360 es una aplicación web que permite gestionar el ganado de manera integral, 
          facilitando el control de cada animal, su historial veterinario, programación de cuidados 
          y optimización de recursos. Además, incluye un módulo de <strong>Huella Ambiental</strong>, 
          promoviendo prácticas sostenibles y responsables con el medio ambiente.
        </p>
      </section>

      {/* Funcionalidades */}
      <section className="info-card">
        <h2>Funcionalidades Principales</h2>
        <ul>
          <li><strong>Gestión del ganado:</strong> Registro, edición y consulta de cada animal con información clave (raza, edad, peso, fotos).</li>
          <li><strong>Historial veterinario:</strong> Control de vacunas, tratamientos y eventos médicos por animal.</li>
          <li><strong>Alertas y recordatorios:</strong> Notificaciones automáticas sobre vacunas, tratamientos y consumos excesivos.</li>
          <li><strong>Reportes y consultas:</strong> Filtrado por raza, edad, tratamientos pendientes o desempeño.</li>
          <li><strong>Huella Ambiental y Optimización de Recursos:</strong>
            <ul>
              <li>Cálculo de emisiones de gases según cantidad y tipo de animales.</li>
              <li>Registro de consumos de agua y alimento.</li>
              <li>Alertas de consumo excesivo y simulaciones de impacto ambiental.</li>
              <li>Recomendaciones para reducir la huella y mejorar la sostenibilidad.</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* Beneficios */}
      <section className="info-card">
        <h2>Beneficios de Ganado360</h2>
        <ul>
          <li>Organización integral de la finca y control del ganado.</li>
          <li>Mejor toma de decisiones gracias a reportes y alertas automáticas.</li>
          <li>Registro seguro y centralizado de información.</li>
          <li>Promoción de prácticas sostenibles mediante la medición de huella ambiental.</li>
        </ul>
      </section>

      {/* Alcance */}
      <section className="info-card">
        <h2>Alcance del Sistema</h2>
        <ul>
          <li>Registro y control de todos los animales.</li>
          <li>Seguimiento del historial veterinario.</li>
          <li>Alertas automáticas de cuidados y consumos.</li>
          <li>Reportes de gestión y sostenibilidad.</li>
          <li>Cálculo de huella ambiental con recomendaciones.</li>
        </ul>
      </section>

      {/* Huella Ambiental */}
      <section className="huella-section">
        <h2>Huella Ambiental</h2>
        <p>
          La huella ambiental mide el impacto de la finca sobre el medio ambiente, principalmente 
          por la emisión de gases como metano y CO₂. Ganado360 calcula estos indicadores según 
          la cantidad y tipo de animales, y el consumo de agua y alimento.
        </p>
        {/* Imagen como botón */}
        <button className="huella-img-btn" onClick={handleHuellaClick} title="Ver detalle de huella ambiental">
          <img src={Huella} alt="Huella Ambiental" style={{height: 100, borderRadius: 8, border: "2px solid #218838"}} />
        </button>
    </section>
    </div>
  );
};

export default Informativa;