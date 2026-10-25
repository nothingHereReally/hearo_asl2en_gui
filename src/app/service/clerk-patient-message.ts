import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { firstValueFrom, Subject } from 'rxjs';


import { environment as env } from '../../environment/environment';
import {
    ConnectWsEasyMsg,
    UuidMessageModel,
    WsEasyMsgUserA,
    WsEasyMsgUserB
} from '../model/clerk-patient-msg-model';
import { API_PREFIX } from '../tools';


@Injectable({
  providedIn: 'root',
})
export class ClerkPatientMessage{
  private http: HttpClient= inject(HttpClient);
  private uuidMsg: string= 'init';
  private uuidRequest: Promise<string>|undefined;
  private wsConnection: WebSocket|undefined= undefined;
  public readonly message$: Subject<ConnectWsEasyMsg|WsEasyMsgUserA|WsEasyMsgUserB>= new Subject<ConnectWsEasyMsg|WsEasyMsgUserA|WsEasyMsgUserB>();


  private async __getUuid(): Promise<string>{
    const response: UuidMessageModel= await firstValueFrom(this.http.get<UuidMessageModel>(
      `${env.API_DOMAIN.http}${API_PREFIX}/easy-ws-message/`,
      {
        observe: 'body'
      }
    ));
    return response.uuid;
  }
  private __connectWs(): Promise<void>{
    if( this.wsConnection?.readyState === WebSocket.OPEN ){
      return Promise.resolve();
    }

    const url= `${env.API_DOMAIN.ws}${API_PREFIX}/easy-ws-message/${this.uuidMsg}/`;
    if( this.wsConnection?.readyState === WebSocket.CONNECTING ){
      const socket= this.wsConnection;
      return new Promise((resolve, reject)=>{
        socket.addEventListener('open', ()=>resolve(), { once: true });
        const fail=(): void=>reject(new Error(`Failed to connect to WebSocket ${url}`));
        socket.addEventListener('error', fail, { once: true });
        socket.addEventListener('close', fail, { once: true });
      });
    }

    return new Promise((resolve, reject)=> {
      const socket= new WebSocket(url);
      this.wsConnection= socket;
      socket.onopen= ()=>{ resolve(); };

      socket.onerror= ()=>{ reject(new Error(`Failed to connect to WebSocket ${url}`)); };

      socket.onmessage= (event)=>{
        this.message$.next(JSON.parse(event.data));
      };

      socket.onclose= ()=>{
        if( this.wsConnection === socket ) this.wsConnection= undefined;
        reject(new Error(`WebSocket closed before sending to ${url}`));
      };
    });
  }
  public async sendMsg(message: string): Promise<void>{
    if( this.uuidMsg=='init' ){
      this.uuidRequest ??= this.__getUuid();
      try{
        this.uuidMsg= await this.uuidRequest;
      }finally{
        this.uuidRequest= undefined;
      }
    }
    await this.__connectWs();
    const socket= this.wsConnection;
    if( socket?.readyState !== WebSocket.OPEN ){
      throw new Error('Clerk message WebSocket is not open.');
    }
    socket.send(message);
  }
}
