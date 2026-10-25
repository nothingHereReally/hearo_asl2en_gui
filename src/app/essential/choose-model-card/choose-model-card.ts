import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';

export type RecognitionMode = 'classic' | 'exemplar';

@Component({
  selector: 'app-choose-model-card',
  imports: [],
  templateUrl: './choose-model-card.html',
})
export class ChooseModelCard {
  readonly mode: InputSignal<RecognitionMode>= input<RecognitionMode>('exemplar');
  readonly modeChange: OutputEmitterRef<RecognitionMode>= output<RecognitionMode>();
}
