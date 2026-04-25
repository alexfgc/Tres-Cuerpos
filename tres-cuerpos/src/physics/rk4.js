function mapState(state, mapper) {
  const mapped = {}
  for (const key of Object.keys(state)) {
    mapped[key] = mapper(state[key], key)
  }
  return mapped
}

export function add(a, b) {
  return mapState(a, (_, key) => a[key] + b[key])
}

export function scale(state, scalar) {
  return mapState(state, (value) => value * scalar)
}

export function norm(state) {
  let total = 0
  for (const value of Object.values(state)) {
    total += value * value
  }
  return Math.sqrt(total)
}

export function rk4Step(derivativeFunc, t, state, dt) {
  // Sample the derivative field at four points and combine them with the RK4 weights.
  const k1 = derivativeFunc(t, state)
  const k2 = derivativeFunc(t + dt / 2, add(state, scale(k1, dt / 2)))
  const k3 = derivativeFunc(t + dt / 2, add(state, scale(k2, dt / 2)))
  const k4 = derivativeFunc(t + dt, add(state, scale(k3, dt)))

  const weighted = add(k1, add(scale(add(k2, k3), 2), k4))
  return add(state, scale(weighted, dt / 6))
}
