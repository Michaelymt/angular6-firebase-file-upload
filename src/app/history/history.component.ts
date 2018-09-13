import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { AlertService } from '../_services/alert.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, OnDestroy {
  userId: string;
  userEmail: string;
  isLoad: boolean;
  sub: Subscription;
  data : any;

  constructor(
    private authService: AuthService,
    private db: AngularFireDatabase,
    private alertService: AlertService
  ) {
    this.userId = this.authService.authState.uid;
    this.isLoad = false;
  }

  ngOnInit() {
    if (this.userId) {
      this.sub = this.db.list(`/histories/${this.userId}`).snapshotChanges().subscribe((snapshots) => {
        this.data = snapshots.map((item) => {
          const itemValue = item.payload.val();
          return {
            key: item['key'],
            description: itemValue['description'] ? itemValue['description'] : '',
            timestamp: itemValue['timestamp'] ? itemValue['timestamp'] : '',
            time: this.convertToDate(itemValue['timestamp'])
          };
        }).sort((a, b) => {
          return parseFloat(b['timestamp']) - parseFloat(a['timestamp']);
        });
        this.isLoad = true;
      });
    } else {
      this.alertService.error('No Data');
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  formatDate(data: string) {
    if (data.length === 1) {
      data = '0' + data;
    }
    return data;
  }

  convertToDate(timestamp: number) {
    const date = new Date(timestamp);
    let day = date.getDate() + '';
    let month = (date.getMonth() + 1) + '';
    let year = date.getFullYear() + '';
    let hour = date.getHours() + '';
    let minutes = date.getMinutes() + '';
    let seconds = date.getSeconds() + '';

    if (isNaN(parseInt(day, 10)) || isNaN(parseInt(month, 10)) || isNaN(parseInt(year, 10)) ||
      isNaN(parseInt(seconds, 10)) || isNaN(parseInt(minutes, 10)) || isNaN(parseInt(hour, 10))) {
      return 'N/A';
    } else {
      day     = this.formatDate(day);
      month   = this.formatDate(month);
      year    = this.formatDate(year);
      hour    = this.formatDate(hour);
      minutes = this.formatDate(minutes);
      seconds = this.formatDate(seconds);

      return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
    }
  }

}
