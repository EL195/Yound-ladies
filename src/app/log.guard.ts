import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogGuard implements CanActivate {
  user: any;
  userInfo: any;
  
  constructor(
    private router: Router,
    public auth : AuthService,
     ){
  }

  async canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot): Promise<boolean> {
      const user = await this.auth.isLoggedIn()
        if (user) {
          //console.log("login ok");
          return true;
        }
        else{
          //console.log("login non");
          this.router.navigate(['/login']);
          return true;
        }
}
}