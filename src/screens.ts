import { IDFM_SIEL_TRAM_SVG } from "./previews/IDFM_SIEL_TRAM.svg";
import { PANAM_SVG } from "./previews/PANAM.svg";
import { PANAM_HORIZONTAL_SVG as PANAM_169_SVG } from "./previews/PANAM_HORIZONTAL.svg";
import { RATP_BUS_SVG } from "./previews/RATP_BUS.svg";
import { RATP_DEPARTURES_AND_DISRUPTIONS_SVG } from "./previews/RATP_DEPARTURES_AND_DISRUPTIONS.svg";
import { RATP_GLOBAL_DISRUPTIONS_SVG } from "./previews/RATP_GLOBAL_DISRUPTIONS.svg";
import { RATP_MULTIMODE_SVG } from "./previews/RATP_MULTIMODE.svg";
import { RER_RATP_BOARD_SVG } from "./previews/RER_RATP_BOARD.svg";
import { SYSPAD_SVG } from "./previews/SYSPAD.svg";
import { TRANSILIEN_BOARD_SVG } from "./previews/TRANSILIEN_BOARD.svg";
import { TRANSILIEN_DETAILED_SVG } from "./previews/TRANSILIEN_DETAILED.svg";
import type { SimpleLine, SimpleStop } from "./services/Wagon";

export type SelectorType =
  | "STOP"
  | "STOP_AND_ROUTE"
  | "STOP_AND_ROUTES"
  | "SELECT";

export type ScreenOption = {
  value: string | undefined;
  stop: SimpleStop | undefined;
  routes: SimpleLine[] | undefined;
};

export type SelectorBase = {
  label: string;
  hint?: string;
  authorizedAgencies: string[] | "all";
  selection: Exclude<SelectorType, "SELECT">;
};

export type SelectSelector = {
  label: string;
  hint?: string;
  selection: "SELECT";
  options: { label: string; value: string }[];
};

export type Selector = SelectorBase | SelectSelector;

// Le contenu peut être un aperçu SVG ou un écran en direct.
export type ScreenFrame = (content: string) => string;

export type Screen = {
  name: string;
  author: string;
  commercialName?: string;
  url: (options: ScreenOption[]) => string;
  selectors: Selector[];
  svgPreview: string;
  beta?: true;
  frame: ScreenFrame;
  aspectRatio: string;
};

const LEON_GP_V2_SCREEN = {
  defaultSelectors: [
    {
      label: "Station",
      selection: "STOP_AND_ROUTE",
      authorizedAgencies: ["fr-idf"],
    },
  ] satisfies Selector[],
  construct(
    type: string,
    name: string,
    svgPreview: string,
    commercialName?: string,
    beta?: true,
  ): Screen {
    return {
      name,
      author: "Léon",
      commercialName,
      svgPreview,
      beta,
      url: (params) => {
        return `https://departs.leon.gp/screen/?screenId=${type}&stopId=${
          params.at(0)?.stop?.id
        }&lineId=${params.at(0)?.routes?.at(0)?.id || "null"}`;
      },
      selectors: this.defaultSelectors,
      frame: (content) =>
        `<div style="box-sizing:border-box;height:100%;padding:calc(var(--frame-unit) * .5);border-radius:calc(var(--frame-unit) * 3);background:grey"><div style="box-sizing:border-box;height:100%;padding:calc(var(--frame-unit) * 5);border-radius:calc(var(--frame-unit) * 2.5);background:black">${content}</div></div>`,
      aspectRatio: "16 / 9",
    };
  },
};

const IENA = {
  buildUrl: (stops: ScreenOption[], rows: number) => {
    const direction = stops.at(1)?.value;
    const params = new URLSearchParams({
      aimedDepartureCount: rows.toString(),
      coordinates: `${stops.at(0)?.stop?.position.lat},${
        stops.at(0)?.stop?.position.long
      }`,
      stop: stops.at(0)?.stop?.id || "undefined",
      lines:
        stops
          .at(0)
          ?.routes?.map((r) => r.id)
          .join(",") || "undefined",
      platforms: [].join(","),
    });

    if (direction !== undefined && direction !== "") {
      params.set("direction", direction);
    }

    return "https://iena.arno.cl/?" + params.toString();
  },
  selectors: [
    {
      label: "Au départ de",
      selection: "STOP_AND_ROUTES",
      hint: "Sélectionnez toutes les lignes de train ainsi que leurs bus de substitution",
      authorizedAgencies: "all",
    },
    {
      selection: "SELECT",
      label: "Sens",
      options: [
        { label: "Aller/Retour", value: "" },
        { label: "Aller", value: "0" },
        { label: "Retour", value: "1" },
      ],
    },
  ] satisfies Selector[],
  frame: ((content) =>
    `<div style="box-sizing:border-box;height:100%;padding:calc(var(--frame-unit) * 7);background:#333"><div style="box-sizing:border-box;height:100%;padding:calc(var(--frame-unit) * .3);background:black">${content}</div></div>`) satisfies ScreenFrame,
};

export const screens: Record<string, Screen> = {
  RATP_DEPARTURES_AND_DISRUPTIONS: LEON_GP_V2_SCREEN.construct(
    "gare-trafic",
    "Départs et Info trafic générale — RATP",
    RATP_DEPARTURES_AND_DISRUPTIONS_SVG,
    undefined,
    true,
  ),
  RATP_GLOBAL_DISRUPTIONS: LEON_GP_V2_SCREEN.construct(
    "information-trafic",
    "Info trafic générale — RATP",
    RATP_GLOBAL_DISRUPTIONS_SVG,
    undefined,
  ),
  PANAM_169: LEON_GP_V2_SCREEN.construct(
    "metro",
    "Prochains départs métro (type M14)",
    PANAM_169_SVG,
    "PANAM",
  ),
  BUS_RATP_BASIC: LEON_GP_V2_SCREEN.construct(
    "bus",
    "Prochains départs BUS — RATP",
    RATP_BUS_SVG,
  ),
  RER_RATP_BOARD: LEON_GP_V2_SCREEN.construct(
    "rer",
    "Prochains départs RER — RATP",
    RER_RATP_BOARD_SVG,
  ),
  RATP_MULTIMODAL: LEON_GP_V2_SCREEN.construct(
    "gare",
    "Prochains départs — RATP",
    RATP_MULTIMODE_SVG,
  ),
  TRANSILIEN_BOARD: {
    name: "Prochains départs Transilien",
    author: "Arno",
    commercialName: "IENA",
    url: (stops) => IENA.buildUrl(stops, 5),
    selectors: IENA.selectors,
    svgPreview: TRANSILIEN_BOARD_SVG,
    beta: true,
    frame: IENA.frame,
    aspectRatio: "16 / 9",
  },
  TRANSILIEN_DETAILED: {
    name: "Prochain départ Transilien",
    author: "Arno",
    commercialName: "IENA",
    beta: true,
    url: (stops) => IENA.buildUrl(stops, 1),
    selectors: IENA.selectors,
    svgPreview: TRANSILIEN_DETAILED_SVG,
    frame: IENA.frame,
    aspectRatio: "16 / 9",
  },
  PANAM: {
    name: "Prochains départs métro (type M5)",
    author: "Arno",
    commercialName: "PANAM",
    url: (stops) =>
      `https://panam.arno.cl/?near=${stops.at(0)?.stop?.position.lat},${
        stops.at(0)?.stop?.position.long
      }&for=${stops.at(0)?.routes?.at(0)?.number}&directionHint=${
        stops.at(1)?.stop?.name
      }`,
    selectors: [
      {
        label: "Station de départ",
        selection: "STOP_AND_ROUTE",
        authorizedAgencies: ["fr-idf"],
      },
      {
        label: "Terminus",
        selection: "STOP",
        authorizedAgencies: ["fr-idf"],
      },
    ],
    svgPreview: PANAM_SVG,
    frame: (content) =>
      `<div style="box-sizing:border-box;height:100%;display:flex;flex-direction:column"><div style="height:calc(var(--frame-unit) * 8);flex:none;background:linear-gradient(to right,#eee,#fff)"></div><div style="box-sizing:border-box;flex:1;min-height:0;padding:calc(var(--frame-unit));background:black">${content}</div></div>`,
    aspectRatio: "1920 / 540",
  },
  IDFM_TRAM: {
    name: "Prochains départs Tram (type T1)",
    author: "Léon",
    commercialName: "SIEL TRAM",
    url([stopAndRoute, mode, isInvertedColumns]) {
      const stopId = stopAndRoute?.stop?.id.split(":").pop();
      const routeId = stopAndRoute?.routes?.at(0)?.id.split(":").pop();
      return `https://siel-tram.leon.gp/?stop=${stopId}&line=${routeId}&invertedColumns=${isInvertedColumns.value}&mode=${mode.value}`;
    },
    selectors: [
      ...LEON_GP_V2_SCREEN.defaultSelectors,
      {
        selection: "SELECT",
        label: "Mode d'affichage",
        options: [
          { label: "Automatique", value: "AUTO" },
          { label: "Destinations", value: "DESTINATIONS" },
        ],
      },
      {
        selection: "SELECT",
        label: "Affichage de l'information trafic",
        options: [
          { label: "À droite", value: "false" },
          { label: "À gauche", value: "true" },
        ],
      },
    ],
    svgPreview: IDFM_SIEL_TRAM_SVG,
    frame: (content) =>
      `<div style="box-sizing:border-box;height:100%;padding:calc(var(--frame-unit) * .5);border-radius:calc(var(--frame-unit) * 3);background:#ccc"><div style="box-sizing:border-box;height:100%;padding:calc(var(--frame-unit) * 5);border-radius:calc(var(--frame-unit) * 2.5);background:black">${content}</div></div>`,
    aspectRatio: "43 / 12",
  },
  SYSPAD: {
    name: "Prochain départ RER",
    author: "Arno",
    commercialName: "Syspad",
    url: ([origin, terminus, isShortTrainMessage]) => {
      const url =
        "https://utilisez-wagon-pour-vos-deplacements-du-quotidien.syspad.arno.cl/";

      const isTerminus = origin?.stop?.id === terminus?.stop?.id;
      const terminusPosition = terminus?.stop?.position;

      const urlParams = new URLSearchParams();
      urlParams.append("from", origin?.stop?.id || "");
      urlParams.append("route", origin?.routes?.at(0)?.id || "");
      if (!isTerminus) {
        urlParams.append(
          "to",
          `${terminusPosition?.lat},${terminusPosition?.long}`,
        );
      }
      urlParams.append(
        "shortTrainMessage",
        isShortTrainMessage?.value ?? "none",
      );

      return url + "?" + urlParams.toString();
    },
    selectors: [
      {
        label: "Station de départ",
        selection: "STOP_AND_ROUTE",
        authorizedAgencies: ["fr-idf", "cz-pid"],
      },
      {
        label: "Terminus",
        selection: "STOP",
        // TODO: propriétés optionnelles
        // hint: "Laisser vide pour afficher les départs dans toutes les directions",
        hint: "Choisir la même station pour afficher les départs dans toutes les directions",
        authorizedAgencies: ["fr-idf", "cz-pid"],
      },
      {
        label: "Gestion des trains courts",
        selection: "SELECT",
        options: [
          { label: "Ne rien afficher", value: "none" },
          { label: "Indiquer de se déplacer vers la droite", value: "right" },
          { label: "Indiquer de se déplacer vers la gauche", value: "left" },
        ],
      },
    ],
    svgPreview: SYSPAD_SVG,
    frame: (content) =>
      `<div style="box-sizing:border-box;height:100%;padding:calc(var(--frame-unit) * .5);border-radius:calc(var(--frame-unit) * 3);background:#ccc"><div style="box-sizing:border-box;height:100%;padding:calc(var(--frame-unit) * 3);border-radius:calc(var(--frame-unit) * 2.5);background:black">${content}</div></div>`,
    aspectRatio: "32 / 9",
  },
};
