import { Component, computed, input } from '@angular/core';


import { Asl2enPredictionMode, GlossScoreDict } from '../../model/asl2en-model';


@Component({
  selector: 'app-asl2en-prediction-card',
  imports: [],
  templateUrl: './asl2en-prediction-card.html',
})
export class Asl2enPredictionCard{
  readonly mode= input.required<Asl2enPredictionMode>();
  readonly predictions= input.required<Array<GlossScoreDict>>();
  protected readonly visiblePredictions= computed(()=>this.predictions().slice(0, 10));
}
