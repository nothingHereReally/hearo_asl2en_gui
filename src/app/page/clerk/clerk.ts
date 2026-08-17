import { Component, DestroyRef, inject, model, ModelSignal, OnInit, signal, WritableSignal } from '@angular/core';
import {
    ClerkPatientMsgModel,
    ConnectWsEasyMsg,
    StrConnectWsEasyMsg,
    StrWsEasyMsgUserA,
    StrWsEasyMsgUserB,
    WsEasyMsgUserA,
    WsEasyMsgUserB
} from '../../model/clerk-patient-msg-model';
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
  protected clerkPatientMsgReceivedSent: WritableSignal<Array<ClerkPatientMsgModel>>= signal([]);
  protected clerkIs: WritableSignal<string>= signal('');
  protected clerkInputMsg: ModelSignal<string>= model('');


  public ngOnInit(): void {
    this.clerkPatientMsgService.message$.pipe()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((msg: ConnectWsEasyMsg|WsEasyMsgUserA|WsEasyMsgUserB)=>{
            if( msg.type==StrConnectWsEasyMsg ){
              this.clerkIs.set((msg as ConnectWsEasyMsg).data.you_are);
            }else if( msg.type==StrWsEasyMsgUserA ){
              const msgFromUserA= (msg as WsEasyMsgUserA).data.user_a;
              if( msgFromUserA!=INIT_WS_MSG_CP ){
                this.clerkPatientMsgReceivedSent.update(arr=>[...arr, {
                  'user_a': (msg as WsEasyMsgUserA).data.user_a,
                  'user_b': undefined,
                }]);
              }
            }else if( msg.type==StrWsEasyMsgUserB ){
              const msgFromUserB= (msg as WsEasyMsgUserB).data.user_b;
              if( msgFromUserB!=INIT_WS_MSG_CP ){
                this.clerkPatientMsgReceivedSent.update(arr=>[...arr, {
                  'user_a': undefined,
                  'user_b': (msg as WsEasyMsgUserB).data.user_b,
                }]);
              }
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
