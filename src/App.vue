<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ScreenGallery from "./components/ScreenGallery.vue";
import ScreenPreview from "./components/ScreenPreview.vue";
import ScreenSettings from "./components/ScreenSettings.vue";
import JoinDiscord from "./components/JoinDiscord.vue";
import Donate from "./components/Donate.vue";
import { screens, type ScreenOption } from "./screens";

const selectedId = ref(Object.keys(screens)[0]);
const selectedScreen = computed(() => screens[selectedId.value]);
const params = ref<ScreenOption[]>([]);

watch(
  selectedScreen,
  (screen) => {
    params.value = screen.selectors.map((selector) => ({
      stop: undefined,
      routes: undefined,
      value:
        selector.selection === "SELECT"
          ? selector.options[0]?.value
          : undefined,
    }));
  },
  { immediate: true },
);

const allParamsSelected = computed(() =>
  selectedScreen.value.selectors.every((selector, i) => {
    const param = params.value[i];
    if (selector.selection === "SELECT") return param?.value !== undefined;
    if (!param?.stop) return false;
    return selector.selection === "STOP" || (param.routes?.length ?? 0) > 0;
  }),
);
const url = computed(() =>
  allParamsSelected.value ? selectedScreen.value.url(params.value) : "",
);

function openScreen() {
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  dataLayer?.push({
    event: "screen_opened",
    screen: selectedScreen.value.name,
    url: url.value,
    lines: params.value.map(
      (param) => param.routes?.[0]?.number ?? "Aucune ligne",
    ),
    stops: params.value.map((param) => param.stop?.name),
  });
}
</script>

<template>
  <header class="support-header" aria-label="Soutien et communauté">
    <div><span>Nous soutenir :</span> <Donate /></div>
    <div><span>Discuter avec nous :</span> <JoinDiscord /></div>
  </header>
  <ScreenGallery
    :screens="screens"
    :selected-id="selectedId"
    @select="selectedId = $event"
  />

  <main class="workspace">
    <ScreenPreview :screen="selectedScreen" :url="url" />
    <ScreenSettings
      :key="selectedId"
      :screen="selectedScreen"
      :params="params"
      :url="url"
      @update-param="(index, value) => (params[index] = value)"
      @open="openScreen"
    />
  </main>
</template>
