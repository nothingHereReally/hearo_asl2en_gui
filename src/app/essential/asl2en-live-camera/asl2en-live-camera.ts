import { AfterViewInit, Component, ElementRef, input, OnDestroy, output, signal, viewChild } from '@angular/core';
import { environment as env } from '../../../environment/environment';
import { ResponseAsl2enLandmark } from '../../model/asl2en-model';
import { Button } from '../button/button';

@Component({
  selector: 'app-asl2en-live-camera',
  imports: [Button],
  templateUrl: './asl2en-live-camera.html',
})
export class Asl2enLiveCamera implements AfterViewInit, OnDestroy {
  readonly detectionStatus = input<ResponseAsl2enLandmark['data'] | null>(null);
  readonly statusMessage = input<string | undefined>();
  readonly frameCaptured = output<Blob>();

  protected readonly cameraStream = signal<MediaStream | null>(null);
  protected readonly cameraStarting = signal(false);
  protected readonly cameraError = signal<string | undefined>(undefined);
  protected readonly mirrored = signal(false);

  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('videoEl');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasEl');
  private previewFrameId?: number;
  private lastCapturedAt = 0;

  public ngAfterViewInit(): void {
    void this.startCamera();
  }

  public ngOnDestroy(): void {
    this.stopCamera();
  }

  protected async toggleCamera(): Promise<void> {
    if (this.cameraStream()) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  protected toggleMirror(): void {
    this.mirrored.update(value => !value);
  }

  private async startCamera(): Promise<void> {
    if (this.cameraStream() || this.cameraStarting()) return;
    this.cameraStarting.set(true);
    this.cameraError.set(undefined);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16 / 9 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
      });
      this.cameraStream.set(stream);
      this.video().nativeElement.srcObject = stream;
      await this.video().nativeElement.play();
      if (this.cameraStream() === stream) this.startPreviewLoop();
    } catch (error) {
      this.cameraError.set(error instanceof Error ? error.message : 'Unable to access the camera.');
      this.stopCamera();
    } finally {
      this.cameraStarting.set(false);
    }
  }

  private stopCamera(): void {
    this.stopPreviewLoop();
    this.cameraStream()?.getTracks().forEach(track => track.stop());
    this.cameraStream.set(null);
    const video = this.video()?.nativeElement;
    if (video) video.srcObject = null;
  }

  private startPreviewLoop(): void {
    this.stopPreviewLoop();
    this.lastCapturedAt = 0;

    const drawFrame = (time: number): void => {
      if (!this.cameraStream()) return;

      const video = this.video().nativeElement;
      const canvas = this.canvas().nativeElement;
      const context = canvas.getContext('2d');
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width > 0 && height > 0 && context) {
        if (canvas.width !== height || canvas.height !== height) {
          canvas.width = height;
          canvas.height = height;
        }
        context.fillStyle = getComputedStyle(canvas).getPropertyValue('--sc-100').trim();
        context.fillRect(0, 0, height, height);
        if (width >= height) {
          const sourceX = Math.floor((width - height) / 2);
          context.drawImage(video, sourceX, 0, height, height, 0, 0, height, height);
        } else {
          const destinationX = Math.floor((height - width) / 2);
          context.drawImage(video, destinationX, 0, width, height);
        }

        if (time - this.lastCapturedAt >= env.TIME_DELAY_ASL2EN) {
          this.lastCapturedAt = time;
          void this.captureFrame(canvas);
        }
      }
      this.previewFrameId = requestAnimationFrame(drawFrame);
    };

    this.previewFrameId = requestAnimationFrame(drawFrame);
  }

  private async captureFrame(canvas: HTMLCanvasElement): Promise<void> {
    const image = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.98));
    if (image && this.cameraStream()) this.frameCaptured.emit(image);
  }

  private stopPreviewLoop(): void {
    if (this.previewFrameId !== undefined) {
      cancelAnimationFrame(this.previewFrameId);
      this.previewFrameId = undefined;
    }
  }
}
