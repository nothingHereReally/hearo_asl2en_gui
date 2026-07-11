import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { Observable } from 'rxjs';


import { environment as env } from '../../environment/environment';
import { Asl2EnSoloModel } from '../model/asl2en-model';


@Injectable({
  providedIn: 'root',
})
export class Asl2enService{
  private readonly api_prefix: string= '/api/v1';
  private readonly http: HttpClient= inject(HttpClient);


  public asl2enSolo(images: Array<Blob>): Observable<Asl2EnSoloModel>{
    if( images.length!=22 ){
      throw new Error("implementation incorrect, due to length of array `images` should be 22");
    }
    const formData: FormData= new FormData();
    images.forEach((blob, idx)=>{
      formData.append(`image${idx+1}`, blob, `image${idx+1}.jpeg`);
    });

    return this.http.post<Asl2EnSoloModel>(
      `${env.API_DOMAIN.http}${this.api_prefix}/asl2en/`,
      formData,
      {
        observe: 'body'
      }
    );
  }
}
