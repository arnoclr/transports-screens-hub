<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Selector from "./components/Selector.vue";
import Donate from "./components/Donate.vue";
import { screens, type Screen, type ScreenOption } from "./screens";
import JoinDiscord from "./components/JoinDiscord.vue";

const selectedScreen = ref<Screen | null>(null);

const selectedScreenParams = ref<Map<number, ScreenOption>>(new Map());

const url = computed<string>(() => {
  const valuesOrdered = Array.from(selectedScreenParams.value.entries())
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);
  console.log(valuesOrdered);
  return selectedScreen.value?.url(valuesOrdered) ?? "";
});

const allParamsSelected = computed<boolean>(
  () => url.value.length > 0 && url.value.includes("undefined") === false,
);

const sendScreenEvent = () => {
  const params: ScreenOption[] = Array.from(
    selectedScreenParams.value.values(),
  );
  const linesNames = params.map(
    (v: ScreenOption) => v.routes?.at(0)?.number ?? "Aucune lignes",
  );
  const stopsNames = params.map((v: ScreenOption) => v.stop?.name);
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
  (screen) => {
    const selectors = screen?.selectors || [];
    selectedScreenParams.value = new Map(
      [...Array(selectors.length).keys()].map((i) => [
        i,
        {
          stop: undefined,
          routes: undefined,
          value:
            selectors[i]?.selection === "SELECT"
              ? selectors[i].options.at(0)?.value
              : undefined,
        },
      ]),
    );
  },
);
</script>

<template>
  <section>
    <hgroup>
      <p>
        <span style="opacity: 0.6">prochainstrains.arno.cl&nbsp;&nbsp;</span
        ><strong>&gt;</strong>&nbsp;
        <a href="#" @click="selectedScreen = null">
          {{ Object.values(screens).length }} écrans disponibles
        </a>
        <template v-if="selectedScreen">
          &nbsp;&gt;&nbsp; {{ selectedScreen.name }}
        </template>
      </p>
    </hgroup>
  </section>
  <section class="screens-box" v-if="!selectedScreen">
    <div class="screens">
      <button
        v-for="[id, screen] in Object.entries(screens)"
        :key="id"
        :class="{ selected: selectedScreen === screen }"
        @click="selectedScreen = screen"
      >
        <div
          class="preview"
          :class="{ beta: screen.beta }"
          v-html="screen.svgPreview"
        ></div>
        <span v-if="screen.beta" class="beta">Beta</span>
      </button>
    </div>
  </section>
  <article v-if="selectedScreen">
    <hgroup>
      <h1>{{ selectedScreen.name }}</h1>
      <p>{{ selectedScreen.commercialName }}</p>
    </hgroup>
    <template
      v-if="selectedScreen"
      v-for="(selector, i) in selectedScreen.selectors"
      :id="i + selectedScreen.name"
    >
      <hr v-if="i > 0" />
      <label v-if="selector.selection === 'SELECT'">
        {{ selector.label }}
        <select
          @change="
            ($event) =>
              selectedScreenParams.set(i, {
                stop: undefined,
                routes: undefined,
                value: ($event.target as HTMLSelectElement).value,
              })
          "
        >
          <option
            v-for="option in selector.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
      <Selector
        v-else
        :label="selector.label"
        :hint="selector.hint"
        :authorized-agencies="selector.authorizedAgencies"
        :selector-type="selector.selection"
        :stop-route="selectedScreenParams.get(i)"
        @update:stop-routes="($event) => selectedScreenParams.set(i, $event)"
      ></Selector>
    </template>
  </article>
  <section>
    <p v-if="selectedScreen">
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
    <div
      v-if="selectedScreen?.iframeRepresentation"
      v-html="selectedScreen.iframeRepresentation?.(url)"
      style="position: fixed; bottom: 4vh; right: 4vh; z-index: 999"
    ></div>
    <div class="links">
      <JoinDiscord />
      <Donate />
    </div>
  </section>
</template>

<style scoped>
.preview :deep(svg) {
  height: 18vh;
  width: auto;
  border-radius: 0vh;
}

.preview.beta :deep(svg) {
  filter: grayscale(100%);
}

.screens button {
  position: relative;
  display: inline-block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.screens-box {
  width: calc(100vw - var(--pico-block-spacing-horizontal));
  overflow-x: hidden;
}

@media (min-width: 576px) {
  .screens-box {
    --safe-area: calc(100vw - 510px);
    width: calc(100vw - var(--safe-area) / 2);
  }
}

@media (min-width: 768px) {
  .screens-box {
    --safe-area: calc(100vw - 700px);
  }
}

@media (min-width: 1024px) {
  .screens-box {
    --safe-area: calc(100vw - 950px);
  }
}

@media (min-width: 1280px) {
  .screens-box {
    --safe-area: calc(100vw - 1200px);
  }
}

.screens {
  width: 130%;
  display: flex;
  flex-wrap: wrap;
  gap: 1.4vh;
}

.screens button.selected {
  border-color: var(--pico-primary-color, #1095c1);
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
  flex-wrap: wrap;
  margin: 5rem 0;
  gap: 5rem;
}

.links > * {
  flex: 1;
  min-width: 250px;
}
</style>
