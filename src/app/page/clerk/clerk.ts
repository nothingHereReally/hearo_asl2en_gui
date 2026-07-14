import { Component, signal, WritableSignal } from '@angular/core';
import { ClerkPatientWsMsgModel } from '../../model/clerk-patient-msg-model';

@Component({
  selector: 'app-clerk',
  imports: [],
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
}
