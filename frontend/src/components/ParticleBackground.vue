<template>
  <div class="particle-background" ref="particleContainer">
    <canvas ref="particleCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const particleCanvas = ref<HTMLCanvasElement | null>(null)
const particleContainer = ref<HTMLElement | null>(null)
let animationFrameId: number | null = null

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
}

const particles: Particle[] = []
const particleCount = 50
const connectionDistance = 150
const mousePosition = { x: 0, y: 0 }

const initParticles = (canvas: HTMLCanvasElement) => {
  const width = canvas.width
  const height = canvas.height

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.5
    })
  }
}

const drawParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.clearRect(0, 0, width, height)

  particles.forEach((particle, i) => {
    // 更新粒子位置
    particle.x += particle.vx
    particle.y += particle.vy

    // 边界检查
    if (particle.x < 0 || particle.x > width) particle.vx *= -1
    if (particle.y < 0 || particle.y > height) particle.vy *= -1

    // 绘制粒子
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(24, 144, 255, ${particle.alpha})`
    ctx.fill()

    // 绘制连接线
    particles.slice(i + 1).forEach(otherParticle => {
      const dx = particle.x - otherParticle.x
      const dy = particle.y - otherParticle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < connectionDistance) {
        const alpha = (1 - distance / connectionDistance) * 0.2
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(otherParticle.x, otherParticle.y)
        ctx.strokeStyle = `rgba(24, 144, 255, ${alpha})`
        ctx.stroke()
      }
    })

    // 与鼠标位置连接
    const dx = particle.x - mousePosition.x
    const dy = particle.y - mousePosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < connectionDistance) {
      const alpha = (1 - distance / connectionDistance) * 0.5
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(mousePosition.x, mousePosition.y)
      ctx.strokeStyle = `rgba(24, 144, 255, ${alpha})`
      ctx.stroke()
    }
  })
}

const animate = () => {
  if (!particleCanvas.value) return
  
  const ctx = particleCanvas.value.getContext('2d')
  if (!ctx) return

  drawParticles(ctx, particleCanvas.value.width, particleCanvas.value.height)
  animationFrameId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (!particleCanvas.value || !particleContainer.value) return

  particleCanvas.value.width = particleContainer.value.clientWidth
  particleCanvas.value.height = particleContainer.value.clientHeight
}

const handleMouseMove = (e: MouseEvent) => {
  if (!particleCanvas.value) return
  
  const rect = particleCanvas.value.getBoundingClientRect()
  mousePosition.x = e.clientX - rect.left
  mousePosition.y = e.clientY - rect.top
}

onMounted(() => {
  if (!particleCanvas.value) return

  handleResize()
  initParticles(particleCanvas.value)
  animate()

  window.addEventListener('resize', handleResize)
  particleCanvas.value.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', handleResize)
  if (particleCanvas.value) {
    particleCanvas.value.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<style lang="scss" scoped>
.particle-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  
  canvas {
    display: block;
  }
}
</style> 