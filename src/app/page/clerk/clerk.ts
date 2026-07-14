import { Component, model, ModelSignal, signal, WritableSignal } from '@angular/core';
import { ClerkPatientWsMsgModel } from '../../model/clerk-patient-msg-model';
import { FormsModule } from '@angular/forms';
import { Button } from '../../essential/button/button';

@Component({
  selector: 'app-clerk',
  imports: [
    FormsModule,
    Button
  ],
  templateUrl: './clerk.html',
  styleUrl: './clerk.css',
})
export class Clerk{
  protected clerkPatientMsgReceivedSent: WritableSignal<Array<ClerkPatientWsMsgModel>>= signal([
    {
      user_a: 'hello this is user_a',
      user_b: undefined
    },
    {
      user_a: undefined,
      user_b: 'hello this is user_b 2nd'
    },
    {
      user_a: 'hello this is user_a 3rd',
      user_b: undefined
    },
  ]);
  protected clerkIs: WritableSignal<string>= signal('user_a');
  protected clerkInputMsg: ModelSignal<string>= model('');


  protected async sendMessage(key?: KeyboardEvent): Promise<void>{
    if( key?.key=="Enter" && !key.shiftKey){
      key.preventDefault();
      if( this.clerkInputMsg().length!=0 ){
        this.clerkInputMsg.set('');
      }
    }else if( key==undefined ){
      if( this.clerkInputMsg().length!=0 ){
        this.clerkInputMsg.set('');
      }
    }
  }
  protected autoGrowHeightMsg(textarea: HTMLTextAreaElement) {
    textarea.style.height= 'auto';
    textarea.style.height= textarea.scrollHeight +'px';
  }
}
