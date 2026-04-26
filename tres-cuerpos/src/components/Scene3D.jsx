import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { calculateJacobi, cr3bpDerivatives } from '../physics/cr3bp'
import { calculateAllLagrangePoints } from '../physics/lagrangePoints'
import { rk4Step } from '../physics/rk4'
import { BINARY_SYSTEMS } from '../utils/constants'

function Scene3D({
  dt,
  initialState,
  isRunning,
  mu,
  systemKey,
  onTelemetry,
  resetConfig,
  simulationSpeed,
  hillJacobi,
  showHillCurves,
  showLagrange,
  showTrajectory,
  trajectoryLimit,
  transitionDurationMs,
}) {
  const containerRef = useRef(null)
  const settingsRef = useRef({
    dt,
    isRunning,
    mu,
    systemKey,
    initialState,
    resetConfig,
    simulationSpeed,
    hillJacobi,
    showHillCurves,
    showLagrange,
    showTrajectory,
    trajectoryLimit,
  })
  const stateRef = useRef(initialState)
  const timeRef = useRef(0)
  const frameCounterRef = useRef(0)
  const lastFrameTimeRef = useRef(null)
  const physicsAccumulatorRef = useRef(0)

  useEffect(() => {
    settingsRef.current = {
      dt,
      isRunning,
      mu,
      systemKey,
      initialState,
      resetConfig,
      simulationSpeed,
      hillJacobi,
      showHillCurves,
      showLagrange,
      showTrajectory,
      trajectoryLimit,
    }
  }, [
    dt,
    isRunning,
    mu,
    systemKey,
    initialState,
    resetConfig,
    simulationSpeed,
    hillJacobi,
    showHillCurves,
    showLagrange,
    showTrajectory,
    trajectoryLimit,
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const systemConfig = BINARY_SYSTEMS[systemKey] ?? BINARY_SYSTEMS.SUN_EARTH
    const primaryColors = systemConfig.primaryColors ?? {
      m1: 0xffd700,
      m2: 0x4a90e2,
    }

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.01,
      100,
    )
    camera.position.set(2, 1.5, 2)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(primaryColors.m1, 0.8)
    pointLight.position.set(-mu, 0, 0)
    scene.add(pointLight)

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 32, 32),
      new THREE.MeshStandardMaterial({
        color: primaryColors.m1,
        emissive: primaryColors.m1,
        emissiveIntensity: 0.5,
        metalness: 0,
        roughness: 0.3,
      }),
    )
    sun.position.set(-mu, 0, 0)
    sun.userData = { type: 'sun' }
    scene.add(sun)

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 32, 32),
      new THREE.MeshStandardMaterial({
        color: primaryColors.m2,
        metalness: 0.1,
        roughness: 0.6,
      }),
    )
    earth.position.set(1 - mu, 0, 0)
    scene.add(earth)

    const lagrangeMeshes = []
    const lagrangeGlows = []
    const lagrangePoints = calculateAllLagrangePoints(mu)
    const lagrangeKeys = ['L1', 'L2', 'L3', 'L4', 'L5']

    for (let index = 0; index < lagrangeKeys.length; index += 1) {
      const key = lagrangeKeys[index]
      const point = lagrangePoints[key]
      const stablePoint = key === 'L4' || key === 'L5'
      const baseColor = stablePoint ? 0x00ff88 : 0xff4444
      const lagrangeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 16, 16),
        new THREE.MeshBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.65,
        }),
      )
      lagrangeMesh.position.set(point.x, point.y, point.z)
      lagrangeMeshes.push(lagrangeMesh)
      scene.add(lagrangeMesh)

      const lagrangeGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 16, 16),
        new THREE.MeshBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: stablePoint ? 0.28 : 0.22,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      )
      lagrangeGlow.position.copy(lagrangeMesh.position)
      lagrangeGlow.userData = {
        phase: index * 0.8,
        baseOpacity: stablePoint ? 0.28 : 0.22,
      }
      lagrangeGlows.push(lagrangeGlow)
      scene.add(lagrangeGlow)
    }

    const grid = new THREE.GridHelper(6, 24, 0x223355, 0x1a2330)
    grid.position.y = -0.2
    scene.add(grid)

    const satellite = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    )
    scene.add(satellite)

    const trajectoryPositions = []
    let appliedResetId = -1
    const transition = {
      active: false,
      start: null,
      target: null,
      startTime: 0,
      duration: transitionDurationMs,
    }
    const trajectoryGeometry = new THREE.BufferGeometry()
    const trajectoryMaterial = new THREE.LineBasicMaterial({ vertexColors: true })
    const trajectory = new THREE.Line(trajectoryGeometry, trajectoryMaterial)
    scene.add(trajectory)

    const updateTrajectoryGeometry = () => {
      const count = trajectoryPositions.length
      if (count === 0) {
        trajectoryGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
        trajectoryGeometry.setAttribute('color', new THREE.Float32BufferAttribute([], 3))
        return
      }

      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)

      for (let i = 0; i < count; i += 1) {
        const point = trajectoryPositions[i]
        const offset = i * 3
        const age = count > 1 ? i / (count - 1) : 1

        // Oldest points drift to cyan while newest points stay white.
        const r = age
        const g = 0.55 + 0.45 * age
        const b = 0.65 + 0.35 * age

        positions[offset] = point.x
        positions[offset + 1] = point.y
        positions[offset + 2] = point.z

        colors[offset] = r
        colors[offset + 1] = g
        colors[offset + 2] = b
      }

      trajectoryGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      trajectoryGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      trajectoryGeometry.computeBoundingSphere()
    }

    const hillPointsGeometry = new THREE.BufferGeometry()
    const hillVertices = []
    const hillRange = 2.2
    const hillResolution = 120
    const hillThreshold = 0.015

    for (let i = 0; i <= hillResolution; i += 1) {
      const x = -hillRange + (2 * hillRange * i) / hillResolution
      for (let j = 0; j <= hillResolution; j += 1) {
        const y = -hillRange + (2 * hillRange * j) / hillResolution
        const r1 = Math.max(Math.sqrt((x + mu) ** 2 + y ** 2), 1e-9)
        const r2 = Math.max(Math.sqrt((x - 1 + mu) ** 2 + y ** 2), 1e-9)
        const omega = 0.5 * (x ** 2 + y ** 2) + (1 - mu) / r1 + mu / r2
        const jacobiAtPoint = 2 * omega

        if (Math.abs(jacobiAtPoint - hillJacobi) <= hillThreshold) {
          hillVertices.push(x, y, 0)
        }
      }
    }

    hillPointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(hillVertices, 3))
    const hillPointsMaterial = new THREE.PointsMaterial({
      color: 0x66ccff,
      size: 0.015,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })
    const hillPoints = new THREE.Points(hillPointsGeometry, hillPointsMaterial)
    scene.add(hillPoints)

    const publishTelemetry = (state, time) => {
      const r1 = Math.sqrt((state.x + mu) ** 2 + state.y ** 2 + state.z ** 2)
      const r2 = Math.sqrt((state.x - 1 + mu) ** 2 + state.y ** 2 + state.z ** 2)
      onTelemetry({
        time,
        state,
        jacobi: calculateJacobi(state, mu),
        r1,
        r2,
      })
    }

    const applyInstantState = (state, keepTime = false) => {
      stateRef.current = { ...state }
      if (!keepTime) {
        timeRef.current = 0
      }
      physicsAccumulatorRef.current = 0
      frameCounterRef.current = 0
      trajectoryPositions.length = 0
      trajectoryPositions.push(new THREE.Vector3(state.x, state.y, state.z))
      updateTrajectoryGeometry()
      satellite.position.set(state.x, state.y, state.z)
      publishTelemetry(stateRef.current, timeRef.current)
    }

    const startSmoothTransition = (targetState) => {
      transition.active = true
      transition.start = { ...stateRef.current }
      transition.target = { ...targetState }
      transition.startTime = performance.now()
      transition.duration = transitionDurationMs
      timeRef.current = 0
      physicsAccumulatorRef.current = 0
      frameCounterRef.current = 0
      trajectoryPositions.length = 0
      trajectoryPositions.push(
        new THREE.Vector3(transition.start.x, transition.start.y, transition.start.z),
      )
      updateTrajectoryGeometry()
    }

    const resetSimulation = () => {
      applyInstantState(initialState)
      appliedResetId = resetConfig.id
    }

    resetSimulation()

    let frameId = 0

    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    const animate = (timestamp = performance.now()) => {
      const {
        dt: currentDt,
        isRunning: running,
        mu: currentMu,
        initialState: currentInitialState,
        resetConfig: currentResetConfig,
        simulationSpeed: speed,
        showHillCurves: displayHillCurves,
        showLagrange: displayLagrange,
        showTrajectory: displayTrajectory,
        trajectoryLimit: pathLimit,
      } = settingsRef.current

      if (lastFrameTimeRef.current == null) {
        lastFrameTimeRef.current = timestamp
      }

      const frameDeltaSeconds = Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.05)
      lastFrameTimeRef.current = timestamp

      if (currentResetConfig.id !== appliedResetId) {
        if (currentResetConfig.smooth) {
          startSmoothTransition(currentInitialState)
        } else {
          applyInstantState(currentInitialState)
        }
        appliedResetId = currentResetConfig.id
      }

      for (const lagrangeMesh of lagrangeMeshes) {
        lagrangeMesh.visible = displayLagrange
      }
      for (const lagrangeGlow of lagrangeGlows) {
        const pulse = 0.9 + 0.18 * Math.sin(timeRef.current * 2.2 + lagrangeGlow.userData.phase)
        lagrangeGlow.scale.setScalar(pulse)
        lagrangeGlow.material.opacity = lagrangeGlow.userData.baseOpacity * pulse
        lagrangeGlow.visible = displayLagrange
      }
      
      // Animar brillo del Sol
      if (sun.material) {
        const sunPulse = 0.5 + 0.3 * Math.sin(timeRef.current * 1.5)
        sun.material.emissiveIntensity = sunPulse
      }
      trajectory.visible = displayTrajectory
      hillPoints.visible = displayHillCurves

      if (transition.active) {
        physicsAccumulatorRef.current = 0
        const elapsed = performance.now() - transition.startTime
        const normalized = transition.duration <= 0 ? 1 : Math.min(1, elapsed / transition.duration)
        const eased = normalized < 0.5
          ? 2 * normalized * normalized
          : 1 - ((-2 * normalized + 2) ** 2) / 2

        const interpolatedState = {
          x: transition.start.x + (transition.target.x - transition.start.x) * eased,
          y: transition.start.y + (transition.target.y - transition.start.y) * eased,
          z: transition.start.z + (transition.target.z - transition.start.z) * eased,
          vx: transition.start.vx + (transition.target.vx - transition.start.vx) * eased,
          vy: transition.start.vy + (transition.target.vy - transition.start.vy) * eased,
          vz: transition.start.vz + (transition.target.vz - transition.start.vz) * eased,
        }

        stateRef.current = interpolatedState
        satellite.position.set(interpolatedState.x, interpolatedState.y, interpolatedState.z)
        publishTelemetry(interpolatedState, 0)

        if (normalized >= 1) {
          transition.active = false
          applyInstantState(transition.target)
        }
      } else if (running) {
        physicsAccumulatorRef.current += frameDeltaSeconds * 60 * currentDt * speed

        let stepsTaken = 0
        const maxStepsPerFrame = 50
        while (physicsAccumulatorRef.current >= currentDt && stepsTaken < maxStepsPerFrame) {
          const nextState = rk4Step(
            (_t, currentState) => cr3bpDerivatives(_t, currentState, currentMu),
            timeRef.current,
            stateRef.current,
            currentDt,
          )
          stateRef.current = nextState
          timeRef.current += currentDt
          physicsAccumulatorRef.current -= currentDt
          stepsTaken += 1
        }

        satellite.position.set(stateRef.current.x, stateRef.current.y, stateRef.current.z)

        if (stepsTaken > 0) {
          trajectoryPositions.push(
            new THREE.Vector3(stateRef.current.x, stateRef.current.y, stateRef.current.z),
          )
          if (trajectoryPositions.length > pathLimit) {
            trajectoryPositions.shift()
          }
          updateTrajectoryGeometry()
        }

        frameCounterRef.current += 1
        if (frameCounterRef.current % 3 === 0) {
          publishTelemetry(stateRef.current, timeRef.current)
        }
      } else {
        physicsAccumulatorRef.current = 0
        lastFrameTimeRef.current = timestamp

        // Keep paused simulations at their current state; only mirror slider edits before first run (t = 0).
        if (timeRef.current === 0) {
          stateRef.current = { ...currentInitialState }
          satellite.position.set(currentInitialState.x, currentInitialState.y, currentInitialState.z)
        }
      }

      controls.update()
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(animate)
    }

    window.addEventListener('resize', onResize)
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      window.cancelAnimationFrame(frameId)
      controls.dispose()

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points)) return
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          for (const material of object.material) material.dispose()
        } else {
          object.material.dispose()
        }
      })

      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [mu, systemKey, hillJacobi, onTelemetry, transitionDurationMs])

  return (
    <div className="h-[60vh] min-h-[420px] overflow-hidden rounded-xl border border-white/20 md:h-[72vh]" ref={containerRef} />
  )
}

export default Scene3D
