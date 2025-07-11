export interface NameResult {
  name: string;
  gender: "male" | "female" | "neutral";
  meaning: string[];
  source: string;
  explanation: string;
}

export interface NameGeneratorParams {
  gender?: "male" | "female" | "neutral";
  meanings: string[];
  culturalSource: string[];
  avoidCharacters?: string[];
  avoidSounds?: string[];
  count: number;
  nameLength?: "single" | "double" | "any";
}
