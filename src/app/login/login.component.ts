import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      try {
        const formData = this.loginForm.value;
        localStorage.setItem("username", formData.username);

        this.router.navigate(['/chat']).then(r => {});

      } catch (error) {
        console.error('Ошибка сохранения данных:', error);
      }
    }
  }
}
