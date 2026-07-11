import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { firstValueFrom, Observable, Subject } from 'rxjs';


import { environment as env } from '../../environment/environment';
import { Asl2EnImageModel, Asl2EnModel } from '../model/asl2en-model';
import { ErrorDetail } from '../model/errors-model';


@Injectable({
  providedIn: 'root',
})
export class Asl2enService{
  private readonly api_prefix: string= '/api/v1';
  private readonly http: HttpClient= inject(HttpClient);
  private wsAsl2en: WebSocket|undefined= undefined;
  public readonly wsAsl2enMessage$: Subject<Asl2EnModel|ErrorDetail>= new Subject<Asl2EnModel|ErrorDetail>();
  private asl2enWsHttpPostUuid: string= "init";


  public asl2enSolo(images: Array<Blob>): Observable<Asl2EnModel>{
    if( images.length!=22 ){
      throw new Error("implementation incorrect, due to length of array `images` should be 22");
    }
    const formData: FormData= new FormData();
    images.forEach((blob, idx)=>{
      formData.append(`image${idx+1}`, blob, `image${idx+1}.jpeg`);
    });

    return this.http.post<Asl2EnModel>(
      `${env.API_DOMAIN.http}${this.api_prefix}/asl2en/`,
      formData,
      {
        observe: 'body'
      }
    );
  }


  private __asl2enWsConnect(): Promise<void>{
    if( this.wsAsl2en?.readyState === WebSocket.OPEN ){
      return Promise.resolve();
    }

    return new Promise((resolve, reject)=> {
      this.wsAsl2en= new WebSocket(`${env.API_DOMAIN.ws}${this.api_prefix}/asl2en/${this.asl2enWsHttpPostUuid}/`);
      this.wsAsl2en.onopen= ()=>{ resolve(); };

      this.wsAsl2en.onerror= ()=>{ reject(
        new Error(`Failed to connect to WebSocket ${env.API_DOMAIN.ws}${this.api_prefix}/asl2en/${this.asl2enWsHttpPostUuid}/`)
      ); };

      this.wsAsl2en.onmessage= (event)=>{
        this.wsAsl2enMessage$.next(JSON.parse(event.data));
      };

      this.wsAsl2en.onclose= ()=>{ this.wsAsl2en= undefined; };
    });
  }
  public async asl2en2ws(image: Blob): Promise<string>{
    let asl2en: Asl2EnImageModel;
    try{
      asl2en= await firstValueFrom(this.http.post<Asl2EnImageModel>(
        `${env.API_DOMAIN.http}${this.api_prefix}/asl2en/${this.asl2enWsHttpPostUuid}/`,
        image,
        { observe: 'body' }
      ));
    }catch(err){
      this.asl2enWsHttpPostUuid= 'init';
      asl2en= await firstValueFrom(this.http.post<Asl2EnImageModel>(
        `${env.API_DOMAIN.http}${this.api_prefix}/asl2en/${this.asl2enWsHttpPostUuid}/`,
        image,
        { observe: 'body' }
      ));
    }
    if( asl2en.uuid!=null ){
      this.asl2enWsHttpPostUuid= asl2en.uuid;
      await this.__asl2enWsConnect();
    }
    return asl2en.details;
  }
}
