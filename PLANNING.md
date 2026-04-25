# PLANNING.md

## Proyecto: Simulador 3D del Problema de los Tres Cuerpos y Puntos de Lagrange

### Visión General
Simulador web interactivo que visualiza el Problema Restringido Circular de los Tres Cuerpos (CR3BP), enfocado en los Puntos de Lagrange y órbitas especiales como la del JWST en L2. Estilo visual basado en https://www.kavang.com/atom, manteniendo la estética de tu OAC 3D.

---

## Stack Técnico

### Core
- **Framework:** Vite + React 18
- **3D:** Three.js (r160+)
- **Controles 3D:** OrbitControls de three/examples
- **Estilos:** Tailwind CSS
- **Deploy:** GitHub Pages

### Librerías adicionales
- **lucide-react:** Iconos UI
- **Ninguna librería de física** — RK4 implementado en JS puro para máximo control

---

## Arquitectura del Proyecto

```
tres-cuerpos/
├── src/
│   ├── components/
│   │   ├── Scene3D.jsx          # Canvas Three.js + setup
│   │   ├── ControlPanel.jsx     # Sliders y botones
│   │   ├── InfoPanel.jsx        # Explicación física
│   │   └── PresetSelector.jsx   # Casos predefinidos (JWST, troyanos...)
│   ├── physics/
│   │   ├── rk4.js               # Integrador Runge-Kutta 4
│   │   ├── cr3bp.js             # Ecuaciones del CR3BP
│   │   └── lagrangePoints.js    # Cálculo analítico L1-L5
│   ├── utils/
│   │   ├── constants.js         # G, masas, distancias
│   │   └── coordinateTransform.js # Inercial ↔ Rotante
│   ├── App.jsx
│   └── main.jsx
├── public/
└── package.json
```

---

## Física del Problema

### Sistema de Referencia
**Marco rotante síncrono** donde los dos cuerpos principales (masas M₁ y M₂) están fijos en el eje X:
- M₁ (masa mayor, ej. Sol) en `(-μ, 0, 0)`
- M₂ (masa menor, ej. Tierra) en `(1-μ, 0, 0)`
- μ = M₂/(M₁+M₂) (parámetro de masa reducida)

### Ecuaciones de Movimiento (CR3BP)
En coordenadas rotantes (x, y, z, vx, vy, vz):

```
ẍ - 2ωẏ = ∂U/∂x
ÿ + 2ωẋ = ∂U/∂y
z̈ = ∂U/∂z
```

Donde:
- ω = 1 (velocidad angular normalizada)
- U(x,y,z) = -[(1-μ)/r₁ + μ/r₂ + ½(x² + y²)] (potencial efectivo)
- r₁ = distancia a M₁
- r₂ = distancia a M₂

### Puntos de Lagrange (colineales)
L1, L2, L3 están en el eje X. Se calculan resolviendo:
```
∂U/∂x = 0  con  y = z = 0
```
(ecuación de quinto grado → resolver numéricamente con Newton-Raphson)

L4 y L5 forman triángulos equiláteros:
```
L4: (1/2 - μ, √3/2, 0)
L5: (1/2 - μ, -√3/2, 0)
```

### Constante de Jacobi
Integral de movimiento en el sistema rotante:
```
C = -2U - (vx² + vy² + vz²)
```
Define las superficies de velocidad cero (curvas de Hill).

---

## Implementación del Integrador

### Runge-Kutta 4 (RK4)
Para un sistema dy/dt = f(t, y):

```javascript
function rk4Step(f, t, y, dt) {
  const k1 = f(t, y);
  const k2 = f(t + dt/2, add(y, scale(k1, dt/2)));
  const k3 = f(t + dt/2, add(y, scale(k2, dt/2)));
  const k4 = f(t + dt, add(y, scale(k3, dt)));
  
  return add(y, scale(add(k1, scale(add(k2, k3), 2), k4), dt/6));
}
```

### Vector de Estado
```javascript
state = {
  x, y, z,     // posición
  vx, vy, vz   // velocidad
}
```

### Función de Derivadas
```javascript
function cr3bpDerivatives(t, state, mu) {
  const {x, y, z, vx, vy, vz} = state;
  
  const r1 = sqrt((x + mu)^2 + y^2 + z^2);
  const r2 = sqrt((x - 1 + mu)^2 + y^2 + z^2);
  
  const ax = 2*vy + x - (1-mu)*(x+mu)/r1^3 - mu*(x-1+mu)/r2^3;
  const ay = -2*vx + y - (1-mu)*y/r1^3 - mu*y/r2^3;
  const az = -(1-mu)*z/r1^3 - mu*z/r2^3;
  
  return {x: vx, y: vy, z: vz, vx: ax, vy: ay, vz: az};
}
```

---

## Visualización 3D

### Escena Base
```javascript
// Fondo negro tipo Kavang
scene.background = new THREE.Color(0x000000);

// Cámara inicial
camera.position.set(2, 1.5, 2);
camera.lookAt(0, 0, 0);

// Iluminación
ambientLight (intensidad 0.4)
pointLight en posición de M1 (intensidad 0.8)
```

### Objetos 3D

#### Cuerpos Principales
```javascript
// M1 (amarillo dorado, radio 0.1)
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffd700,
    emissiveIntensity: 0.5
  })
);

// M2 (azul, radio 0.03)
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(0.03, 32, 32),
  new THREE.MeshStandardMaterial({color: 0x4a90e2})
);
```

#### Partícula Satélite
```javascript
// Esfera pequeña blanca (radio 0.01)
const satellite = new THREE.Mesh(
  new THREE.SphereGeometry(0.01, 16, 16),
  new THREE.MeshBasicMaterial({color: 0xffffff})
);
```

#### Puntos de Lagrange
```javascript
// L1, L2, L3: rojos semitransparentes
// L4, L5: verdes semitransparentes
// Radio 0.02, wireframe opcional
```

#### Trayectoria
```javascript
// THREE.Line con BufferGeometry
// Color: gradiente de blanco → cyan según antigüedad
// Máximo 5000 puntos, FIFO circular buffer
```

### Coordenadas Normalizadas
- Distancia M₁-M₂ = 1 unidad
- Centro de masas en el origen del sistema inercial
- Conversión a coordenadas rotantes para la visualización

---

## Panel de Controles

### Parámetros Ajustables
1. **Sistema binario** (presets):
   - Sol-Tierra (μ = 3.04e-6)
   - Tierra-Luna (μ = 0.0121)
   - Plutón-Caronte (μ = 0.1089)

2. **Condiciones iniciales**:
   - Posición X, Y, Z (sliders -2 a 2)
   - Velocidad VX, VY, VZ (sliders -2 a 2)

3. **Simulación**:
   - Timestep (0.001 - 0.1)
   - Velocidad de animación (1x - 100x)
   - Mostrar/ocultar puntos de Lagrange
   - Mostrar/ocultar curvas de Hill

4. **Presets de órbitas**:
   - Órbita de Halo en L2 (JWST)
   - Órbita de Lissajous en L1
   - Asteroide Troyano en L4
   - Órbita inestable cerca de L3

### Display de Información
- Constante de Jacobi (tiempo real)
- Energía total
- Distancias r₁, r₂
- Tiempo transcurrido (unidades normalizadas)

---

## Casos de Uso Pedagógicos

### 1. Órbita de Halo (JWST en L2)
**Condiciones iniciales aproximadas** (sistema Sol-Tierra rotante):
```
x = 1.01  (ligeramente más allá de L2)
y = 0
z = 0.01
vx = 0
vy = ±0.1
vz = 0
```

**Qué se ve:**
- Órbita periódica casi circular perpendicular al plano orbital
- El satélite nunca entra en la sombra de la Tierra

### 2. Asteroides Troyanos (L4/L5)
**Condiciones iniciales:**
```
x = 0.5 - μ
y = ±√3/2
z = 0
vx ≈ -y  (velocidad circular)
vy ≈ x
vz = 0
```

**Qué se ve:**
- Órbita estable tipo renacuajo alrededor de L4 o L5
- Pequeñas perturbaciones → libración, no escape

### 3. Región de Inestabilidad (L1)
**Condiciones iniciales:**
```
x = xL1 + 0.001  (pequeña perturbación)
y = 0
z = 0
vx = 0
vy = 0
vz = 0
```

**Qué se ve:**
- Escape exponencial hacia M₁ o M₂
- Demuestra que L1, L2, L3 son puntos de silla

---

## Diseño Visual (siguiendo Kavang)

### Paleta de Colores
```css
--bg: #000000
--primary: #ffffff
--accent: #4a90e2 (azul ciencia)
--highlight: #ffd700 (dorado)
--danger: #ff4444 (rojo órbitas inestables)
--success: #00ff88 (verde L4/L5)
```

### Tipografía
- **Títulos:** Inter/Roboto, weight 600
- **Cuerpo:** Inter/Roboto, weight 400
- **Monospace:** JetBrains Mono (para valores numéricos)

### Layout
```
┌─────────────────────────────────────┐
│  Header: "Problema de los Tres      │
│           Cuerpos y Puntos L"       │
├──────────────┬──────────────────────┤
│              │                      │
│   Controles  │   Canvas 3D          │
│   (sidebar)  │   (Three.js)         │
│              │                      │
│   [Sliders]  │                      │
│   [Presets]  │                      │
│              │                      │
├──────────────┴──────────────────────┤
│  Info Panel: Explicación física     │
│  + constantes de movimiento         │
└─────────────────────────────────────┘
```

### Animaciones
- Fade-in de la trayectoria (nuevo punto con opacity 1 → 0.3)
- Glow pulsante en los puntos de Lagrange
- Transición suave al cambiar presets (500ms)

---

## Roadmap de Desarrollo (Fases)

### Fase 1: Setup y 2 Cuerpos
- Inicializar proyecto Vite + React + Three.js
- Escena 3D básica con 2 esferas orbitando (órbita circular hardcodeada)
- Panel de controles básico (play/pause, reset)

### Fase 2: Integrador RK4
- Implementar RK4 genérico en `physics/rk4.js`
- Implementar ecuaciones CR3BP en `physics/cr3bp.js`
- Validar conservación de la constante de Jacobi (error < 1e-6)

### Fase 3: Puntos de Lagrange
- Calcular L1, L2, L3 numéricamente (Newton-Raphson)
- Calcular L4, L5 analíticamente
- Visualizar los 5 puntos en la escena

### Fase 4: Condiciones Iniciales Interactivas
- Sliders para posición y velocidad inicial
- Click en el canvas para colocar satélite
- Display de C (Jacobi) en tiempo real

### Fase 5: Presets de Órbitas Famosas
- JWST en L2 (órbita de halo)
- Troyano en L4
- Inestabilidad en L1
- Botones de carga rápida

### Fase 6: Pulido Visual
- Gradiente en trayectoria
- Glow en puntos L
- Curvas de Hill (opcional, superficie 3D semitransparente)
- Responsive design

### Fase 7: Deploy y Documentación
- GitHub Pages
- README con física + instrucciones
- Video demo (opcional)

---

## Criterios de Éxito

### Funcionales
- [ ] Integrador RK4 conserva C de Jacobi con error relativo < 0.1%
- [ ] Los 5 puntos de Lagrange se calculan correctamente (validar con valores de papers)
- [ ] Preset de JWST genera órbita periódica estable
- [ ] Click-to-place funciona sin crashes

### Visuales
- [ ] 60 fps con trayectoria de 5000 puntos
- [ ] Estilo consistente con tu OAC 3D
- [ ] Controles intuitivos (sin leer documentación)

### Educativos
- [ ] Un usuario de 2º de Física entiende qué son los puntos L viendo la simulación
- [ ] Panel de info explica el CR3BP sin jerga innecesaria

---

## Referencias Técnicas

### Papers
- Koon et al. (2000) — "Dynamical Systems, the Three-Body Problem and Space Mission Design"
- Szebehely (1967) — "Theory of Orbits" (biblia del CR3BP)

### Código de Referencia
- poliastro (Python) — implementación CR3BP
- GMAT (NASA) — validación de órbitas de halo

### Validación Numérica
**Test case:** Sistema Tierra-Luna, órbita de halo planar en L2
- Amplitud: A_y ≈ 15000 km
- Periodo: T ≈ 14.7 días
- C_Jacobi ≈ 3.18 (debe permanecer constante ±0.01)

---

## Notas Finales

### Lo que NO vamos a hacer (scope creep)
- ❌ Perturbaciones no gravitacionales (presión solar, etc.)
- ❌ Más de 3 cuerpos simultáneos
- ❌ Relatividad General
- ❌ Editor de órbitas estilo CAD

### Extensiones Futuras (post-MVP)
- 🔮 Mapas de Poincaré para estudiar caos
- 🔮 Exportar trayectorias a CSV
- 🔮 Realidad aumentada con móvil (WebXR)

---

**Fin del PLANNING.md**
