<script setup lang="ts">
// Purely decorative, CSS-only ambient layer. Sits behind content, ignores
// pointer events, never affects layout, and freezes under reduced-motion.
</script>

<template>
  <div class="ambient" aria-hidden="true">
    <span class="ambient__blob ambient__blob--1" />
    <span class="ambient__blob ambient__blob--2" />
    <span class="ambient__blob ambient__blob--3" />
  </div>
</template>

<style scoped lang="scss">
.ambient {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict; // isolate paint/layout for performance
}

.ambient__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.ambient__blob--1 {
  width: 460px;
  height: 460px;
  top: -150px;
  left: -110px;
  background: radial-gradient(circle, var(--ambient-1) 0%, transparent 70%);
  animation: ambient-drift-a 28s ease-in-out infinite alternate;
}
.ambient__blob--2 {
  width: 520px;
  height: 520px;
  top: 18%;
  right: -160px;
  background: radial-gradient(circle, var(--ambient-2) 0%, transparent 70%);
  animation: ambient-drift-b 34s ease-in-out infinite alternate;
}
.ambient__blob--3 {
  width: 420px;
  height: 420px;
  bottom: -180px;
  left: 28%;
  background: radial-gradient(circle, var(--ambient-3) 0%, transparent 70%);
  animation: ambient-drift-c 24s ease-in-out infinite alternate;
}

@keyframes ambient-drift-a {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(50px, 40px, 0) scale(1.12);
  }
}
@keyframes ambient-drift-b {
  from {
    transform: translate3d(0, 0, 0) scale(1.05);
  }
  to {
    transform: translate3d(-40px, 30px, 0) scale(1);
  }
}
@keyframes ambient-drift-c {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(30px, -36px, 0) scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient__blob {
    animation: none;
  }
}
</style>
