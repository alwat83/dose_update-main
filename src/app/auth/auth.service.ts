// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,    // ← import this
  updateProfile,
  updateEmail,
  User
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, user => {
      this.currentUserSubject.next(user);
    });
  }

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
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

  /** 🔒 New: send a password-reset email */
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
}
