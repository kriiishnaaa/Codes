import { Component, DoCheck, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, DoCheck {
  isAdmin = false;
  source: string = '';
  destination: string = '';
  date: string = '';
  isLoggedIn = false;
  userEmail: string | null = ''; 
  today: string = new Date().toISOString().split('T')[0];
  isPastDateSelected: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngDoCheck() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  searchFlights() {

    this.isPastDateSelected = this.date < this.today;

    if(this.isPastDateSelected){
      return;
    }

    this.router.navigate(['/results'], {
      queryParams: {
        source: this.source,
        destination: this.destination,
        date: this.date
      }
    });
  }

  logout() {
    if(confirm("Do you really want to Logout??"))
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }
  
  ngOnInit() {
  this.isLoggedIn = this.authService.isLoggedIn();
  this.userEmail = this.authService.getUserEmail();

  const token = this.authService.getToken();
  if (token) {
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      this.isAdmin = decoded?.role === 'ADMIN';
    } catch (e) {
      console.error('Failed to decode token:', e);
      this.isAdmin = false;
    }
  }
}


}
