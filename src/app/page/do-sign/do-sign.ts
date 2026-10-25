import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Asl2enService } from '../../service/asl2en-service';
import { ClerkPatientMessage } from '../../service/clerk-patient-message';
import { INIT_WS_MSG_CP } from '../../tools';
import {
  Asl2enPredictionMode,
  ConnectWs,
  GlossScoreDict,
  ResponseAsl2enExemplarPrediction,
  ResponseAsl2enLandmark,
  ResponseAsl2enPrediction,
  StrResponseAsl2enExemplarPrediction,
  StrResponseAsl2enLandmark,
  StrResponseAsl2enPrediction,
} from '../../model/asl2en-model';
import { ResponseWarning, StrResponseWarning } from '../../model/errors-model';
import {
  ClerkPatientMsgModel,
  ConnectWsEasyMsg,
  StrConnectWsEasyMsg,
  StrWsEasyMsgUserA,
  WsEasyMsgUserA,
  WsEasyMsgUserB,
} from '../../model/clerk-patient-msg-model';
import { Asl2enLiveCamera } from '../../essential/asl2en-live-camera/asl2en-live-camera';
import { Asl2enPredictionCard } from '../../essential/asl2en-prediction-card/asl2en-prediction-card';
import { Button } from '../../essential/button/button';
import { ChooseModelCard } from '../../essential/choose-model-card/choose-model-card';

type Asl2enMessage =
  | ResponseAsl2enLandmark
  | ResponseAsl2enPrediction
  | ResponseAsl2enExemplarPrediction
  | ResponseWarning
  | ConnectWs;

type ClerkPatientMessageEvent = ConnectWsEasyMsg | WsEasyMsgUserA | WsEasyMsgUserB;

@Component({
  selector: 'app-do-sign',
  imports: [Button, Asl2enPredictionCard, Asl2enLiveCamera, ChooseModelCard],
  templateUrl: './do-sign.html',
})
export class DoSign implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly asl2enService = inject(Asl2enService);
  private readonly clerkPatientMsgService = inject(ClerkPatientMessage);
  private pendingImageRequests = Promise.resolve();

  protected readonly recognitionMode = signal<Asl2enPredictionMode>('exemplar');
  protected readonly predictionItems = signal<GlossScoreDict[]>([]);
  protected readonly asl2enWarning = signal<string | undefined>(undefined);
  protected readonly detectionStatus = signal<ResponseAsl2enLandmark['data']>({
    face: false,
    pose: false,
    left_hand: false,
    right_hand: false,
  });
  protected readonly predictedGlosses = signal<string[]>([]);
  protected readonly clerkMessages = signal<ClerkPatientMsgModel[]>([]);
  protected readonly patientIs = signal<'user_a' | 'user_b' | ''>('');

  public ngOnInit(): void {
    this.clerkPatientMsgService.message$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(message => this.handleClerkPatientMessage(message));

    this.asl2enService.wsAsl2enMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(message => this.handleAsl2enMessage(message));

    void this.sendClerkMessage(INIT_WS_MSG_CP);
  }

  protected setRecognitionMode(mode: Asl2enPredictionMode): void {
    this.recognitionMode.set(mode);
    this.predictionItems.set([]);
    this.predictedGlosses.set([]);
  }

  protected onCameraFrameCaptured(image: Blob): void {
    const mode = this.recognitionMode();
    this.pendingImageRequests = this.pendingImageRequests.then(async () => {
      try {
        await this.asl2enService.asl2en2ws(image, mode);
      } catch (error) {
        this.asl2enWarning.set(this.getErrorMessage(error, 'Failed to send camera image.'));
      }
    });
  }

  private handleAsl2enMessage(message: Asl2enMessage): void {
    switch (message.type) {
      case StrResponseAsl2enPrediction: {
        const predictions = (message as ResponseAsl2enPrediction).data.prediction
          .map(({ gloss, accuracy }) => ({ gloss, score: accuracy }));
        this.updatePredictions(predictions, 'classic');
        return;
      }
      case StrResponseAsl2enExemplarPrediction: {
        const predictions = (message as ResponseAsl2enExemplarPrediction).data.prediction;
        this.updatePredictions(predictions, 'exemplar');
        return;
      }
      case StrResponseAsl2enLandmark:
        this.detectionStatus.set((message as ResponseAsl2enLandmark).data);
        return;
      case StrResponseWarning: {
        const warning = message as ResponseWarning;
        this.asl2enWarning.set(warning.data.details);
        void this.sendPredictedGlossesToClerk();
      }
    }
  }

  private updatePredictions(predictions: GlossScoreDict[], mode: Asl2enPredictionMode): void {
    this.predictionItems.set(predictions);

    const bestPrediction = predictions[0];
    if (bestPrediction && (mode === 'exemplar' || bestPrediction.score > 0.75) && bestPrediction.gloss!=this.predictedGlosses().at(-1)) {
      this.predictedGlosses.update(glosses => [...glosses.slice(-7), bestPrediction.gloss]);
    }

    this.asl2enWarning.set(undefined);
  }

  private handleClerkPatientMessage(message: ClerkPatientMessageEvent): void {
    if (message.type === StrConnectWsEasyMsg) {
      this.patientIs.set((message as ConnectWsEasyMsg).data.you_are);
      return;
    }

    const isUserA = message.type === StrWsEasyMsgUserA;
    const text = isUserA
      ? (message as WsEasyMsgUserA).data.user_a
      : (message as WsEasyMsgUserB).data.user_b;
    if (text === INIT_WS_MSG_CP) return;

    this.clerkMessages.update(messages => [...messages, {
      user_a: isUserA ? text : undefined,
      user_b: isUserA ? undefined : text,
    }]);
  }

  private async sendPredictedGlossesToClerk(): Promise<void> {
    const glosses = this.predictedGlosses();
    if (glosses.length === 0) return;

    this.predictedGlosses.set([]);
    const sent = await this.sendClerkMessage(glosses.join(' '));
    if (!sent) {
      this.predictedGlosses.update(current => [...glosses, ...current].slice(-8));
    }
  }

  private async sendClerkMessage(message: string): Promise<boolean> {
    try {
      await this.clerkPatientMsgService.sendMsg(message);
      return true;
    } catch (error) {
      this.asl2enWarning.set(this.getErrorMessage(error, 'Unable to send the clerk message.'));
      return false;
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
