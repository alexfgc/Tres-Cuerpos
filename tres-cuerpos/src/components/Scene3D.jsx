import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DEFAULT_MU } from '../utils/constants'
import { calculateAllLagrangePoints } from '../physics/lagrangePoints'

function Scene3D() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

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

    const pointLight = new THREE.PointLight(0xffffff, 0.8)
    pointLight.position.set(-DEFAULT_MU, 0, 0)
    scene.add(pointLight)

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.5,
      }),
    )
    sun.position.set(-DEFAULT_MU, 0, 0)
    scene.add(sun)

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x4a90e2 }),
    )
    earth.position.set(1 - DEFAULT_MU, 0, 0)
    scene.add(earth)

    const lagrangeMeshes = []
    const lagrangePoints = calculateAllLagrangePoints(DEFAULT_MU)
    for (const key of ['L1', 'L2', 'L3', 'L4', 'L5']) {
      const point = lagrangePoints[key]
      const stablePoint = key === 'L4' || key === 'L5'
      const lagrangeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 16, 16),
        new THREE.MeshBasicMaterial({
          color: stablePoint ? 0x00ff88 : 0xff4444,
          transparent: true,
          opacity: 0.65,
        }),
      )
      lagrangeMesh.position.set(point.x, point.y, point.z)
      lagrangeMeshes.push(lagrangeMesh)
      scene.add(lagrangeMesh)
    }

    const grid = new THREE.GridHelper(6, 24, 0x223355, 0x1a2330)
    grid.position.y = -0.2
    scene.add(grid)

    let frameId = 0

    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    const animate = () => {
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
        if (!(object instanceof THREE.Mesh)) return
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
  }, [])

  return (
    <div className="h-[60vh] min-h-[420px] overflow-hidden rounded-xl border border-white/20 md:h-[72vh]" ref={containerRef} />
  )
}

export default Scene3D
