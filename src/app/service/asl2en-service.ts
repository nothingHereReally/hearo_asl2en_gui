import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { firstValueFrom, Observable } from 'rxjs';


import { environment as env } from '../../environment/environment';
import { Asl2EnImageModel, Asl2EnModel } from '../model/asl2en-model';


@Injectable({
  providedIn: 'root',
})
export class Asl2enService{
  private readonly api_prefix: string= '/api/v1';
  private readonly http: HttpClient= inject(HttpClient);
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

  public async asl2en2ws(image: Blob): Promise<string>{
    const asl2en: Asl2EnImageModel= await firstValueFrom(this.http.post<Asl2EnImageModel>(
      `${env.API_DOMAIN.http}${this.api_prefix}/asl2en/${this.asl2enWsHttpPostUuid}/`,
      image,
      { observe: 'body' }
    ));
    if( asl2en.uuid!=null ){
      this.asl2enWsHttpPostUuid= asl2en.uuid;
    }
    return asl2en.details;
  }
}
