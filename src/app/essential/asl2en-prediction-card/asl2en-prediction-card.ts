import { Component, computed, input } from '@angular/core';

export type Asl2enPredictionMode= 'classic'|'exemplar';
export interface Asl2enGlossPrediction{
  gloss: string;
  score: number;
}

@Component({
  selector: 'app-asl2en-prediction-card',
  imports: [],
  templateUrl: './asl2en-prediction-card.html',
})
export class Asl2enPredictionCard{
  readonly mode= input.required<Asl2enPredictionMode>();
  readonly predictions= input.required<Asl2enGlossPrediction[]>();
  protected readonly visiblePredictions= computed(()=>this.predictions().slice(0, 10));
}
