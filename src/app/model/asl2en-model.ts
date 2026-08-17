export const StrConnectWs: string= 'ConnectWs';
export interface ConnectWs{
  type: 'ConnectWs';
  data: {
    connection: string
  };
}


export const StrResponseAsl2enImageInit: string= 'ResponseAsl2enImageInit';
export interface ResponseAsl2enImageInit{
  type: 'ResponseAsl2enImageInit';
  data: {
    details: string;
    uuid: string;
  };
}
export const StrResponseAsl2enImage: string= 'ResponseAsl2enImage';
export interface ResponseAsl2enImage{
  type: 'ResponseAsl2enImage';
  data: {
    details: string;
  };
}


export const StrResponseAsl2enLandmark: string= 'ResponseAsl2enLandmark';
export interface ResponseAsl2enLandmark{
  type: 'ResponseAsl2enLandmark';
  data: {
    face: boolean;
    pose: boolean;
    left_hand: boolean;
    right_hand: boolean;
  };
}
export interface GlossAccuracyDict{
  gloss: string;
  accuracy: number;
}
export interface Asl2enPrediction{
  prediction: Array<GlossAccuracyDict>;
  asl2gloss_model: number;
}
export const StrResponseAsl2enPrediction: string= 'ResponseAsl2enPrediction';
export interface ResponseAsl2enPrediction{
  type: 'ResponseAsl2enPrediction';
  data: Asl2enPrediction;
}
