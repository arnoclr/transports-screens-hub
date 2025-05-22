<script lang="ts" setup>
import { watchDebounced } from "@vueuse/core";
import { ref, watch } from "vue";
import { Wagon, type SimpleLine, type SimpleStop } from "../services/Wagon";
import type { SelectorType, StopAndMaybeRoutes } from "../screens";

defineProps<{
  label: string;
  hint?: string;
  selectorType: SelectorType;
  stopRoute: StopAndMaybeRoutes | undefined;
}>();

const emit = defineEmits<{
  (e: "update:stopRoutes", value: StopAndMaybeRoutes): void;
}>();

const searchTerms = ref<string>("");
const stops = ref<SimpleStop[]>([]);
const stopModel = ref("");
const stopRouteModel = ref("");
const routesModel = ref<string[]>([]);
const uuid = crypto.randomUUID();
const isLoading = ref(false);

watchDebounced(
  searchTerms,
  async (value) => {
    isLoading.value = true;
    stops.value = await Wagon.searchStops(value);
    isLoading.value = false;
  },
  { debounce: 400 }
);

function getStop(id: string): SimpleStop {
  return stops.value.find((stop) => stop.id === id) as SimpleStop;
}

function getRoute(id: string, stop: SimpleStop): SimpleLine {
  return stop.lines.find((line) => line.id === id) as SimpleLine;
}

function lineModeSvgs(stop: SimpleStop): Set<string> {
  return new Set(
    stop.lines.map((line) => line.pictoSvg).filter((x) => x !== undefined)
  );
}

function linesByMode(lines: SimpleLine[]): {
  picto: string;
  lines: SimpleLine[];
}[] {
  const modes = new Map<string, SimpleLine[]>();

  for (const line of lines) {
    const mode = line.pictoSvg;
    if (mode === undefined) {
      continue;
    }
    if (!modes.has(mode)) {
      modes.set(mode, []);
    }
    modes.get(mode)?.push(line);
  }

  return Array.from(modes.entries())
    .sort(
      (a, b) => (a[1].at(0)?.importance ?? 0) - (b[1].at(0)?.importance ?? 0)
    )
    .map(([picto, lines]) => ({
      picto,
      lines,
    }));
}

watch(
  () => stopModel.value,
  (value) => {
    const stop = getStop(value);
    emit("update:stopRoutes", { stop, routes: [] });
  }
);

watch(
  () => stopRouteModel.value,
  (value) => {
    const [stopId, routeId] = value.split(" ");
    const stop = getStop(stopId);
    const route = getRoute(routeId, stop);
    emit("update:stopRoutes", { stop, routes: [route] });
  }
);

watch(
  () => routesModel.value,
  (value) => {
    const [stopId] = value.at(0)?.split(" ") || [];
    const stop = getStop(stopId);
    const routes = value.map((stopIdRouteId: string) => {
      const [_, routeId] = stopIdRouteId.split(" ");
      return getRoute(routeId, stop);
    });
    emit("update:stopRoutes", { stop, routes });
  }
);
</script>

<template>
  <label>
    <span :aria-busy="isLoading">{{ label }}</span>
    <input type="text" v-model="searchTerms" spellcheck="false" />
    <small v-if="hint"><br />{{ hint }}</small>
  </label>
  <ul>
    <li v-for="stop in stops">
      <label>
        <input
          v-if="selectorType === 'STOP'"
          type="radio"
          :name="uuid"
          v-model="stopModel"
          :value="stop.id"
        />
        <span>{{ stop.name }}</span>
        <div
          v-if="selectorType === 'STOP'"
          class="modePicto"
          v-for="mode in lineModeSvgs(stop)"
          v-html="mode"
        ></div>
      </label>
      <div
        v-if="
          selectorType === 'STOP_AND_ROUTE' ||
          selectorType === 'STOP_AND_ROUTES'
        "
      >
        <ul>
          <li v-for="mode in linesByMode(stop.lines)" :key="mode.picto">
            <div class="modePictoRow" v-html="mode.picto"></div>
            <label class="picto" v-for="line in mode.lines" :key="line.id">
              <div class="lineShape" v-html="line.numberShapeSvg"></div>
              <input
                v-if="selectorType === 'STOP_AND_ROUTE'"
                type="radio"
                :name="uuid"
                :value="stop.id + ' ' + line.id"
                v-model="stopRouteModel"
              />
              <input
                v-if="selectorType === 'STOP_AND_ROUTES'"
                type="checkbox"
                :name="uuid"
                :value="stop.id + ' ' + line.id"
                v-model="routesModel"
              />
            </label>
          </li>
        </ul>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.lineShape {
  height: 4vh;
}

.modePicto {
  display: inline-block;
  height: 2.6vh;
  margin-left: 0.6vh;
}

.modePictoRow {
  display: inline-block;
  height: 4vh;
  margin-right: 0.6vh;
}

.picto {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1vh;
  gap: 0.5vh;
}

input[type="radio"] {
  margin-top: 0;
  margin-inline-end: 0;
}
</style>
