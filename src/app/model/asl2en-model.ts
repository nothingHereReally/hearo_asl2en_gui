export interface AslGlossModel{
  accuracy: number;
  gloss: string;
}
export interface Asl2EnModel{
  prediction: Array<AslGlossModel>;
  asl2gloss_model: number;
}
export interface Asl2EnImageModel{
  details: string;
  uuid: string|undefined;
}
