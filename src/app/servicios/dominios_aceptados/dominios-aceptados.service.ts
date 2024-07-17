import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DominiosAceptadosService {

  constructor(private _http: HttpClient) { }

  get_all() {
    const req = new HttpRequest('GET', `${environment.url_back}/dominios_aceptados`, { responseType: "json" });
    return this._http.request(req);
  }

  put(dominio: string) {
    const req = new HttpRequest('PUT', `${environment.url_back}/dominios_aceptados`, { dominio }, { responseType: "json" });
    return this._http.request(req);
  }

  put_multi(dominios: string[]) {
    const req = new HttpRequest('PUT', `${environment.url_back}/dominios_aceptados/multi`, { dominios }, { responseType: "json" });
    return this._http.request(req);
  }

  delete(id: string | number) {
    const req = new HttpRequest('DELETE', `${environment.url_back}/dominios_aceptados/${id}`, { responseType: "json" });
    return this._http.request(req);
  }
}
