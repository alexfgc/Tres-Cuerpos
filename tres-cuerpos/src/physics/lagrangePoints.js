function collinearEquation(x, mu) {
  const r1 = Math.abs(x + mu)
  const r2 = Math.abs(x - 1 + mu)

  // Solve the x-axis equilibrium condition with y = z = 0.
  return x - ((1 - mu) * (x + mu)) / r1 ** 3 - (mu * (x - 1 + mu)) / r2 ** 3
}

function collinearDerivative(x, mu) {
  const r1 = Math.abs(x + mu)
  const r2 = Math.abs(x - 1 + mu)

  return 1 + (2 * (1 - mu)) / r1 ** 3 + (2 * mu) / r2 ** 3
}

function newtonRaphson(f, df, x0, tolerance = 1e-12, maxIter = 100) {
  let x = x0

  // Iterate until the root stabilizes or the solver gives up.
  for (let i = 0; i < maxIter; i += 1) {
    const fx = f(x)
    const dfx = df(x)

    if (Math.abs(dfx) < 1e-14) break

    const next = x - fx / dfx
    if (Math.abs(next - x) < tolerance) return next
    x = next
  }

  return x
}

export function calculateL4L5(mu) {
  const x = 0.5 - mu
  const y = Math.sqrt(3) / 2

  return {
    L4: { x, y, z: 0 },
    L5: { x, y: -y, z: 0 },
  }
}

export function calculateL1(mu) {
  const guess = 1 - Math.cbrt(mu / 3)
  return newtonRaphson(
    (x) => collinearEquation(x, mu),
    (x) => collinearDerivative(x, mu),
    guess,
  )
}

export function calculateL2(mu) {
  const guess = 1 + Math.cbrt(mu / 3)
  return newtonRaphson(
    (x) => collinearEquation(x, mu),
    (x) => collinearDerivative(x, mu),
    guess,
  )
}

export function calculateL3(mu) {
  const guess = -1 - (5 * mu) / 12
  return newtonRaphson(
    (x) => collinearEquation(x, mu),
    (x) => collinearDerivative(x, mu),
    guess,
  )
}

export function calculateAllLagrangePoints(mu) {
  const { L4, L5 } = calculateL4L5(mu)

  return {
    L1: { x: calculateL1(mu), y: 0, z: 0 },
    L2: { x: calculateL2(mu), y: 0, z: 0 },
    L3: { x: calculateL3(mu), y: 0, z: 0 },
    L4,
    L5,
  }
}
