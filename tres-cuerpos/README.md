# Simulador 3D del Problema de los Tres Cuerpos

Simulador interactivo en web del CR3BP (Problema Restringido Circular de los Tres Cuerpos), centrado en:

- dinamica del tercer cuerpo con integracion RK4
- puntos de Lagrange L1-L5
- presets orbitales educativos (JWST L2, Troyano L4, Inestable L1)
- visualizacion 3D en tiempo real con Three.js

## Stack

- React + Vite
- Three.js
- Tailwind CSS
- Lucide React

## Ejecucion local

1. Instala dependencias:

```bash
npm install
```

2. Levanta servidor de desarrollo:

```bash
npm run dev
```

3. Abre en navegador la URL mostrada por Vite, normalmente:

```text
http://localhost:5173/
```

## Build de produccion

```bash
npm run build
npm run preview
```

## Validacion numerica rapida

Ejecuta una comprobacion automatica de:

- orden correcto de L1, L2, L3
- geometria equilatera de L4/L5
- conservacion de Jacobi con RK4

```bash
npm run validate:physics
```

## Controles

- Play/Pausar simulacion
- Reset instantaneo al estado inicial
- Cambio de sistema binario (Sol-Tierra, Tierra-Luna, Pluton-Caronte)
- Sliders de posicion y velocidad inicial
- Timestep y velocidad de animacion
- Mostrar/ocultar puntos de Lagrange
- Mostrar/ocultar trayectoria
- Mostrar/ocultar curvas de Hill (aproximacion visual)
- Presets de condiciones iniciales

## Fisica implementada

- Ecuaciones del CR3BP en marco rotante
- Integrador Runge-Kutta 4 (RK4)
- Calculo numerico de L1, L2, L3 por Newton-Raphson
- Calculo analitico de L4, L5
- Monitoreo de constante de Jacobi y error relativo

## Deploy en GitHub Pages

Este proyecto ya incluye configuracion base para Pages con repositorio `tres-cuerpos`.

1. Instala dependencias (si aun no):

```bash
npm install
```

2. Publica:

```bash
npm run deploy
```

3. En GitHub, verifica en Settings -> Pages que la rama `gh-pages` esta habilitada.

4. URL esperada:

```text
https://<tu-usuario>.github.io/tres-cuerpos/
```

## Notas

- Si cambias el nombre del repositorio en GitHub, actualiza `base` en `vite.config.js`.
- El warning de chunk grande en Three.js es esperable en este tipo de app 3D.
