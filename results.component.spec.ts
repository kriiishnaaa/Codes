import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsComponent } from './results.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Location } from '@angular/common';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ResultsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              source: 'Delhi',
              destination: 'Mumbai',
              date: '2025-08-15'
            })
          }
        },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set query params and call the backend API', () => {
    const req = httpMock.expectOne(
      'http://localhost:8084/flights/searchByDetails?source=Delhi&destination=Mumbai&date=2025-08-15'
    );
    expect(req.request.method).toBe('GET');

    req.flush([
      { flightCode: 'IND123', airline: 'Indigo', departureTime: '08:00', arrivalTime: '10:30' }
    ]);

    expect(component.flights.length).toBe(1);
    expect(component.flights[0].flightCode).toBe('IND123');
  });

  it('should handle HTTP error response', () => {
    const consoleSpy = spyOn(console, 'error');

    const req = httpMock.expectOne(
      'http://localhost:8084/flights/searchByDetails?source=Delhi&destination=Mumbai&date=2025-08-15'
    );

    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching flights:',
      jasmine.objectContaining({ status: 500 })
    );
  });

  it('should redirect to login page if user is not logged in and confirms', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(localStorage, 'getItem').and.returnValue(null);

    const dummyFlight = { flightCode: 'TEST123' };
    component.bookFlight(dummyFlight);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not navigate if user is not logged in and cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(localStorage, 'getItem').and.returnValue(null);

    const dummyFlight = { flightCode: 'TEST123' };
    component.bookFlight(dummyFlight);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to booking page if user is logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue('user@example.com');

    const dummyFlight = { flightCode: 'FL123' };
    component.bookFlight(dummyFlight);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/book'], {
      queryParams: {
        flightCode: 'FL123',
        accEmail: 'user@example.com'
      }
    });
  });

  it('should return correct logo path for known airline', () => {
    const result = component.getAirlineLogo('Indigo');
    expect(result).toBe('IndiGo-Logo.png');
  });

  it('should return default logo for unknown airline', () => {
    const result = component.getAirlineLogo('UnknownAir');
    expect(result).toBe(component.airlineLogos['default']);
  });

  it('should calculate correct duration for same-day flight', () => {
    const duration = component.getDuration('10:00', '13:30');
    expect(duration).toBe('3h 30m');
  });

  it('should calculate correct duration for overnight flight', () => {
    const duration = component.getDuration('22:00', '01:30');
    expect(duration).toBe('3h 30m');
  });
});
