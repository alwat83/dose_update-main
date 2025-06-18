// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  User
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  docData,
  setDoc
} from '@angular/fire/firestore';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    onAuthStateChanged(this.auth, user => {
      this.currentUserSubject.next(user);
    });
  }

  /** ✅ Enhanced: Create Firestore user doc with metadata */
  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then(cred => {
      const userRef = doc(this.firestore, `users/${cred.user.uid}`);
      return setDoc(userRef, {
        email: email,
        plan: 'free',
        verified: false,
        signupSource: 'app_direct',
        createdAt: new Date(),
        onboardingStep: 0,
        reminderEnabled: true
      }).then(() => cred);
    });
  }

  sendVerificationEmail(user: User) {
    return sendEmailVerification(user);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  sendPasswordReset(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  updateUserProfile(displayName: string, email?: string) {
    const user = this.auth.currentUser;
    if (!user) return Promise.reject('No user is logged in');

    const promises = [updateProfile(user, { displayName })];
    if (email && email !== user.email) {
      promises.push(updateEmail(user, email));
    }
    return Promise.all(promises);
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  get isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  getUserPlan() {
    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of('free');
        const userRef = doc(this.firestore, `users/${user.uid}`);
        return docData(userRef).pipe(
          map((data: any) => data?.plan || 'free')
        );
      })
    );
  }
}
//       response.status(400).json({