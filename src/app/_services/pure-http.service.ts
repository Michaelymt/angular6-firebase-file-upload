import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

// Import RxJs required methods
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PurehttpService {
  options: Object;
  returnValue: any; // for a unit test

  constructor(private httpClient: HttpClient) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
    this.options = { hearders: headers };
  }

  // start checking sensor status
  callFirebaseFunction(strUrl: string, objPostData: Object = {}) {
    return this.httpClient.post(strUrl, objPostData, this.options)
      .pipe(
        catchError((error: any) => this.handleError(error))
      );
  }

  handleError(error: any) {
    const errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Observable.throw(errMsg);
  }
}
