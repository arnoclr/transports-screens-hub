<script setup lang="ts">
import type { Screen } from "../screens";
defineProps<{ screens: Record<string, Screen>; selectedId: string }>();
defineEmits<{ (e: "select", id: string): void }>();
</script>

<template>
  <nav class="gallery" aria-label="Choisir un écran">
    <div class="screen-list">
      <button
        v-for="(screen, id) in screens"
        :key="id"
        type="button"
        class="screen-choice"
        :class="{ selected: selectedId === id }"
        :aria-pressed="selectedId === id"
        @click="$emit('select', id)"
      >
        <span class="thumbnail">
          <span
            class="thumbnail-frame"
            aria-hidden="true"
            v-html="screen.frame(screen.svgPreview)"
          ></span>
          <span v-if="screen.beta" class="beta-badge">bêta</span>
        </span>
        <span class="choice-name">{{ screen.name }}</span>
      </button>
    </div>
  </nav>
</template>
