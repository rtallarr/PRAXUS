import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // const router = new Router();
  // const token = JSON.parse(localStorage.getItem("auth-user") ?? "{}").token;
  // const urls_no_auth: string[] = ["/", `/${environment.ruta_login}`, `/${environment.ruta_registro}`, `/${environment.ruta_reset_pass}`];
  // if (!urls_no_auth.includes(router.url)) {
  //   if (!token) {
  //     router.navigateByUrl(`/`);
  //   }
  // }

  // const authReq = req.clone({
  //   setHeaders: {
  //     Authorization: `${token}`
  //   }
  // });
  // return next(authReq);
  return next(req);
};
