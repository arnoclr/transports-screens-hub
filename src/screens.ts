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

export type SelectorType = "STOP" | "STOP_AND_ROUTE" | "SELECT";

export type StopAndMaybeRoute = {
  stop: SimpleStop;
  route: SimpleLine | undefined;
};

export type SelectorBase = {
  label: string;
  hint?: string;
  selection: Exclude<SelectorType, "SELECT">;
};

export type SelectSelector = {
  label: string;
  hint?: string;
  selection: "SELECT";
  options: { label: string; value: string }[];
};

export type Selector = SelectorBase | SelectSelector;

export type Screen = {
  name: string;
  commercialName?: string;
  url: (
    selectedStations: StopAndMaybeRoute[],
    selectedValue: string[]
  ) => string;
  selectors: Selector[];
  svgPreview: string;
  beta?: true;
};

const LEON_GP_V2_SCREEN = {
  construct(
    type: string,
    name: string,
    svgPreview: string,
    commercialName?: string,
    beta?: true
  ): Screen {
    return {
      name,
      commercialName,
      svgPreview,
      beta,
      url: (params) => {
        return `https://departs.leon.gp/screen/${type}/stop/${
          params.at(0)?.stop.id
        }/line/${params.at(0)?.route?.id}/pos/${
          params.at(0)?.stop.position.lat
        },${params.at(0)?.stop.position.long}`;
      },
      selectors: [
        {
          label: "Station",
          selection: "STOP_AND_ROUTE",
        },
      ],
    };
  },
};

export const screens: Record<string, Screen> = {
  RATP_DEPARTURES_AND_DISRUPTIONS: LEON_GP_V2_SCREEN.construct(
    "ratp_gareTrafic",
    "Départs et Info trafic générale — RATP",
    RATP_DEPARTURES_AND_DISRUPTIONS_SVG,
    undefined,
    true
  ),
  RATP_GLOBAL_DISRUPTIONS: LEON_GP_V2_SCREEN.construct(
    "ratp_trafic",
    "Info trafic générale — RATP",
    RATP_GLOBAL_DISRUPTIONS_SVG,
    undefined,
    true
  ),
  PANAM_169: LEON_GP_V2_SCREEN.construct(
    "ratp_panam",
    "Prochains départs métro (type M14)",
    PANAM_169_SVG,
    "PANAM"
  ),
  BUS_RATP_BASIC: LEON_GP_V2_SCREEN.construct(
    "ratp_bus",
    "Prochains départs BUS — RATP",
    RATP_BUS_SVG
  ),
  RER_RATP_BOARD: LEON_GP_V2_SCREEN.construct(
    "ratp_rer",
    "Prochains départs RER — RATP",
    RER_RATP_BOARD_SVG
  ),
  RATP_MULTIMODAL: LEON_GP_V2_SCREEN.construct(
    "ratp_gare",
    "Prochains départs — RATP",
    RATP_MULTIMODE_SVG
  ),
  TRANSILIEN_BOARD: {
    name: "Prochains départs Transilien",
    commercialName: "IENA",
    url: (stops) =>
      `https://ecrans.leon.gp/sncf_transilien_new/${
        stops.at(0)?.stop.id
      }/default`,
    selectors: [
      {
        label: "Station",
        selection: "STOP",
      },
    ],
    svgPreview: TRANSILIEN_BOARD_SVG,
  },
  TRANSILIEN_DETAILED: {
    name: "Prochain départ Transilien",
    commercialName: "IENA",
    url: (stops) =>
      `https://ecrans.leon.gp/sncf_transilien_new_with_stops/${
        stops.at(0)?.stop.id
      }/default`,
    selectors: [
      {
        label: "Station",
        selection: "STOP",
      },
    ],
    svgPreview: TRANSILIEN_DETAILED_SVG,
  },
  PANAM: {
    name: "Prochains départs métro (type M5)",
    commercialName: "PANAM",
    url: (stops) =>
      `https://panam.arno.cl/?near=${stops.at(0)?.stop.position.lat},${
        stops.at(0)?.stop.position.long
      }&for=${stops.at(0)?.route?.number}&directionHint=${
        stops.at(1)?.stop.name
      }`,
    selectors: [
      {
        label: "Station de départ",
        selection: "STOP_AND_ROUTE",
      },
      {
        label: "Terminus",
        selection: "STOP",
      },
    ],
    svgPreview: PANAM_SVG,
  },
  SYSPAD: {
    name: "Prochain départ RER",
    commercialName: "Syspad",
    url: (stops) => {
      const url =
        "https://utilisez-wagon-pour-vos-deplacements-du-quotidien.syspad.arno.cl/";

      const isTerminus = stops.at(0)?.stop.id === stops.at(1)?.stop.id;
      const terminusPosition = stops.at(1)?.stop.position;

      const urlParams = new URLSearchParams();
      urlParams.append("from", stops.at(0)?.stop.id || "");
      urlParams.append("route", stops.at(0)?.route?.id || "");
      if (!isTerminus) {
        urlParams.append(
          "to",
          `${terminusPosition?.lat},${terminusPosition?.long}`
        );
      }
      urlParams.append("shortTrainMessage", "none");

      return url + "?" + urlParams.toString();
    },
    selectors: [
      {
        label: "Station de départ",
        selection: "STOP_AND_ROUTE",
      },
      {
        label: "Terminus",
        selection: "STOP",
        // TODO: propriétés optionnelles
        // hint: "Laisser vide pour afficher les départs dans toutes les directions",
        hint: "Choisir la même station pour afficher les départs dans toutes les directions",
      },
      // {
      //   label: "Gestion des trains courts",
      //   selection: "SELECT",
      //   options: [
      //     { label: "Ne rien afficher", value: "none" },
      //     { label: "Indiquer de se déplacer vers la droite", value: "right" },
      //     { label: "Indiquer de se déplacer vers la gauche", value: "left" },
      //   ],
      // },
    ],
    svgPreview: SYSPAD_SVG,
  },
};
