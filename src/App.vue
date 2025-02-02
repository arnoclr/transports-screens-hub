<script setup lang="ts">
import { computed, ref } from "vue";
import { screens, type Screen } from "./screens";
import Selector from "./components/Selector.vue";

const selectedScreen = ref<Screen | null>(null);

const selectedScreenParams = ref<Record<string, string>>({});

const urlParams = computed<string>(() => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(selectedScreenParams.value)) {
    params.set(key, value);
  }
  return params.toString();
});

const url = computed<string>(() => {
  return selectedScreen.value?.url + "?" + urlParams.value;
});
</script>

<template>
  <code>{{ url }}</code>
  <ul>
    <li v-for="[id, screen] in Object.entries(screens)" :key="id">
      <label>
        <div class="preview" v-html="screen.svgPreview"></div>
        <input
          type="radio"
          name="screen"
          :value="screen"
          v-model="selectedScreen"
        />
      </label>
    </li>
  </ul>
  <template v-if="selectedScreen">
    <h1>{{ selectedScreen.name }}</h1>
    <span>{{ selectedScreen.commercialName }}</span>
    <ul>
      <li v-for="selector in selectedScreen.selectors">
        <label>{{ selector.label }}</label>
        <Selector
          :params="selector.params"
          v-model="selectedScreenParams"
        ></Selector>
      </li>
    </ul>
  </template>
</template>

<style scoped>
.preview {
  height: 10vh;
}

ul {
  margin: 0;
  padding: 0;
  display: flex;
  list-style: none;
  gap: 2vh;
}
</style>
