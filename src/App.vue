<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Selector from "./components/Selector.vue";
import Donate from "./components/Donate.vue";
import { screens, type Screen, type StopAndMaybeRoutes } from "./screens";
import JoinDiscord from "./components/JoinDiscord.vue";

const selectedScreen = ref<Screen | null>(null);

const selectedScreenParams = ref<Map<number, StopAndMaybeRoutes>>(new Map());

const url = computed<string>(() => {
  const valuesOrdered = Array.from(selectedScreenParams.value.entries())
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);
  return selectedScreen.value?.url(valuesOrdered, []) ?? "";
});

const allParamsSelected = computed<boolean>(
  () => url.value.length > 0 && url.value.includes("undefined") === false
);

const sendScreenEvent = () => {
  const params: StopAndMaybeRoutes[] = Array.from(
    selectedScreenParams.value.values()
  );
  const linesNames = params.map(
    (v: StopAndMaybeRoutes) => v.routes.at(0)?.number ?? "Aucune lignes"
  );
  const stopsNames = params.map((v: StopAndMaybeRoutes) => v.stop.name);
  // @ts-ignore
  dataLayer.push({
    event: "screen_opened",
    screen: selectedScreen.value?.name,
    url: url.value,
    lines: linesNames,
    stops: stopsNames,
  });
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
      <div
        class="preview"
        :class="{ beta: screen.beta }"
        v-html="screen.svgPreview"
      ></div>
      <input
        type="radio"
        name="screen"
        :value="screen"
        v-model="selectedScreen"
      />
      <span v-if="screen.beta" class="beta">Beta</span>
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
        :hint="selector.hint"
        :selector-type="selector.selection"
        :stop-route="selectedScreenParams.get(i)"
        @update:stop-routes="($event) => selectedScreenParams.set(i, $event)"
      ></Selector>
    </template>
  </article>
  <section>
    <p>
      <a
        :disabled="allParamsSelected ? undefined : true"
        :href="url"
        @click="sendScreenEvent"
        role="button"
        id="open-screen"
        >Ouvrir dans cet onglet</a
      >
    </p>
    <p v-if="allParamsSelected">
      <code>{{ url }}</code>
    </p>
    <div class="links">
      <JoinDiscord />
      <Donate />
    </div>
  </section>
</template>

<style scoped>
.preview :deep(svg) {
  height: 12vh;
  width: auto;
  border-radius: 0.8vh;
}

.preview.beta :deep(svg) {
  filter: grayscale(100%);
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

.screens span.beta {
  position: absolute;
  top: 1vh;
  right: 1vh;
  background-color: darkslategray;
  color: white;
  padding: 0.2vh 0.5vh;
  border-radius: 0.5vh;
}

article {
  margin: calc(32px + var(--pico-block-spacing-vertical)) 0;
  border-radius: 0px;
  padding: 0;
  box-shadow: 0 0 0 32px var(--pico-card-background-color);
}

.links {
  display: flex;
  margin: 5rem 0;
  gap: 5rem;
}
</style>
