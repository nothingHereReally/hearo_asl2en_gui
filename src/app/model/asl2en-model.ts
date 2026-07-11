export interface AslGlossModel{
  accuracy: number;
  gloss: string;
}
export interface Asl2EnModel{
  prediction: Array<AslGlossModel>;
  asl2gloss_model: number;
}
