export interface SimpleLine {
  id: string;
  number: string;
  backgroundColor: string;
  textColor: string;
  pictoSvg?: string;
  numberShapeSvg?: string;
  importance: number;
}

export interface SimpleStop {
  id: string;
  name: string;
  position: Position;
  lines: SimpleLine[];
}

export interface Position {
  lat: number;
  long: number;
}

function processSVG(svg: string): string {
  return svg
    .replace(/width="[^"]+"/, "")
    .replace(/height="[^"]+"/, `height="100%"`);
}

export class Wagon {
  private static BASE_URL = "https://api-wagon.arno.cl/gantry/";

  private static get baseUrl(): string {
    return Wagon.BASE_URL;
  }

  private static get apiKey(): string {
    return "ptra";
  }

  private static positionFromDTO(positionDto: any): Position {
    return {
      lat: positionDto[0],
      long: positionDto[1],
    };
  }

  private static stopFromDTO(stopDto: any, lines: SimpleLine[]): SimpleStop {
    const linesIds = Array.from(
      new Set(
        stopDto.stops
          .map((stop: any) => stop.lines.map((line: any) => line))
          .flat()
      )
    );
    return {
      id: stopDto.id,
      name: stopDto.name,
      position: this.positionFromDTO(stopDto.averagePosition),
      lines: lines.filter((line) => linesIds.includes(line.id)),
    };
  }

  private static lineFromDTO(lineDto: any): SimpleLine {
    return {
      id: lineDto.id,
      number: lineDto.number,
      backgroundColor: lineDto.backgroundColor,
      textColor: lineDto.textColor,
      pictoSvg: processSVG(lineDto.modeSvg ?? ""),
      numberShapeSvg: processSVG(lineDto.numberShapeSvg ?? ""),
      importance: lineDto.importance,
    };
  }

  public static async searchStops(search: string): Promise<SimpleStop[]> {
    const params = new URLSearchParams();
    params.append("action", "searchStops");
    params.append("coordinates", "48.86,2.34");
    params.append("compatibilityDate", "2024-03-30");
    params.append("apiKey", this.apiKey);
    params.append("q", search);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to search stations");
    }

    const json = await response.json();

    const lines: SimpleLine[] = json.data.lines.map((line: any) => {
      return this.lineFromDTO(line);
    });

    const stops: SimpleStop[] = json.data.stops
      .filter((stop: any) => stop.averagePosition !== undefined)
      .map((stop: any) => {
        return this.stopFromDTO(stop, lines);
      });

    return stops;
  }
}
