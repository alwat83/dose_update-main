// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { environment } from './environments/environment';
import { routes } from './app/app.routes'; // ✅ Import your routes

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // ✅ Use your actual routes
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
  ],
});
// This code bootstraps the Angular application with Firebase services.
// It imports necessary modules and initializes Firebase with the provided configuration.