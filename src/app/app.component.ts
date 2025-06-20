import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterModule, CommonModule, ToastComponent],
  standalone: true,
})
export class AppComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  title = 'doseninja';
  isMenuOpen = false;
  isDarkMode = false;
  isLoggedIn = false;
  userEmail: string | null = null; // ✅ Added for personalized greeting

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userEmail = user?.email || null; // ✅ Capture user's email
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  signOut(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
