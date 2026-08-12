"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

const vertex = `
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
  vNormal = normalize((normalMatrix * vec4(normal, 0.0)).xyz);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`

const fragment = `
precision highp float;
uniform float uTime;
varying vec3 vNormal;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec3 normal = normalize(vNormal);
  float light = max(dot(normal, normalize(vec3(-0.4, 0.6, 1.0))), 0.0);
  float terrain = noise(vUv * vec2(10.0, 5.0)) + noise(vUv * vec2(23.0, 11.0)) * 0.35;
  float land = smoothstep(0.67, 0.78, terrain + sin(vUv.x * 25.0) * 0.06);
  vec3 ocean = vec3(0.025, 0.05, 0.085);
  vec3 landColor = mix(vec3(0.08, 0.13, 0.19), vec3(0.18, 0.29, 0.38), light);
  vec3 color = mix(ocean, landColor, land);
  float rim = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
  float latitude = smoothstep(0.92, 1.0, sin(vUv.y * 42.0 + uTime * 0.08) * 0.5 + 0.5);
  color += rim * vec3(0.015, 0.09, 0.15) + latitude * land * vec3(0.02, 0.13, 0.2);
  gl_FragColor = vec4(color, 0.98);
}`

export function GlobeVisualization() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false
    let frame = 0
    let cleanup = () => {}

    async function initialize() {
      try {
        const { Camera, Mesh, Program, Renderer, Sphere, Transform } = await import("ogl")
        if (cancelled || !containerRef.current) return

        const container = containerRef.current
        const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 2) })
        const gl = renderer.gl
        container.appendChild(renderer.gl.canvas)
        renderer.gl.canvas.setAttribute("aria-hidden", "true")

        const camera = new Camera(gl, { fov: 35, near: 0.1, far: 100 })
        camera.position.z = 2.8
        const scene = new Transform()
        const geometry = new Sphere(gl, { radius: 1, widthSegments: 96, heightSegments: 64 })
        const program = new Program(gl, {
          vertex,
          fragment,
          uniforms: { uTime: { value: 0 } },
          cullFace: gl.BACK,
        })
        const globe = new Mesh(gl, { geometry, program })
        globe.setParent(scene)
        globe.scale.set(0.78, 0.78, 0.78)
        const canvas = renderer.gl.canvas
        let dragging = false
        let lastX = 0
        let rotation = 0

        const resize = () => {
          const { width, height } = container.getBoundingClientRect()
          renderer.setSize(Math.max(width, 1), Math.max(height, 1))
          camera.perspective({ aspect: width / Math.max(height, 1) })
        }
        const pointerDown = (event: globalThis.PointerEvent) => { dragging = true; lastX = event.clientX; canvas.setPointerCapture(event.pointerId) }
        const pointerMove = (event: globalThis.PointerEvent) => {
          if (!dragging) return
          rotation += (event.clientX - lastX) * 0.006
          lastX = event.clientX
        }
        const pointerUp = (event: globalThis.PointerEvent) => { dragging = false; canvas.releasePointerCapture(event.pointerId) }
        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(container)
        canvas.addEventListener("pointerdown", pointerDown)
        canvas.addEventListener("pointermove", pointerMove)
        canvas.addEventListener("pointerup", pointerUp)
        canvas.addEventListener("pointercancel", pointerUp)
        resize()

        const render = (time: number) => {
          if (!reducedMotion && !dragging) rotation += 0.00025
          globe.rotation.y = rotation
          globe.rotation.x = -0.08
          program.uniforms.uTime.value = time * 0.001
          renderer.render({ scene, camera })
          frame = window.requestAnimationFrame(render)
        }
        frame = window.requestAnimationFrame(render)
        cleanup = () => {
          window.cancelAnimationFrame(frame)
          resizeObserver.disconnect()
          canvas.removeEventListener("pointerdown", pointerDown)
          canvas.removeEventListener("pointermove", pointerMove)
          canvas.removeEventListener("pointerup", pointerUp)
          canvas.removeEventListener("pointercancel", pointerUp)
          canvas.remove()
          renderer.gl.getExtension("WEBGL_lose_context")?.loseContext()
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    void initialize()
    return () => { cancelled = true; cleanup(); window.cancelAnimationFrame(frame) }
  }, [reducedMotion])

  return (
    <motion.div
      ref={containerRef}
      className="relative aspect-square w-full max-w-[min(78vh,48rem)] overflow-hidden rounded-[2rem] border border-border/70 bg-bg-base/35"
      aria-label="Interactive RiskSphere globe"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}
    >
      {failed ? <div className="size-[68%] rounded-full border border-border-strong bg-bg-card/40 shadow-[0_0_0_1rem_rgba(42,111,181,0.04),0_0_0_2rem_rgba(42,111,181,0.025)]" aria-hidden="true" /> : null}
    </motion.div>
  )
}
