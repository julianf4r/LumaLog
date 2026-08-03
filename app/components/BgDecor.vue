<script setup lang="ts">
/**
 * 背景三层：等高线（屿）、地平线微光（光）、细噪点（质感）。
 * 整体 fixed 不随页面滚动，只作为氛围底衬。
 */
</script>

<template>
  <div class="bg-decor" aria-hidden="true">
    <svg class="bg-contour" viewBox="-118 -118 236 236" fill="none">
      <g stroke="currentColor" stroke-width="0.8" stroke-linejoin="round">
        <path v-for="s in ISLE_CONTOURS" :key="s" :d="ISLE_PATH" :transform="`scale(${s})`" />
      </g>
    </svg>

    <svg class="bg-contour bg-contour--alt" viewBox="-118 -118 236 236" fill="none">
      <g stroke="currentColor" stroke-width="1" stroke-linejoin="round">
        <path v-for="s in [1, 0.76, 0.52, 0.28]" :key="s" :d="ISLE_PATH" :transform="`scale(${s})`" />
      </g>
    </svg>

    <div class="bg-horizon" />

    <svg class="bg-grain">
      <filter id="luma-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#luma-grain)" />
    </svg>
  </div>
</template>
