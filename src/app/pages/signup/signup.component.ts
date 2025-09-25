import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';import { AuthService, RegisterRequest, UserResponse } from '../../services/auth.service';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    FormsModule, 
    RouterModule, 
    RouterLink, 
    CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email = '';
  phoneNumber = '';
  gender = '';
  password = '';
  errorMsg = '';
  successMsg = '';

  constructor(private authService: AuthService, private router: Router,  private titleService: Title ) {
     this.titleService.setTitle('Sign Up - Vodafone WhatsApp');
  }

onSignup() {
  const payload: RegisterRequest = {
    email: this.email,
    phoneNumber: this.phoneNumber,
    gender: this.gender,
    password: this.password
  };

  console.log('Sending signup request payload:', payload); // log قبل الإرسال

  this.authService.register(payload).subscribe({
    next: (res: UserResponse) => {
      console.log('Signup success response:', res); // log الرد من الباك
      this.successMsg = 'Account created successfully! Redirecting to login...';
      setTimeout(() => this.router.navigate(['/login']), 1000);
    },
    error: (err) => {
      console.error('Signup error:', err); // لو فيه error
      this.errorMsg = 'Failed to create account. Please try again.';
       if (err.status === 0) {
        this.errorMsg = 'Cannot reach backend. Check server connection.';
      } else if (err.status === 403) {
        this.errorMsg = 'Email Or Phone already used';
      } else {
        this.errorMsg = `Error ${err.status}: ${err.message || err.statusText}`;
      }
    }
  });
}

}