# TASKS.md

## Tareas del Proyecto: Simulador 3D del Problema de los Tres Cuerpos

### Estado: 🟡 En Progreso

---

## FASE 1: Setup Inicial del Proyecto ✅

### Tarea 1.1: Inicializar proyecto Vite + React
- [x] Ejecutar `npm create vite@latest tres-cuerpos -- --template react`
- [x] Navegar al directorio: `cd tres-cuerpos`
- [x] Instalar dependencias: `npm install`
- [ ] Verificar que el servidor de desarrollo funciona: `npm run dev`

### Tarea 1.2: Instalar dependencias principales
- [x] Instalar Three.js: `npm install three`
- [x] Instalar Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [x] Inicializar Tailwind: `npx tailwindcss init -p`
- [x] Instalar lucide-react: `npm install lucide-react`

### Tarea 1.3: Configurar Tailwind CSS
- [x] Editar `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-black': '#000000',
        'primary': '#ffffff',
        'accent': '#4a90e2',
        'highlight': '#ffd700',
        'danger': '#ff4444',
        'success': '#00ff88',
      },
    },
  },
  plugins: [],
}
```
- [x] Agregar directivas de Tailwind en `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Tarea 1.4: Crear estructura de carpetas
- [x] Crear carpeta `src/components/`
- [x] Crear carpeta `src/physics/`
- [x] Crear carpeta `src/utils/`
- [ ] Limpiar archivos de ejemplo de Vite (App.css, etc.)

---

## FASE 2: Escena 3D Básica ✅

### Tarea 2.1: Crear componente Scene3D.jsx
- [x] Crear archivo `src/components/Scene3D.jsx`
- [x] Importar Three.js y useRef, useEffect de React
- [x] Crear canvas con ref
- [x] Inicializar escena, cámara y renderer en useEffect
- [x] Agregar OrbitControls
- [x] Configurar fondo negro: `scene.background = new THREE.Color(0x000000)`
- [x] Configurar cámara inicial: `camera.position.set(2, 1.5, 2)`
- [x] Implementar loop de animación con requestAnimationFrame
- [x] Limpiar recursos en cleanup de useEffect

### Tarea 2.2: Agregar iluminación básica
- [x] Crear AmbientLight con intensidad 0.4
- [x] Crear PointLight en posición de M1 con intensidad 0.8
- [x] Agregar ambas luces a la escena

### Tarea 2.3: Crear los dos cuerpos principales (hardcoded)
- [x] Crear esfera M1 (Sol):
  - SphereGeometry(0.1, 32, 32)
  - MeshStandardMaterial color 0xffd700
  - emissive 0xffd700, emissiveIntensity 0.5
  - Posición: (-μ, 0, 0) donde μ = 3.04e-6 para Sol-Tierra
- [x] Crear esfera M2 (Tierra):
  - SphereGeometry(0.03, 32, 32)
  - MeshStandardMaterial color 0x4a90e2
  - Posición: (1-μ, 0, 0)
- [x] Agregar ambas esferas a la escena

### Tarea 2.4: Integrar Scene3D en App.jsx
- [x] Importar Scene3D en App.jsx
- [x] Crear layout básico con Tailwind:
  - Header con título del proyecto
  - Contenedor principal flex
  - Scene3D ocupando la mayor parte de la pantalla
- [x] Verificar que las esferas se ven correctamente

---

## FASE 3: Física - Integrador RK4 ✅

### Tarea 3.1: Implementar funciones auxiliares de vectores
- [x] Crear archivo `src/physics/rk4.js`
- [x] Implementar función `add(v1, v2)` para sumar vectores
- [x] Implementar función `scale(v, scalar)` para multiplicar vector por escalar
- [x] Implementar función `norm(v)` para calcular magnitud de vector

### Tarea 3.2: Implementar integrador RK4 genérico
- [x] Implementar función `rk4Step(f, t, state, dt)`:
```javascript
export function rk4Step(derivativeFunc, t, state, dt) {
  const k1 = derivativeFunc(t, state);
  const k2 = derivativeFunc(t + dt/2, add(state, scale(k1, dt/2)));
  const k3 = derivativeFunc(t + dt/2, add(state, scale(k2, dt/2)));
  const k4 = derivativeFunc(t + dt, add(state, scale(k3, dt)));
  
  return add(state, scale(
    add(k1, add(scale(add(k2, k3), 2), k4)), 
    dt/6
  ));
}
```
- [x] Exportar funciones auxiliares también

### Tarea 3.3: Implementar ecuaciones CR3BP
- [x] Crear archivo `src/physics/cr3bp.js`
- [x] Implementar función `cr3bpDerivatives(t, state, mu)`:
  - Extraer {x, y, z, vx, vy, vz} del state
  - Calcular r1 = distancia a M1
  - Calcular r2 = distancia a M2
  - Calcular aceleraciones ax, ay, az según las ecuaciones del PLANNING.md
  - Retornar {x: vx, y: vy, z: vz, vx: ax, vy: ay, vz: az}

### Tarea 3.4: Implementar cálculo de la constante de Jacobi
- [x] En `cr3bp.js`, implementar función `calculateJacobi(state, mu)`:
  - Calcular potencial efectivo U
  - Calcular energía cinética en marco rotante
  - Retornar C = -2U - (vx² + vy² + vz²)

### Tarea 3.5: Validar integrador con caso simple
- [ ] Crear archivo de prueba temporal `src/physics/test.js`
- [ ] Probar órbita circular simple de dos cuerpos
- [ ] Verificar que la constante de Jacobi se conserva (error < 0.1%)
- [ ] Eliminar archivo de prueba después de validar

---

## FASE 4: Puntos de Lagrange ✅

### Tarea 4.1: Calcular L4 y L5 analíticamente
- [x] Crear archivo `src/physics/lagrangePoints.js`
- [x] Implementar función `calculateL4L5(mu)`:
```javascript
export function calculateL4L5(mu) {
  const x = 0.5 - mu;
  const y = Math.sqrt(3) / 2;
  return {
    L4: { x, y, z: 0 },
    L5: { x, y: -y, z: 0 }
  };
}
```

### Tarea 4.2: Calcular L1, L2, L3 numéricamente (Newton-Raphson)
- [x] Implementar función `newtonRaphson(f, df, x0, tolerance, maxIter)`
- [x] Implementar derivada del potencial efectivo en el eje X
- [x] Implementar función `calculateL1(mu)` con guess inicial adecuado
- [x] Implementar función `calculateL2(mu)` con guess inicial adecuado
- [x] Implementar función `calculateL3(mu)` con guess inicial adecuado
- [x] Crear función wrapper `calculateAllLagrangePoints(mu)` que retorne los 5 puntos

### Tarea 4.3: Validar posiciones de puntos L
- [ ] Crear test con μ = 3.04e-6 (Sol-Tierra)
- [ ] Verificar que L1 está entre M1 y M2
- [ ] Verificar que L2 está más allá de M2
- [ ] Verificar que L3 está del lado opuesto de M1
- [ ] Verificar que L4 y L5 forman triángulos equiláteros
- [ ] Comparar con valores de referencia de papers

### Tarea 4.4: Visualizar puntos de Lagrange en Scene3D
- [ ] En Scene3D, importar `calculateAllLagrangePoints`
- [ ] Calcular las 5 posiciones
- [ ] Crear esferas pequeñas para cada punto:
  - L1, L2, L3: SphereGeometry(0.02), color 0xff4444 (rojo)
  - L4, L5: SphereGeometry(0.02), color 0x00ff88 (verde)
  - Material: MeshBasicMaterial con transparent: true, opacity: 0.6
- [ ] Agregar las 5 esferas a la escena
- [ ] Verificar visualmente que están en las posiciones correctas

---

## FASE 5: Simulación Dinámica del Tercer Cuerpo ✅

### Tarea 5.1: Agregar estado de simulación en Scene3D
- [ ] Crear state con useState para:
  - `satelliteState` (x, y, z, vx, vy, vz)
  - `trajectory` (array de posiciones previas)
  - `time` (tiempo transcurrido)
  - `isRunning` (play/pause)
  - `mu` (parámetro de masa)
  - `dt` (timestep)

### Tarea 5.2: Crear mesh del satélite
- [ ] Crear SphereGeometry(0.01, 16, 16)
- [ ] MeshBasicMaterial color 0xffffff
- [ ] Agregar a la escena
- [ ] Actualizar posición del mesh según satelliteState en cada frame

### Tarea 5.3: Implementar loop de integración
- [ ] En el loop de animación, si isRunning:
  - Llamar a `rk4Step` con `cr3bpDerivatives`
  - Actualizar `satelliteState`
  - Agregar nueva posición a `trajectory`
  - Incrementar `time`
- [ ] Limitar trajectory a máximo 5000 puntos (FIFO)

### Tarea 5.4: Visualizar trayectoria
- [ ] Crear THREE.BufferGeometry para la trayectoria
- [ ] Actualizar posiciones del buffer geometry en cada frame
- [ ] Crear THREE.Line con LineBasicMaterial color 0xffffff
- [ ] Agregar línea a la escena
- [ ] Verificar que la trayectoria se dibuja correctamente

### Tarea 5.5: Agregar condiciones iniciales de prueba
- [ ] Hardcodear condición inicial cerca de L2:
  - x = 1.01, y = 0, z = 0.01
  - vx = 0, vy = 0.1, vz = 0
- [ ] Verificar que genera una órbita de halo aproximada
- [ ] Calcular y mostrar en consola la constante de Jacobi

---

## FASE 6: Panel de Controles ✅

### Tarea 6.1: Crear componente ControlPanel.jsx
- [ ] Crear archivo `src/components/ControlPanel.jsx`
- [ ] Importar lucide-react para iconos
- [ ] Crear estructura básica con Tailwind:
  - Contenedor con fondo semitransparente
  - Padding y border-radius
  - Scroll vertical si es necesario

### Tarea 6.2: Agregar controles play/pause/reset
- [ ] Crear botón Play/Pause con icono de lucide-react
- [ ] Crear botón Reset
- [ ] Pasar callbacks desde App.jsx/Scene3D
- [ ] Implementar lógica de play/pause (toggle isRunning)
- [ ] Implementar lógica de reset (volver a condiciones iniciales)

### Tarea 6.3: Agregar sliders de posición inicial
- [ ] Crear 3 sliders (X, Y, Z)
- [ ] Rango: -2 a 2
- [ ] Step: 0.01
- [ ] Mostrar valor actual al lado de cada slider
- [ ] Conectar con estado satelliteState
- [ ] Solo permitir modificación cuando isRunning = false

### Tarea 6.4: Agregar sliders de velocidad inicial
- [ ] Crear 3 sliders (VX, VY, VZ)
- [ ] Rango: -2 a 2
- [ ] Step: 0.01
- [ ] Mostrar valor actual
- [ ] Conectar con estado satelliteState

### Tarea 6.5: Agregar control de timestep y velocidad
- [ ] Slider para dt (0.001 - 0.1, step 0.001)
- [ ] Slider para velocidad de animación (1x - 100x)
- [ ] Conectar con estado

### Tarea 6.6: Agregar selector de sistema binario
- [ ] Dropdown o radio buttons para:
  - Sol-Tierra (μ = 3.04e-6)
  - Tierra-Luna (μ = 0.0121)
  - Plutón-Caronte (μ = 0.1089)
- [ ] Al cambiar sistema, actualizar mu y recalcular puntos L
- [ ] Mover M1 y M2 a nuevas posiciones

### Tarea 6.7: Agregar toggles de visualización
- [ ] Checkbox "Mostrar puntos de Lagrange"
- [ ] Checkbox "Mostrar trayectoria"
- [ ] Conectar con visibilidad de meshes en Scene3D

---

## FASE 7: Presets de Órbitas ✅

### Tarea 7.1: Crear componente PresetSelector.jsx
- [ ] Crear archivo `src/components/PresetSelector.jsx`
- [ ] Diseñar grid de botones con Tailwind
- [ ] 4 botones: JWST (L2), Troyano (L4), Inestable (L1), Custom

### Tarea 7.2: Definir condiciones iniciales de presets
- [ ] Crear archivo `src/utils/presets.js`
- [ ] Definir preset JWST_L2:
  - Sistema: Sol-Tierra
  - x = 1.01, y = 0, z = 0.01
  - vx = 0, vy = 0.1, vz = 0
- [ ] Definir preset TROJAN_L4:
  - Sistema: Sol-Tierra
  - Posición cerca de L4
  - Velocidad circular
- [ ] Definir preset UNSTABLE_L1:
  - Sistema: Sol-Tierra
  - Posición = L1 + pequeña perturbación
  - Velocidad inicial = 0
- [ ] Definir preset LISSAJOUS_L1 (bonus):
  - Órbita de Lissajous cerca de L1

### Tarea 7.3: Conectar presets con Scene3D
- [ ] Al hacer click en preset, cargar condiciones iniciales
- [ ] Resetear trayectoria
- [ ] Pausar simulación
- [ ] Actualizar sliders del ControlPanel

### Tarea 7.4: Validar presets
- [ ] JWST debe generar órbita de halo estable
- [ ] Troyano debe librar alrededor de L4
- [ ] Inestable debe escapar de L1
- [ ] Verificar conservación de Jacobi en todos los casos

---

## FASE 8: Panel de Información ✅

### Tarea 8.1: Crear componente InfoPanel.jsx
- [ ] Crear archivo `src/components/InfoPanel.jsx`
- [ ] Diseño con Tailwind: panel colapsable en la parte inferior
- [ ] Secciones: "Física del Problema", "Constantes de Movimiento", "Ayuda"

### Tarea 8.2: Agregar explicación del CR3BP
- [ ] Texto breve explicando el problema de tres cuerpos
- [ ] Explicación de qué son los puntos de Lagrange
- [ ] Ejemplos reales (JWST, asteroides troyanos)
- [ ] Sin fórmulas complejas, lenguaje accesible

### Tarea 8.3: Display de constantes en tiempo real
- [ ] Calcular y mostrar:
  - Constante de Jacobi C
  - Energía total
  - Distancias r1, r2
  - Tiempo transcurrido
- [ ] Formato: fuente monospace, 4 decimales
- [ ] Actualizar cada frame

### Tarea 8.4: Indicador de conservación
- [ ] Calcular error relativo en C respecto a C inicial
- [ ] Mostrar con código de color:
  - Verde: error < 0.1%
  - Amarillo: 0.1% < error < 1%
  - Rojo: error > 1%
- [ ] Advertir si la simulación es inestable numéricamente

---

## FASE 9: Pulido Visual ✅

### Tarea 9.1: Gradiente en la trayectoria
- [ ] Modificar BufferGeometry de trayectoria para usar VertexColors
- [ ] Asignar color a cada vértice:
  - Puntos nuevos: blanco (1, 1, 1)
  - Puntos viejos: cyan oscuro (0, 0.5, 0.5)
  - Gradiente lineal según índice
- [ ] Usar LineBasicMaterial con vertexColors: true

### Tarea 9.2: Glow en puntos de Lagrange
- [ ] Agregar SpriteMaterial con mapa de textura circular
- [ ] Animar scale con Math.sin(time) para efecto pulsante
- [ ] Aplicar a L1, L2, L3, L4, L5
- [ ] Intensidad mayor en L4 y L5 (estables)

### Tarea 9.3: Mejorar materiales de los cuerpos
- [ ] M1: agregar bloom con emissiveIntensity animado
- [ ] M2: agregar especular highlights
- [ ] Satélite: agregar trail effect con partículas (opcional)

### Tarea 9.4: Transiciones suaves al cambiar presets
- [ ] Implementar interpolación de posición/velocidad
- [ ] Duración: 500ms
- [ ] Easing: ease-in-out
- [ ] Usar requestAnimationFrame para animar

### Tarea 9.5: Responsive design
- [ ] Media queries en Tailwind para móviles
- [ ] Layout vertical en pantallas < 768px:
  - Canvas arriba (altura fija)
  - Controles abajo (scroll)
- [ ] Layout horizontal en pantallas > 768px:
  - Controles a la izquierda (ancho fijo)
  - Canvas a la derecha (flex-1)
- [ ] Ajustar tamaño de fuentes y botones

### Tarea 9.6: Loading state
- [ ] Mostrar spinner mientras se cargan assets de Three.js
- [ ] Texto: "Inicializando simulación..."
- [ ] Fade-out al terminar carga

---

## FASE 10: Curvas de Hill (Opcional) ⏸️

### Tarea 10.1: Calcular superficie de velocidad cero
- [ ] Para una C fija, resolver U(x,y,0) = -C/2
- [ ] Generar malla 2D en el plano z=0
- [ ] Resolución: 100x100 puntos

### Tarea 10.2: Visualizar como superficie 3D
- [ ] Crear PlaneGeometry con heightmap
- [ ] Material semitransparente (opacity 0.2)
- [ ] Color según altura (gradiente azul → rojo)

### Tarea 10.3: Toggle de visualización
- [ ] Checkbox "Mostrar curvas de Hill" en ControlPanel
- [ ] Conectar con visibilidad de la superficie
- [ ] Recalcular al cambiar C (si cambia preset)

---

## FASE 11: Testing y Validación ✅

### Tarea 11.1: Validar física
- [ ] Test 1: Órbita circular de dos cuerpos → C constante
- [ ] Test 2: JWST preset → periodo ≈ 14 días (verificar en unidades)
- [ ] Test 3: Troyano → no escapa de L4 en 1000 periodos orbitales
- [ ] Test 4: Error numérico < 0.1% para dt = 0.01

### Tarea 11.2: Validar UI/UX
- [ ] Los sliders responden sin lag
- [ ] Los presets cargan en < 100ms
- [ ] Los botones tienen feedback visual (hover, active)
- [ ] No hay flickering en la trayectoria

### Tarea 11.3: Cross-browser testing
- [ ] Chrome/Edge (expected to work)
- [ ] Firefox
- [ ] Safari (verificar OrbitControls)
- [ ] Móviles (iOS Safari, Chrome Android)

### Tarea 11.4: Performance profiling
- [ ] Abrir DevTools → Performance
- [ ] Grabar 10 segundos de simulación
- [ ] Verificar FPS ≥ 60
- [ ] Optimizar si hay frame drops:
  - Reducir puntos de trayectoria
  - Usar geometrías instanciadas si es necesario
  - Throttle de actualización de UI

---

## FASE 12: Documentación ✅

### Tarea 12.1: Crear README.md
- [ ] Sección: Qué es el proyecto
- [ ] Sección: Cómo ejecutar localmente
- [ ] Sección: Controles y uso
- [ ] Sección: Física detrás de la simulación (breve)
- [ ] Sección: Tecnologías usadas
- [ ] Sección: Referencias y créditos
- [ ] Screenshots o GIF demo

### Tarea 12.2: Comentar código crítico
- [ ] Comentarios en `rk4.js` explicando el algoritmo
- [ ] Comentarios en `cr3bp.js` con las ecuaciones
- [ ] Comentarios en `lagrangePoints.js` con la derivación

### Tarea 12.3: Agregar tooltips en la UI
- [ ] Hover en puntos L muestra "L1: Punto de Lagrange colineal"
- [ ] Hover en sliders muestra rango válido
- [ ] Hover en presets muestra descripción breve

---

## FASE 13: Deploy a GitHub Pages ✅

### Tarea 13.1: Configurar Vite para GitHub Pages
- [ ] Editar `vite.config.js`:
```javascript
export default {
  base: '/tres-cuerpos/',  // nombre del repo
}
```
- [ ] Instalar gh-pages: `npm install -D gh-pages`
- [ ] Agregar scripts en package.json:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### Tarea 13.2: Build de producción
- [ ] Ejecutar `npm run build`
- [ ] Verificar que no hay errores
- [ ] Verificar tamaño del bundle (< 1MB ideal)

### Tarea 13.3: Deploy
- [ ] Ejecutar `npm run deploy`
- [ ] Ir a Settings del repo → Pages
- [ ] Verificar que la rama gh-pages está seleccionada
- [ ] Esperar ~2 minutos
- [ ] Verificar que la página funciona en https://<usuario>.github.io/tres-cuerpos/

### Tarea 13.4: Validación post-deploy
- [ ] Verificar que todos los assets cargan (no hay 404)
- [ ] Verificar que la simulación funciona
- [ ] Verificar en móvil (responsive)

---

## FASE 14: Extras Opcionales 🎁

### Tarea 14.1: Exportar trayectorias
- [ ] Botón "Exportar CSV"
- [ ] Generar archivo con columnas: t, x, y, z, vx, vy, vz, C
- [ ] Descargar automáticamente

### Tarea 14.2: Compartir configuraciones
- [ ] Generar URL con parámetros: ?preset=jwst&mu=3.04e-6&x=1.01...
- [ ] Botón "Copiar enlace"
- [ ] Parsear parámetros al cargar la página

### Tarea 14.3: Dark/Light mode
- [ ] Toggle en el header
- [ ] Cambiar fondo de canvas (negro → gris claro)
- [ ] Cambiar colores de UI

### Tarea 14.4: Tutorial interactivo
- [ ] Intro.js o tutorial custom
- [ ] 5 pasos guiados:
  1. Cargar preset JWST
  2. Play simulación
  3. Cambiar timestep
  4. Resetear y modificar condición inicial
  5. Ver info en InfoPanel

---

## Checklist Final 🎯

- [ ] Física correcta (RK4 conserva C de Jacobi)
- [ ] 5 puntos de Lagrange calculados y visualizados
- [ ] 4 presets funcionando
- [ ] Controles interactivos completos
- [ ] 60 fps en desktop
- [ ] Responsive (funciona en móvil)
- [ ] Documentación (README + comentarios)
- [ ] Deploy funcional en GitHub Pages
- [ ] Estilo visual consistente con Kavang y tu OAC 3D

---

**Fin del TASKS.md**
