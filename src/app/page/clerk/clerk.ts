import { Component, DestroyRef, inject, model, ModelSignal, OnInit, signal, WritableSignal } from '@angular/core';
import { ClerkPatientWsMsgModel, InitWsMessageModel } from '../../model/clerk-patient-msg-model';
import { FormsModule } from '@angular/forms';
import { Button } from '../../essential/button/button';
import { ClerkPatientMessage } from '../../service/clerk-patient-message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { INIT_WS_MSG_CP } from '../../tools';

@Component({
  selector: 'app-clerk',
  imports: [
    FormsModule,
    Button
  ],
  templateUrl: './clerk.html',
  styleUrl: './clerk.css',
})
export class Clerk implements OnInit{
  private destroyRef: DestroyRef= inject(DestroyRef)
  private clerkPatientMsgService: ClerkPatientMessage= inject(ClerkPatientMessage);
  protected clerkPatientMsgReceivedSent: WritableSignal<Array<ClerkPatientWsMsgModel>>= signal([]);
  protected clerkIs: WritableSignal<string>= signal('');
  protected clerkInputMsg: ModelSignal<string>= model('');


  public ngOnInit(): void {
    this.clerkPatientMsgService.message$.pipe()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((msg: InitWsMessageModel|ClerkPatientWsMsgModel)=>{
            if( (msg as InitWsMessageModel).you_are ){
              this.clerkIs.set((msg as InitWsMessageModel).you_are);
            }else if(
                (msg as ClerkPatientWsMsgModel).user_a!=INIT_WS_MSG_CP &&
                (msg as ClerkPatientWsMsgModel).user_b!=INIT_WS_MSG_CP){
              this.clerkPatientMsgReceivedSent.update(arr=>[...arr, msg as ClerkPatientWsMsgModel]);
            }
          });
    this.clerkInputMsg.set(INIT_WS_MSG_CP);
    this.sendMessage();
  }
  protected async sendMessage(key?: KeyboardEvent): Promise<void>{
    if( key?.key=="Enter" && !key.shiftKey){
      key.preventDefault();
      if( this.clerkInputMsg().length!=0 ){
        this.clerkPatientMsgService.sendMsg(this.clerkInputMsg());
        this.clerkInputMsg.set('');
      }
    }else if( key==undefined ){
      if( this.clerkInputMsg().length!=0 ){
        this.clerkPatientMsgService.sendMsg(this.clerkInputMsg());
        this.clerkInputMsg.set('');
      }
    }
  }
  protected autoGrowHeightMsg(textarea: HTMLTextAreaElement) {
    textarea.style.height= 'auto';
    textarea.style.height= textarea.scrollHeight +'px';
  }
}
