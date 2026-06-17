<script setup lang="ts">
import { computed } from 'vue';

export type IconName =
  | 'dashboard'
  | 'projects'
  | 'sun'
  | 'moon'
  | 'pencil'
  | 'trash'
  | 'plus'
  | 'search'
  | 'reset'
  | 'alert'
  | 'check-circle'
  | 'clock'
  | 'list'
  | 'close'
  | 'arrow-left'
  | 'chevron-down'
  | 'chevron-right';

type Shape =
  | { tag: 'path'; d: string }
  | { tag: 'circle'; cx: number; cy: number; r: number }
  | { tag: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { tag: 'rect'; x: number; y: number; w: number; h: number; rx: number };

const ICONS: Record<IconName, Shape[]> = {
  dashboard: [
    { tag: 'rect', x: 3, y: 3, w: 7, h: 7, rx: 1.5 },
    { tag: 'rect', x: 14, y: 3, w: 7, h: 7, rx: 1.5 },
    { tag: 'rect', x: 14, y: 14, w: 7, h: 7, rx: 1.5 },
    { tag: 'rect', x: 3, y: 14, w: 7, h: 7, rx: 1.5 },
  ],
  projects: [
    {
      tag: 'path',
      d: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z',
    },
  ],
  sun: [
    { tag: 'circle', cx: 12, cy: 12, r: 4 },
    { tag: 'line', x1: 12, y1: 1.5, x2: 12, y2: 3.5 },
    { tag: 'line', x1: 12, y1: 20.5, x2: 12, y2: 22.5 },
    { tag: 'line', x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64 },
    { tag: 'line', x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78 },
    { tag: 'line', x1: 1.5, y1: 12, x2: 3.5, y2: 12 },
    { tag: 'line', x1: 20.5, y1: 12, x2: 22.5, y2: 12 },
    { tag: 'line', x1: 4.22, y1: 19.78, x2: 5.64, y2: 18.36 },
    { tag: 'line', x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 },
  ],
  moon: [{ tag: 'path', d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' }],
  pencil: [
    { tag: 'path', d: 'M12 20h9' },
    { tag: 'path', d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' },
  ],
  trash: [
    { tag: 'path', d: 'M3 6h18' },
    { tag: 'path', d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' },
    { tag: 'line', x1: 10, y1: 11, x2: 10, y2: 17 },
    { tag: 'line', x1: 14, y1: 11, x2: 14, y2: 17 },
  ],
  plus: [
    { tag: 'line', x1: 12, y1: 5, x2: 12, y2: 19 },
    { tag: 'line', x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  search: [
    { tag: 'circle', cx: 11, cy: 11, r: 7 },
    { tag: 'line', x1: 16.65, y1: 16.65, x2: 21, y2: 21 },
  ],
  reset: [
    { tag: 'path', d: 'M3 2v6h6' },
    { tag: 'path', d: 'M3.51 9a9 9 0 1 0 2.13-3.36L3 8' },
  ],
  alert: [
    { tag: 'path', d: 'm21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' },
    { tag: 'line', x1: 12, y1: 9, x2: 12, y2: 13 },
    { tag: 'path', d: 'M12 17h.01' },
  ],
  'check-circle': [
    { tag: 'path', d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
    { tag: 'path', d: 'm9 11 3 3L22 4' },
  ],
  clock: [
    { tag: 'circle', cx: 12, cy: 12, r: 9 },
    { tag: 'path', d: 'M12 7v5l3 2' },
  ],
  list: [
    { tag: 'line', x1: 8, y1: 6, x2: 21, y2: 6 },
    { tag: 'line', x1: 8, y1: 12, x2: 21, y2: 12 },
    { tag: 'line', x1: 8, y1: 18, x2: 21, y2: 18 },
    { tag: 'path', d: 'M3 6h.01' },
    { tag: 'path', d: 'M3 12h.01' },
    { tag: 'path', d: 'M3 18h.01' },
  ],
  close: [
    { tag: 'line', x1: 18, y1: 6, x2: 6, y2: 18 },
    { tag: 'line', x1: 6, y1: 6, x2: 18, y2: 18 },
  ],
  'arrow-left': [
    { tag: 'path', d: 'm12 19-7-7 7-7' },
    { tag: 'line', x1: 19, y1: 12, x2: 5, y2: 12 },
  ],
  'chevron-down': [{ tag: 'path', d: 'm6 9 6 6 6-6' }],
  'chevron-right': [{ tag: 'path', d: 'm9 18 6-6-6-6' }],
};

const props = withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 18 });

const shapes = computed<Shape[]>(() => ICONS[props.name]);
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-for="(shape, i) in shapes" :key="i">
      <path v-if="shape.tag === 'path'" :d="shape.d" />
      <circle v-else-if="shape.tag === 'circle'" :cx="shape.cx" :cy="shape.cy" :r="shape.r" />
      <line
        v-else-if="shape.tag === 'line'"
        :x1="shape.x1"
        :y1="shape.y1"
        :x2="shape.x2"
        :y2="shape.y2"
      />
      <rect
        v-else-if="shape.tag === 'rect'"
        :x="shape.x"
        :y="shape.y"
        :width="shape.w"
        :height="shape.h"
        :rx="shape.rx"
      />
    </template>
  </svg>
</template>

<style scoped>
/* Block display removes the inline-SVG baseline gap so icons align in flex rows. */
svg {
  display: block;
  flex-shrink: 0;
}
</style>
