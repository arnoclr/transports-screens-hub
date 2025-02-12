<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Selector from "./components/Selector.vue";
import { screens, type Screen, type StopAndMaybeRoute } from "./screens";

const selectedScreen = ref<Screen | null>(null);

const selectedScreenParams = ref<Map<number, StopAndMaybeRoute>>(new Map());

const url = computed<string>(() => {
  const valuesOrdered = Array.from(selectedScreenParams.value.entries())
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);
  return selectedScreen.value?.url(valuesOrdered) ?? "";
});

const allParamsSelected = computed<boolean>(
  () => url.value.length > 0 && url.value.includes("undefined") === false
);

const sendScreenEvent = () => {
  const params:StopAndMaybeRoute[] = Array.from(selectedScreenParams.value.values())
  const linesNames = params.map((v: StopAndMaybeRoute) => v.route?.number ?? "Aucune lignes");
  const stopsNames = params.map((v: StopAndMaybeRoute) => v.stop.name);
  // @ts-ignore
  dataLayer.push({'event': 'screen_opened', 'screen': selectedScreen.value.name, 'url': url.value, 'lines': linesNames, 'stops': stopsNames});
};

watch(
  () => selectedScreen.value,
  () => {
    selectedScreenParams.value = new Map();
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
        :selector-type="selector.selection"
        :stop-route="selectedScreenParams.get(i)"
        @update:stop-route="($event) => selectedScreenParams.set(i, $event)"
      ></Selector>
    </template>
  </article>
  <section>
    <p>
      <a
        @click="sendScreenEvent"
        role="button"
        id="open-screen"
        >Ouvrir dans cet onglet</a
      >
    </p>
    <p v-if="allParamsSelected">
      <code>{{ url }}</code>
    </p>
  </section>
</template>

<style scoped>
.preview :deep(svg) {
  height: 12vh;
  width: auto;
  border-radius: 0.8vh;
}

.screens label {
  position: relative;
  display: inline-block;
  margin-right: 1vh;
}

.screens input[type="radio"] {
  position: absolute;
  left: 1vh;
  bottom: 1vh;
}

article {
  padding: 5vh 0;
  box-shadow: -50vw 0 0 var(--pico-card-background-color),
    50vw 0 0 var(--pico-card-background-color),
    0 0 0 9999px var(--pico-secondary-focus);
}
</style>
