<script setup lang="ts">
import SiteFooter from "./SiteFooter.vue";
import { computed } from "vue";
import type { Screen } from "../screens";
const props = defineProps<{ screen: Screen; url: string }>();
const escapeAttribute = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
const preview = computed(() =>
  props.screen.frame(
    props.url
      ? `<iframe src="${escapeAttribute(props.url)}" title="${escapeAttribute(`Aperçu de ${props.screen.name}`)}" style="aspect-ratio:${props.screen.aspectRatio}"></iframe>`
      : props.screen.svgPreview,
  ),
);
</script>

<template>
  <section class="preview-section" aria-labelledby="preview-heading">
    <div class="section-heading">
      <div>
        <div class="title-row">
          <span v-if="screen.beta" class="beta-label">bêta</span>
          <h1 id="preview-heading">{{ screen.name }}</h1>
        </div>
        <p v-if="screen.commercialName" class="screen-meta">
          {{ screen.commercialName }}
        </p>
      </div>
    </div>
    <div class="preview-stage">
      <div
        class="screen-frame"
        :role="url ? undefined : 'img'"
        :aria-label="url ? undefined : `Aperçu de ${screen.name}`"
        v-html="preview"
      ></div>
    </div>
    <dl class="screen-specs">
      <div>
        <dt>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="9" r="3" />
            <path d="M6.5 19c.5-3 2.4-4.5 5.5-4.5s5 1.5 5.5 4.5" />
          </svg>
          <span class="visually-hidden">Auteur</span>
        </dt>
        <dd>{{ screen.author }}</dd>
      </div>
    </dl>
    <SiteFooter />
  </section>
</template>
