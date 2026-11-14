<script setup lang="ts">
import Selector from "./Selector.vue";
import type { Screen, ScreenOption } from "../screens";
defineProps<{ screen: Screen; params: ScreenOption[]; url: string }>();
defineEmits<{
  (e: "update-param", index: number, value: ScreenOption): void;
  (e: "open"): void;
}>();
</script>

<template>
  <section class="settings" aria-labelledby="settings-heading">
    <h2 id="settings-heading" class="visually-hidden">Configurer l’écran</h2>
    <svg
      class="settings-illustration"
      aria-hidden="true"
      viewBox="0 0 342 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M176.5 76L188.557 62.1568C189.121 61.5097 188.661 60.5 187.803 60.5H181.5C173 60.5 169.4 63.7001 165 68.5C159.958 74 161 86.5 163 90.5C164.6 93.7 170.667 96.1667 173.5 97L181.5 89C175 84 174.5 79 176.5 76Z"
        fill="#dedede"
        stroke="#dedede"
      />
      <path
        d="M193.164 90.8822L205.827 77.5908C206.418 76.9696 207.466 77.3333 207.546 78.1877L208.132 84.4633C208.922 92.9268 206.07 96.8083 201.7 101.635C196.692 107.167 184.15 107.291 179.981 105.671C176.646 104.376 173.626 98.5645 172.533 95.8208L179.5 87.5C185.5 92.5 190.363 93.1523 193.164 90.8822Z"
        fill="#dedede"
        stroke="#dedede"
      />
      <path d="M80 204.5L176 93" stroke="#dedede" stroke-width="23" />
      <circle cx="70.5" cy="215.5" r="24" fill="#dedede" stroke="#dedede" />
      <path
        d="M177.547 179.646L213.299 193.419L172.077 300.43C171.997 300.432 171.903 300.434 171.796 300.436C171.4 300.445 170.826 300.453 170.111 300.452C168.681 300.45 166.693 300.411 164.46 300.264C159.976 299.97 154.57 299.243 150.701 297.542C147.459 296.116 143.815 293.354 140.959 290.92C139.536 289.708 138.319 288.586 137.458 287.767C137.028 287.358 136.686 287.025 136.453 286.794C136.405 286.746 136.361 286.703 136.322 286.664L177.547 179.646Z"
        fill="#dedede"
        stroke="#dedede"
      />
      <path
        d="M190.65 187.041L230.965 84.6833L230.998 84.5997L231 84.5098L230.5 84.5001L231 84.5098L231 84.5097L231 84.509L231 84.5059L231 84.493L231.001 84.4417C231.002 84.3963 231.004 84.3288 231.007 84.2415C231.012 84.0668 231.02 83.8124 231.032 83.495C231.057 82.8601 231.099 81.9739 231.169 80.969C231.309 78.9518 231.557 76.4844 231.987 74.612C232.796 71.088 234.885 66.9141 236.795 63.5936C237.747 61.9396 238.647 60.5088 239.309 59.4918C239.64 58.9834 239.912 58.5787 240.1 58.3015C240.125 58.2645 240.149 58.2298 240.171 58.1974L248.786 61.5164C248.783 61.5515 248.78 61.5888 248.776 61.6285C248.749 61.9408 248.706 62.3948 248.645 62.9593C248.523 64.0888 248.329 65.6595 248.042 67.4234C247.466 70.9649 246.521 75.2335 245.049 78.2827C244.094 80.2626 242.492 82.6066 241.115 84.4711C240.429 85.3998 239.803 86.2029 239.349 86.7738C239.122 87.0591 238.939 87.2863 238.812 87.4418C238.748 87.5195 238.699 87.5793 238.666 87.6196L238.628 87.665L238.619 87.6764L238.617 87.6791L238.616 87.6797L238.616 87.6799L239 88.0001L238.616 87.6799L238.563 87.7432L238.533 87.8202L199.045 190.275L190.65 187.041Z"
        fill="#dedede"
        stroke="#dedede"
      />
      <path
        d="M334 170C334 259.726 261.043 332.5 171 332.5C80.9568 332.5 8 259.726 8 170C8 80.2745 80.9568 7.5 171 7.5C261.043 7.5 334 80.2745 334 170Z"
        stroke="#dedede"
        stroke-width="15"
      />
      <path d="M166.5 287L192.5 221.5" stroke="#202022" stroke-width="6" />
      <path d="M149 280L175.5 215" stroke="#202022" stroke-width="6" />
      <path d="M170 196.5L177.5 199.5" stroke="#202022" stroke-width="6" />
      <path d="M200 208L207.5 211" stroke="#202022" stroke-width="6" />
      <path d="M99 182.5L157 115.5" stroke="#202022" stroke-width="5" />
      <path
        d="M70.5 200L79.6107 202.96L85.2414 210.71V220.29L79.6107 228.04L70.5 231L61.3893 228.04L55.7586 220.29V210.71L61.3893 202.96L70.5 200Z"
        fill="#202022"
      />
    </svg>
    <div v-for="(selector, i) in screen.selectors" :key="i" class="setting">
      <fieldset v-if="selector.selection === 'SELECT'">
        <legend>{{ selector.label }}</legend>
        <p v-if="selector.hint" class="hint">{{ selector.hint }}</p>
        <label
          v-for="option in selector.options"
          :key="option.value"
          class="option"
        >
          <input
            type="radio"
            :name="`setting-${i}`"
            :checked="params[i]?.value === option.value"
            @change="
              $emit('update-param', i, {
                stop: undefined,
                routes: undefined,
                value: option.value,
              })
            "
          />
          {{ option.label }}
        </label>
      </fieldset>
      <Selector
        v-else
        :label="selector.label"
        :hint="selector.hint"
        :authorized-agencies="selector.authorizedAgencies"
        :selector-type="selector.selection"
        :stop-route="params[i]"
        @update:stop-routes="$emit('update-param', i, $event)"
      />
    </div>
    <p class="wagon-credit">
      Recherche fournie par
      <a href="https://getwagon.fr/?utm_source=prochainstrains">Wagon</a>.
    </p>
    <p v-if="url" class="screen-url">
      Lien direct : <a :href="url" @click="$emit('open')">{{ url }}</a>
    </p>
  </section>
</template>
