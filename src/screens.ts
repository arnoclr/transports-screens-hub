import { PANAM_SVG } from "./previews/PANAM.svg";
import { RATP_BUS_SVG } from "./previews/RATP_BUS.svg";
import { RATP_MULTIMODE_SVG } from "./previews/RATP_MULTIMODE.svg";
import { RER_RATP_BOARD_SVG } from "./previews/RER_RATP_BOARD.svg";
import { SYSPAD_SVG } from "./previews/SYSPAD.svg";
import { TRANSILIEN_BOARD_SVG } from "./previews/TRANSILIEN_BOARD.svg";
import { TRANSILIEN_DETAILED_SVG } from "./previews/TRANSILIEN_DETAILED.svg";
import type { SimpleLine, SimpleStop } from "./services/Wagon";

export type SelectorType = "STOP" | "STOP_AND_ROUTE";

export type StopAndMaybeRoute = {
  stop: SimpleStop;
  route: SimpleLine | undefined;
};

export type Selector = {
  label: string;
  selection: SelectorType;
};

export type Screen = {
  name: string;
  commercialName?: string;
  url: (selectedValues: StopAndMaybeRoute[]) => string;
  selectors: Selector[];
  svgPreview: string;
};

const LEON_GP_V2_SCREEN = {
  construct(
    type: string,
    name: string,
    svgPreview: string,
    commercialName?: string
  ): Screen {
    return {
      name,
      commercialName,
      svgPreview,
      url: (params) => {
        return `https://v2.ecrans.leon.gp/screen/${type}/stop/${
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
    name: "Prochains départs métro",
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
    url: () =>
      "https://utilisez-wagon-pour-vos-deplacements-du-quotidien.syspad.arno.cl/",
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
    svgPreview: SYSPAD_SVG,
  },
};
