import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable, from, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class PremiumGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const user = this.authService.currentUser;
    if (!user) {
      // Not logged in → redirect to login
      return from([this.router.createUrlTree(['/login'])]);
    }

    const userRef = doc(this.firestore, `users/${user.uid}`);
    return from(getDoc(userRef)).pipe(
      map(snapshot => {
        const data = snapshot.data();
        const isPremium = data?.['plan'] === 'premium';

        if (isPremium) {
          return true;
        } else {
          return this.router.createUrlTree(['/upgrade']);
        }
      })
    );
  }
}
//       response.status(400).json({