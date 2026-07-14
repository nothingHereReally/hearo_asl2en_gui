import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { firstValueFrom, Subject } from 'rxjs';


import { environment as env } from '../../environment/environment';
import { ClerkPatientWsMsgModel, InitWsMessageModel, UuidInitMessageModel } from '../model/clerk-patient-msg-model';
import { API_PREFIX } from '../tools';


@Injectable({
  providedIn: 'root',
})
export class ClerkPatientMessage{
  private http: HttpClient= inject(HttpClient);
  private uuidMsg: string= 'init';
  private wsConnection: WebSocket|undefined= undefined;
  public readonly message$: Subject<InitWsMessageModel|ClerkPatientWsMsgModel>= new Subject<InitWsMessageModel|ClerkPatientWsMsgModel>();


  private async __getUuid(): Promise<string>{
    const response: UuidInitMessageModel= await firstValueFrom(this.http.get<UuidInitMessageModel>(
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

    return new Promise((resolve, reject)=> {
      this.wsConnection= new WebSocket(`${env.API_DOMAIN.ws}${API_PREFIX}/easy-ws-message/${this.uuidMsg}/`);
      this.wsConnection.onopen= ()=>{ resolve(); };

      this.wsConnection.onerror= ()=>{ reject(
        new Error(`Failed to connect to WebSocket ${env.API_DOMAIN.ws}${API_PREFIX}/easy-ws-message/${this.uuidMsg}/`)
      ); };

      this.wsConnection.onmessage= (event)=>{
        this.message$.next(JSON.parse(event.data));
      };

      this.wsConnection.onclose= ()=>{ this.wsConnection= undefined; };
    });
  }
  public async sendMsg(message: string): Promise<void>{
    if( this.uuidMsg=='init' ){
      this.uuidMsg= await this.__getUuid();
      await this.__connectWs();
    }
    this.wsConnection?.send(message);
  }
}
