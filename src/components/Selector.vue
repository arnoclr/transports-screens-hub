<script lang="ts" setup>
import { watchDebounced } from "@vueuse/core";
import { ref, watch } from "vue";
import { Wagon, type SimpleLine, type SimpleStop } from "../services/Wagon";
import type { SelectorType, StopAndMaybeRoute } from "../screens";

defineProps<{
  label: string;
  selectorType: SelectorType;
  stopRoute: StopAndMaybeRoute | undefined;
}>();

const emit = defineEmits<{
  (e: "update:stopRoute", value: StopAndMaybeRoute): void;
}>();

const searchTerms = ref<string>("");
const stops = ref<SimpleStop[]>([]);
const selectedStopId = ref("");
const selectedRouteStopId = ref("");
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

watch(
  () => selectedStopId.value,
  (value) => {
    const stop = getStop(value);
    emit("update:stopRoute", { stop, route: undefined });
  }
);

watch(
  () => selectedRouteStopId.value,
  (value) => {
    const [lineId, stopId] = value.split(" ");
    const stop = getStop(stopId);
    const route = getRoute(lineId, stop);
    emit("update:stopRoute", { stop, route });
  }
);
</script>

<template>
  <label>
    <span :aria-busy="isLoading">{{ label }}</span>
    <input type="text" v-model="searchTerms" spellcheck="false" />
  </label>
  <ul>
    <li v-for="stop in stops">
      <label>
        <input
          v-if="selectorType === 'STOP'"
          type="radio"
          :name="uuid"
          v-model="selectedStopId"
          :value="stop.id"
        />
        <span>{{ stop.name }}</span>
        <div
          class="modePicto"
          v-for="mode in lineModeSvgs(stop)"
          v-html="mode"
        ></div>
      </label>
      <div v-if="selectorType === 'STOP_AND_ROUTE'">
        <label class="picto" v-for="line in stop.lines">
          <div class="lineShape" v-html="line.numberShapeSvg"></div>
          <input
            type="radio"
            :name="uuid"
            :value="line.id + ' ' + stop.id"
            v-model="selectedRouteStopId"
          />
        </label>
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
