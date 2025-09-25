import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest, LoginResponse } from '../../services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  router = inject(Router);

  constructor(private authService: AuthService, private titleService: Title) {
    this.checkAuth();
    this.titleService.setTitle('Login - Vodafone WhatsApp');
  }

  onLogin() {
    const payload: LoginRequest = { email: this.email, password: this.password };
    console.log('Login payload', payload);

    this.authService.login(payload).subscribe({
      next: (res: LoginResponse) => {
        console.log('Login success:', res);
        this.authService.setToken(res.token); // نخزن التوكن في localStorage
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 0) {
          this.errorMsg = 'Cannot reach backend. Check server connection.';
        } else if (err.status === 403) {
          this.errorMsg = 'Invalid email or password';
        } else {
          this.errorMsg = `Error ${err.status}: ${err.message || err.statusText}`;
        }
      }
    });
  }

  private checkAuth() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
