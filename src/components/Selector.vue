<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import type { ScreenOption, SelectorBase, SelectorType } from "../screens";
import {
  Wagon,
  ForbiddenError,
  type SimpleLine,
  type SimpleStop,
} from "../services/Wagon";

const props = defineProps<{
  label: string;
  hint?: string;
  authorizedAgencies?: SelectorBase["authorizedAgencies"];
  selectorType: SelectorType;
  stopRoute: ScreenOption | undefined;
}>();
const emit = defineEmits<{
  (e: "update:stopRoutes", value: ScreenOption): void;
}>();
const searchTerms = ref("");
const stops = ref<SimpleStop[]>([]);
const isLoading = ref(false);
const error = ref<"forbidden" | "network" | null>(null);
const searched = ref(false);
const uuid = crypto.randomUUID();
let searchVersion = 0;

const visibleStops = computed(() =>
  stops.value.filter(
    (stop) =>
      props.authorizedAgencies === "all" ||
      props.authorizedAgencies?.includes(stop.id.split("_")[0]),
  ),
);

watch(searchTerms, () => {
  searchVersion++;
  stops.value = [];
  searched.value = false;
  error.value = null;
  isLoading.value = false;
  emit("update:stopRoutes", {
    stop: undefined,
    routes: undefined,
    value: undefined,
  });
});
watchDebounced(
  searchTerms,
  async (value) => {
    const version = searchVersion;
    if (!value.trim()) return;
    isLoading.value = true;
    try {
      const results = await Wagon.searchStops(value.trim());
      if (version === searchVersion) stops.value = results;
    } catch (e) {
      if (version === searchVersion)
        error.value = e instanceof ForbiddenError ? "forbidden" : "network";
    } finally {
      if (version === searchVersion) {
        isLoading.value = false;
        searched.value = true;
      }
    }
  },
  { debounce: 400 },
);

function selectStop(stop: SimpleStop) {
  emit("update:stopRoutes", { stop, routes: [], value: undefined });
}
function selectLine(stop: SimpleStop, line: SimpleLine, checked: boolean) {
  if (props.selectorType === "STOP_AND_ROUTE") {
    emit("update:stopRoutes", { stop, routes: [line], value: undefined });
    return;
  }
  const current =
    props.stopRoute?.stop?.id === stop.id ? (props.stopRoute.routes ?? []) : [];
  const routes = checked
    ? [...current, line]
    : current.filter((item) => item.id !== line.id);
  emit("update:stopRoutes", {
    stop: routes.length ? stop : undefined,
    routes,
    value: undefined,
  });
}
function linesByMode(lines: SimpleLine[]) {
  const modes = new Map<string, SimpleLine[]>();
  for (const line of [...lines].sort((a, b) =>
    a.number.padStart(10, "0").localeCompare(b.number.padStart(10, "0")),
  )) {
    const mode = line.pictoSvg || "";
    modes.set(mode, [...(modes.get(mode) ?? []), line]);
  }
  return Array.from(modes.entries()).sort(
    (a, b) => (a[1][0]?.importance ?? 0) - (b[1][0]?.importance ?? 0),
  );
}
</script>

<template>
  <div class="station-search">
    <label :for="uuid" class="field-label">{{ label }}</label>
    <p v-if="hint" class="hint">{{ hint }}</p>
    <input
      :id="uuid"
      v-model="searchTerms"
      type="search"
      placeholder="Rechercher une station ou un arrêt"
      autocomplete="off"
      spellcheck="false"
    />
    <p v-if="isLoading" class="search-status" role="status">
      Recherche en cours…
    </p>
    <p v-else-if="error === 'forbidden'" class="search-error" role="alert">
      La recherche n’est accessible que depuis certains pays, dont la France et
      le Canada. Consultez <a href="https://getwagon.fr/">getwagon.fr</a> pour
      connaître les villes prises en charge.
    </p>
    <p v-else-if="error === 'network'" class="search-error" role="alert">
      La recherche est momentanément indisponible. Veuillez réessayer.
    </p>
    <p v-else-if="searched && !visibleStops.length" class="search-status">
      Aucun arrêt trouvé.
    </p>
    <ul
      v-if="visibleStops.length"
      class="search-results"
      :aria-label="`Résultats pour ${label}`"
    >
      <li v-for="stop in visibleStops" :key="stop.id" class="stop-result">
        <label v-if="selectorType === 'STOP'" class="stop-label">
          <input
            type="radio"
            :name="uuid"
            :checked="stopRoute?.stop?.id === stop.id"
            @change="selectStop(stop)"
          />
          {{ stop.name }}
        </label>
        <template v-else>
          <p class="stop-name">{{ stop.name }}</p>
          <div
            v-for="[picto, lines] in linesByMode(stop.lines)"
            :key="picto"
            class="line-row"
          >
            <span
              v-if="picto"
              class="mode-picto"
              aria-hidden="true"
              v-html="picto"
            ></span>
            <label v-for="line in lines" :key="line.id" class="line-option">
              <input
                :type="selectorType === 'STOP_AND_ROUTE' ? 'radio' : 'checkbox'"
                :name="uuid"
                :checked="
                  stopRoute?.stop?.id === stop.id &&
                  !!stopRoute?.routes?.some((item) => item.id === line.id)
                "
                @change="
                  selectLine(
                    stop,
                    line,
                    ($event.target as HTMLInputElement).checked,
                  )
                "
              />
              <span
                v-if="line.numberShapeSvg"
                class="line-shape"
                :aria-label="`Ligne ${line.number}`"
                v-html="line.numberShapeSvg"
              ></span>
              <span v-else>{{ line.number }}</span>
            </label>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>
