<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import type { ScreenParams } from "../screens";
import { watchDebounced } from "@vueuse/core";
import { Wagon, type SimpleLine, type SimpleStop } from "../services/Wagon";

const props = defineProps<{
  params: ScreenParams;
  modelValue: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, string>): void;
}>();

const searchTerms = ref<string>("");
const stops = ref<SimpleStop[]>([]);
const selectedStopId = ref("");
const selectedRouteStopId = ref("");
const uuid = crypto.randomUUID();

watchDebounced(
  searchTerms,
  async (value) => {
    stops.value = await Wagon.searchStops(value);
  },
  { debounce: 400 }
);

function getStop(id: string): SimpleStop {
  return stops.value.find((stop) => stop.id === id) as SimpleStop;
}

function getRoute(id: string, stop: SimpleStop): SimpleLine {
  return stop.lines.find((line) => line.id === id) as SimpleLine;
}

watch(
  () => selectedStopId.value,
  (value) => {
    const stop = getStop(value);
    const param = props.params.stopValue(stop);
    emit("update:modelValue", {
      ...props.modelValue,
      [param.name]: param.value,
    });
  }
);

watch(
  () => selectedRouteStopId.value,
  (value) => {
    const [lineId, stopId] = value.split(" ");
    const stop = getStop(stopId);
    const line = getRoute(lineId, stop);
    const lineParam = props.params.routeValue!(line);
    const stopParam = props.params.stopValue(stop);
    emit("update:modelValue", {
      ...props.modelValue,
      [lineParam.name]: lineParam.value,
      [stopParam.name]: stopParam.value,
    });
  }
);
</script>

<template>
  <input type="text" v-model="searchTerms" />
  <ul>
    <li v-for="stop in stops">
      <label for="">
        <input
          v-if="params.routeValue === undefined"
          type="radio"
          :name="uuid"
          v-model="selectedStopId"
          :value="stop.id"
        />
        <span>{{ stop.name }}</span>
      </label>
      <ul v-if="params.routeValue !== undefined">
        <li v-for="line in stop.lines">
          <label for="">
            <input
              type="radio"
              :name="uuid"
              :value="line.id + ' ' + stop.id"
              v-model="selectedRouteStopId"
            />
            <div class="lineShape" v-html="line.numberShapeSvg"></div>
          </label>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style scoped>
.lineShape {
  height: 2vh;
}
</style>
