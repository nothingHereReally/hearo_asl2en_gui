import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { firstValueFrom, Observable, Subject } from 'rxjs';


import {
    Asl2enPrediction,
    ConnectWs,
    ResponseAsl2enImage,
    ResponseAsl2enImageInit,
    ResponseAsl2enLandmark,
    ResponseAsl2enPrediction,
    ResponseAsl2enExemplarPrediction,
    StrResponseAsl2enImageInit
} from '../model/asl2en-model';
import { ResponseWarning } from '../model/errors-model';
import { environment as env } from '../../environment/environment';
import { API_PREFIX } from '../tools';


@Injectable({
  providedIn: 'root',
})
export class Asl2enService{
  private readonly http: HttpClient= inject(HttpClient);
  private wsAsl2en: WebSocket|undefined= undefined;
  private wsUuid: string|undefined;
  public readonly wsAsl2enMessage$: Subject<ResponseAsl2enLandmark|ResponseWarning|ResponseAsl2enPrediction|ResponseAsl2enExemplarPrediction|ConnectWs>= new Subject<ResponseAsl2enLandmark|ResponseWarning|ResponseAsl2enPrediction|ResponseAsl2enExemplarPrediction|ConnectWs>();
  private asl2enWsHttpPostUuid: string= "init";
  private sessionMode: 'classic'|'exemplar'= 'exemplar';


  public asl2enSolo(images: Array<Blob>): Observable<Asl2enPrediction>{
    if( images.length!=22 ){
      throw new Error("implementation incorrect, due to length of array `images` should be 22");
    }
    const formData: FormData= new FormData();
    images.forEach((blob, idx)=>{
      formData.append(`image${idx+1}`, blob, `image${idx+1}.jpeg`);
    });

    return this.http.post<Asl2enPrediction>(
      `${env.API_DOMAIN.http}${API_PREFIX}/asl2en/`,
      formData,
      {
        observe: 'body'
      }
    );
  }


  private __asl2enWsConnect(): Promise<void>{
    if( this.wsAsl2en?.readyState === WebSocket.OPEN && this.wsUuid === this.asl2enWsHttpPostUuid ){
      return Promise.resolve();
    }

    return new Promise((resolve, reject)=> {
      this.closeWsAsl2en();
      const socket= new WebSocket(`${env.API_DOMAIN.ws}${API_PREFIX}/asl2en/${this.asl2enWsHttpPostUuid}/`);
      this.wsAsl2en= socket;
      this.wsUuid= this.asl2enWsHttpPostUuid;
      socket.onopen= ()=>{ resolve(); };

      socket.onerror= ()=>{ reject(
        new Error(`Failed to connect to WebSocket ${env.API_DOMAIN.ws}${API_PREFIX}/asl2en/${this.asl2enWsHttpPostUuid}/`)
      ); };

      socket.onmessage= (event)=>{
        this.wsAsl2enMessage$.next(JSON.parse(event.data));
      };

      socket.onclose= ()=>{
        if( this.wsAsl2en === socket ){
          this.wsAsl2en= undefined;
          this.wsUuid= undefined;
        }
      };
    });
  }
  public closeWsAsl2en(): void{
    if( this.wsAsl2en && this.wsAsl2en.readyState < WebSocket.CLOSING ){
      this.wsAsl2en?.close(1000, 'Recommended to close, due to No hands for a long time was detected');
    }
  }
  public async asl2en2ws(image: Blob, mode: 'classic'|'exemplar'= 'exemplar'): Promise<string>{
    if( mode !== this.sessionMode ){
      this.closeWsAsl2en();
      this.asl2enWsHttpPostUuid= 'init';
      this.sessionMode= mode;
    }
    let asl2en: ResponseAsl2enImageInit|ResponseAsl2enImage;
    const formData: FormData= new FormData();
    formData.append('image', image, 'image.jpeg');
    const endpoint= mode === 'exemplar' ? 'asl2en-exemplar' : 'asl2en';
    try{
      asl2en= await firstValueFrom(this.http.post<ResponseAsl2enImageInit|ResponseAsl2enImage>(
        `${env.API_DOMAIN.http}${API_PREFIX}/${endpoint}/${this.asl2enWsHttpPostUuid}/`,
        formData,
        { observe: 'body' }
      ));
    }catch(err){
      this.closeWsAsl2en();
      this.asl2enWsHttpPostUuid= 'init';
      asl2en= await firstValueFrom(this.http.post<ResponseAsl2enImageInit>(
        `${env.API_DOMAIN.http}${API_PREFIX}/${endpoint}/${this.asl2enWsHttpPostUuid}/`,
        formData,
        { observe: 'body' }
      ));
    }

    if( asl2en.type==StrResponseAsl2enImageInit ){
      this.asl2enWsHttpPostUuid= (asl2en as ResponseAsl2enImageInit).data.uuid;
      await this.__asl2enWsConnect();
    }
    return asl2en.data.details;
  }
}
