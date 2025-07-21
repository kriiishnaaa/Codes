import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {
  source: string = '';
  destination: string = '';
  date: string = '';
  flights: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router 
  ) {
    this.route.queryParams.subscribe(params => {
      this.source = params['source'];
      this.destination = params['destination'];
      this.date = params['date'];

      console.log('Params received:', { source:this.source, destination:this.destination, date:this.destination });

      if (this.source && this.destination && this.date) {
        const url = `http://localhost:8081/flights/searchByDetails?source=${this.source}&destination=${this.destination}&date=${this.date}`;
        console.log('Calling URL:', url);

        this.http.get<any[]>(url).subscribe({
          next: (res) => {
            this.flights = res;
          },
          error: (err) => {
            console.error('Error fetching flights:', err);
          }
        });
      }
    });
  }

  bookFlight(flight: any) {
  const accEmail = localStorage.getItem('userEmail');

  if (!accEmail) {
    const confirmLogin = confirm("You need to be logged in to book a flight. Do you want to go to the login page?");
    if (confirmLogin) {
      this.router.navigate(['/login']);
    }
    return;
  }

  this.router.navigate(['/book'], {
    queryParams: {
      flightCode: flight.flightCode,
      accEmail: accEmail
    }
  });
}

}
