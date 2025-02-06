<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { screens, type Screen } from "./screens";
import Selector from "./components/Selector.vue";

const selectedScreen = ref<Screen | null>(null);

const selectedScreenParams = ref<Record<string, string>>({});

const urlParams = computed<URLSearchParams>(() => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(selectedScreenParams.value)) {
    params.set(key, value);
  }
  return params;
});

const url = computed<string>(() => {
  return selectedScreen.value?.url(urlParams.value) ?? "";
});

const allParamsSelected = computed<boolean>(() => {
  return (
    selectedScreen.value?.selectors.reduce(
      (total, selector) =>
        total + (selector.params.routeValue === undefined ? 1 : 2),
      0
    ) === Object.keys(selectedScreenParams.value).length
  );
});

watch(
  () => selectedScreen.value,
  () => {
    selectedScreenParams.value = {};
  }
);
</script>

<template>
  <section class="screens">
    <hgroup>
      <p>{{ Object.values(screens).length }} écrans disponibles</p>
    </hgroup>
    <label v-for="[id, screen] in Object.entries(screens)" :key="id">
      <div class="preview" v-html="screen.svgPreview"></div>
      <input
        type="radio"
        name="screen"
        :value="screen"
        v-model="selectedScreen"
      />
    </label>
  </section>
  <article>
    <hgroup>
      <template v-if="selectedScreen">
        <h1>{{ selectedScreen.name }}</h1>
        <p>{{ selectedScreen.commercialName }}</p>
      </template>
      <h1 v-else>—</h1>
    </hgroup>
    <template
      v-if="selectedScreen"
      v-for="(selector, i) in selectedScreen.selectors"
      :id="i + selectedScreen.name"
    >
      <hr v-if="i > 0" />
      <Selector
        :label="selector.label"
        :params="selector.params"
        v-model="selectedScreenParams"
      ></Selector>
    </template>
  </article>
  <section v-if="Object.entries(selectedScreenParams).length > 0">
    <p>
      <a :disabled="!allParamsSelected" role="button" :href="url"
        >Ouvrir dans cet onglet</a
      >
    </p>
    <p>
      <code>{{ url }}</code>
    </p>
  </section>
</template>

<style scoped>
.preview :deep(svg) {
  height: 10vh;
  width: auto;
}

.screens label {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5vh;
  margin-right: 1vh;
}

.screens input[type="radio"] {
  margin-top: 0;
  margin-inline-end: 0;
}

article {
  padding: 5vh 0;
  box-shadow: -50vw 0 0 var(--pico-card-background-color),
    50vw 0 0 var(--pico-card-background-color),
    0 0 0 9999px var(--pico-secondary-focus);
}
</style>
