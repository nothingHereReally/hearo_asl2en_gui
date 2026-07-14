import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnDestroy, Signal, signal, viewChild, WritableSignal } from '@angular/core';


import { environment as env } from '../../../environment/environment';
import { sleepAsync } from '../../tools';
import { Asl2enService } from '../../service/asl2en-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Asl2EnErrorDetail } from '../../model/errors-model';
import { Asl2EnModel } from '../../model/asl2en-model';
import { ClerkPatientMessage } from '../../service/clerk-patient-message';


@Component({
  selector: 'app-do-sign',
  imports: [],
  templateUrl: './do-sign.html',
  styleUrl: './do-sign.css',
})
export class DoSign implements AfterViewInit, OnDestroy{
  private destroyRef: DestroyRef= inject(DestroyRef)
  private asl2enService: Asl2enService= inject(Asl2enService);
  private clerkPatientMsgService: ClerkPatientMessage= inject(ClerkPatientMessage);
  private keepVideoCameraRolling: WritableSignal<boolean>= signal(true);
  protected hasAllowedCamera: WritableSignal<boolean>= signal(false);
  protected asl2enWsPrediction: WritableSignal<Asl2EnModel>= signal({
    prediction: [],
    asl2gloss_model: -1
  })
  protected asl2enWsError: WritableSignal<Asl2EnErrorDetail>= signal({
    details: undefined
  });
  protected asl2enPredictedGlosses: WritableSignal<Array<string>>= signal([]);


  readonly videoElRef: Signal<ElementRef<HTMLVideoElement>>= viewChild.required<ElementRef<HTMLVideoElement>>('videoEl');
  private imgCanvas: Signal<ElementRef<HTMLCanvasElement>>= viewChild.required<ElementRef<HTMLCanvasElement>>('canvasEl');
  private mediaStream?: MediaStream;


  public async ngAfterViewInit(): Promise<void>{
    await this.__initVideoCameraAsync();
  }
  public ngOnDestroy(): void {
    if( this.hasAllowedCamera() ){
      this.__stopVideoCamera();
    }
  }


  private async __initVideoCameraAsync(): Promise<void>{
    try{
      /* web-browser prompts user for camera access */
      /* if not given permission be error */
      this.hasAllowedCamera.set(true);
      this.mediaStream= await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 400, ideal: 700},
          height: { min: 400, ideal: 700},
          facingMode: 'user',
          frameRate: { ideal: 24, max: 30}
        },
        audio: false
      });
      this.videoElRef().nativeElement.srcObject= this.mediaStream;
      this.videoElRef().nativeElement.onloadedmetadata= ()=>{
          this.videoElRef().nativeElement.play();
      }
      this.asl2enService.wsAsl2enMessage$
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((msg: Asl2EnModel|Asl2EnErrorDetail)=>{
            if( (msg as Asl2EnModel)?.prediction ){
              this.asl2enWsPrediction.set(msg as Asl2EnModel);
              if( this.asl2enWsPrediction().prediction[0].accuracy > 0.75 ){
                if( this.asl2enPredictedGlosses().length > 7 ){
                  this.asl2enPredictedGlosses.update(arr=>arr.slice(0,6))
                }
                const top1gloss= this.asl2enWsPrediction().prediction[0]
                this.asl2enPredictedGlosses.update(arr=>[
                  ...arr,
                  `${top1gloss.gloss}( ${(top1gloss.accuracy*100).toFixed(2)} )`
                ]);
              }
              this.asl2enWsError.set({
                details: undefined,
              });
            }else if( (msg as Asl2EnErrorDetail)?.details ){
              this.asl2enWsError.set(msg as Asl2EnErrorDetail);
              if( this.asl2enPredictedGlosses().length>0 ){
                this.clerkPatientMsgService.sendMsg(this.asl2enPredictedGlosses().join(' '));
              }
            }
          });
      /* loop to get images for asl2en */
      // sleepAsync(1000*18, ()=>{
      //   this.__stopVideoCamera();
      // });
      while( this.keepVideoCameraRolling() && this.hasAllowedCamera() ){
        await sleepAsync(env.TIME_DELAY_ASL2EN);
        await this.__doAsl2en();
      }
    }catch(err){
      /* denied camera access permission by user */
      this.hasAllowedCamera.set(false);
      /* this function does not ask for permission again */
      /* needs refresh to ask again for permission */
    }
  }




  private async __doAsl2en(): Promise<void>{
    const context= this.imgCanvas().nativeElement.getContext('2d');
    const width: number= this.videoElRef().nativeElement.videoWidth;
    const height: number= this.videoElRef().nativeElement.videoHeight;
    if( width!=0 && height!=0 && context!=null ){
      this.imgCanvas().nativeElement.width= this.videoElRef().nativeElement.videoWidth;
      this.imgCanvas().nativeElement.height= this.videoElRef().nativeElement.videoHeight;
      context.drawImage(this.videoElRef().nativeElement, 0, 0, width, height);


      const imageBlob= await new Promise<Blob|null>(resolve =>
        this.imgCanvas().nativeElement.toBlob(resolve, 'image/jpeg', 0.98)
      );
      if( imageBlob!=null ){
        await this.asl2enService.asl2en2ws(imageBlob)
      }
    }
  }




  private __stopVideoCamera(): void{
    this.keepVideoCameraRolling.set(false);
    this.hasAllowedCamera.set(false);
    if( this.mediaStream ){
      this.mediaStream.getTracks().forEach(track=>{ track.stop(); });
    }
    this.videoElRef().nativeElement.remove();
    this.imgCanvas().nativeElement.remove();
  }
}
