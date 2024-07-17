import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Observable } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  url = environment.url_back;

  constructor(private http: HttpClient, private cookies: CookieService) { }

  login(user: string, password: string, dominio: string): Observable<any> {
    const req = new HttpRequest('POST', `${this.url}/usuario/login`, { user, password, dominio });
    return this.http.request(req);
  }

  register(email: string, password: string, cnfPwd: string, nombre: string, es_encargado: boolean, es_supervisor: boolean, es_estudiante: boolean, es_admin: boolean, extras: any): Observable<any> {
    const req = new HttpRequest('POST', `${this.url}/usuario/register`, { email, password, cnfPwd, nombre, es_encargado, es_supervisor, es_estudiante, es_admin, extras });
    return this.http.request(req);
  }

  get_carreras() {
    const req = new HttpRequest('GET', `${environment.url_back}/carrera/todos`);
    return this.http.request(req);
  }

  logout(): Observable<any> {
    const req = new HttpRequest('POST', `${this.url}/usuario/logout`, {});
    return this.http.request(req);
  }

  get_usuario_encriptado(token: string, iv: string): Observable<any> {
    const req = new HttpRequest('GET', `${environment.url_back}/usuario/confirmar_correo?token=${token}&iv=${iv}`);
    return this.http.request(req);
  }

  send_mail(mail:string) {
    const req = new HttpRequest('GET', `${environment.url_back}/usuario/send_mail?mail=${mail}`);
    return this.http.request(req);
  }

  change_password(id:number, pass:string, token:string){
    const req = new HttpRequest('PUT', `${environment.url_back}/usuario/change_password?id=${id}&pass=${pass}&token=${token}`, {id, pass, token});
    return this.http.request(req);
  }

}
