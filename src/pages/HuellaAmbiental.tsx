import React, { useState } from "react";
import "./Informativa.css";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const FACTORES = {
  vaca: 120,
  toro: 150,
  ternero: 60
};

const coloresAnimales = {
  vaca: "#0074D9",
  toro: "#FF4136",
  ternero: "#2ECC40",
  fertilizante: "#FFDC00"
};

const sugerenciasPorNivel = {
  bajo: "¡Excelente! Mantén tus prácticas actuales para conservar este nivel.",
  moderado: "Revisa el consumo de agua y alimento. Considera mejorar la alimentación, manejo del estiércol y rotación de potreros.",
  alto: "Reduce el número de animales por hectárea, mejora la dieta, usa biodigestores y aumenta la cobertura vegetal."
};

const colores = {
  bajo: "#218838",
  moderado: "#b8860b",
  alto: "#c82333"
};

const calcularNivel = (emisiones: number) => {
  if (emisiones < 100) return "bajo";
  if (emisiones < 200) return "moderado";
  return "alto";
};

const HuellaAmbiental: React.FC = () => {
  const [cantidades, setCantidades] = useState({ vaca: 0, toro: 0, ternero: 0 });
  const [fertilizante, setFertilizante] = useState(0);

  const emisionesPorTipo = Object.entries(cantidades).map(([tipo, cantidad]) => ({
    tipo,
    cantidad,
    emisiones: cantidad * (FACTORES as any)[tipo]
  }));

  const emisionesTotalesAnimales = emisionesPorTipo.reduce((acc, curr) => acc + curr.emisiones, 0);
  const emisionesTotales = emisionesTotalesAnimales + fertilizante;
  const nivel = calcularNivel(emisionesTotales);

  const handleChange = (tipo: string, valor: string) => {
    setCantidades({
      ...cantidades,
      [tipo]: Math.max(0, parseInt(valor) || 0)
    });
  };

  // Datos para el gráfico de pastel (animales + fertilizante)
  const pieData = [
    ...emisionesPorTipo
      .filter(e => e.cantidad > 0)
      .map(e => ({
        name: `${e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1)} (${e.cantidad})`,
        value: e.emisiones,
        tipo: e.tipo
      })),
    ...(fertilizante > 0
      ? [{
          name: `Fertilizante (${fertilizante} kg)`,
          value: fertilizante,
          tipo: "fertilizante"
        }]
      : [])
  ];

  const pieColors = pieData.map(e => coloresAnimales[e.tipo as keyof typeof coloresAnimales] || "#888");

  // Etiqueta personalizada para mostrar el valor y nombre dentro de la porción
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        stroke="#222"
        strokeWidth={0.5}
      >
        {value}kg
      </text>
    );
  };

  return (
    <div className="informativa-container">
      <h2>Detalle de Huella Ambiental</h2>
      <div className="huella-indicadores" style={{ margin: "1.5rem 0 2rem 0" }}>
        <div className="huella-nivel huella-bajo">
          <strong>🟢 Nivel Bajo:</strong> Huella aceptable
        </div>
        <div className="huella-nivel huella-medio">
          <strong>🟡 Nivel Moderado:</strong> Requiere atención
        </div>
        <div className="huella-nivel huella-alto">
          <strong>🔴 Nivel Alto:</strong> Impacto elevado, se recomienda acción
        </div>
      </div>

      <div className="info-card" style={{ marginBottom: "2rem" }}>
        <h3>Ingresar datos para el cálculo</h3>
        <form style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label htmlFor="vaca" style={{ minWidth: 80 }}>Vacas</label>
            <input
              id="vaca"
              type="number"
              min={0}
              value={cantidades.vaca}
              onChange={e => handleChange("vaca", e.target.value)}
              style={{ width: 60, textAlign: "center" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label htmlFor="toro" style={{ minWidth: 80 }}>Toros</label>
            <input
              id="toro"
              type="number"
              min={0}
              value={cantidades.toro}
              onChange={e => handleChange("toro", e.target.value)}
              style={{ width: 60, textAlign: "center" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label htmlFor="ternero" style={{ minWidth: 80 }}>Terneros</label>
            <input
              id="ternero"
              type="number"
              min={0}
              value={cantidades.ternero}
              onChange={e => handleChange("ternero", e.target.value)}
              style={{ width: 60, textAlign: "center" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label htmlFor="fertilizante" style={{ minWidth: 80 }}>Fertilizante (kg)</label>
            <input
              id="fertilizante"
              type="number"
              min={0}
              value={fertilizante}
              onChange={e => setFertilizante(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ width: 60, textAlign: "center" }}
            />
          </div>
        </form>
      </div>

      <div className="info-card" style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h3>Emisiones por tipo de animal y fertilizante</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                label={renderCustomizedLabel}
                labelLine={false}
                stroke="#fff"
                strokeWidth={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: "#888" }}>No hay datos para mostrar el gráfico.</p>
        )}
        <div style={{ marginTop: "1rem" }}>
          <strong>Emisiones totales:</strong> {emisionesTotales} kg CO₂e/mes
        </div>
      </div>

      <div className="info-card" style={{ marginBottom: "2rem" }}>
        <h3>Nivel de emisiones y sugerencia</h3>
        <p>
          <strong>Nivel:</strong>{" "}
          <span style={{ color: colores[nivel as keyof typeof colores], fontWeight: "bold", textTransform: "capitalize" }}>
            {nivel}
          </span>
        </p>
        <p><strong>Sugerencia para tu nivel:</strong> {sugerenciasPorNivel[nivel as keyof typeof sugerenciasPorNivel]}</p>
      </div>
    </div>
  );
};

export default HuellaAmbiental;
