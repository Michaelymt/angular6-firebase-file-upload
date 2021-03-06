import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { AuthService } from '../_services/auth.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase/app';
import { AlertService } from '../_services/alert.service';
import { PurehttpService } from '../_services/pure-http.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  data : any;
  userId: string;
  userEmail: string;
  functionUrl: string;
  isLoad: boolean;
  isUpload: boolean;
  sub: Subscription;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFireDatabase,
    private authService: AuthService,
    private alertService: AlertService,
    private pureHttpService: PurehttpService
  ) {
    this.userId = this.authService.authState.uid;
    this.userEmail = this.authService.authState.email;
    this.isLoad = false;
    this.isUpload = false;
    this.functionUrl = environment.functionUrl;
  }

  ngOnInit() {
    if (this.userId) {
      this.sub = this.db.list(`/uploads/${this.userId}`).snapshotChanges().subscribe((snapshots) => {
        this.data = snapshots.map((item) => {
          const itemValue = item.payload.val();
          return {
            key: item['key'],
            storagePath: itemValue['storagePath'] ? itemValue['storagePath'] : '',
            downloadPath: itemValue['downloadPath'] ? itemValue['downloadPath'] : '',
            timestamp: itemValue['timestamp'] ? itemValue['timestamp'] : '',
            name: (itemValue['storagePath'] && itemValue['storagePath'].indexOf('/') > -1) ? itemValue['storagePath'].split('/').pop() : '',
            time: this.convertToDate(itemValue['timestamp'])
          };
        }).filter((item) => {
          return item['timestamp'] && item['storagePath'];
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

  uploadFile() {
    const fileID = 'file_upload';
    const fileUploadEle = <HTMLInputElement>document.getElementById(fileID);
    if (!fileUploadEle ||
      (fileUploadEle && fileUploadEle.value === '')) {
        this.alertService.error('Please select the file to upload');
    } else {
      this.isUpload = true;
      // This currently only grabs item 0, TODO refactor it to grab them all
      for (const selectedFile of [(<HTMLInputElement>document.getElementById(fileID)).files[0]]) {
        const filePath = `/uploads/${Date.now()}_${selectedFile.name}`;
        const task = this.storage.upload(filePath, selectedFile);
        task.snapshotChanges().pipe(
          finalize(() => {
            const fileRef = this.storage.ref(filePath);
            fileRef.getDownloadURL().subscribe((url) => {
              const itemsRef = this.db.list(`/uploads/${this.userId}`);
              itemsRef.push({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                storagePath: filePath,
                downloadPath: url
              });
              const historyRef = this.db.list(`/histories/${this.userId}`);
              historyRef.push({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                description: `${this.userEmail} uploaded ${selectedFile.name} file.`
              });
              this.isUpload = false;
              this.alertService.success('File uploading successful');
            });
          })
        )
        .subscribe();
      }
    }
  }

  downloadFile(data: any, name: string) {
    const bytes = new Uint8Array(data.data);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', name);
    link.click();
  }

  onDownloadFile(downloadPath: string, fileName: string) {
    const objPostData = {
      url: downloadPath
    };
    // let localFunctionUrl = 'http://localhost:5000/test-d7b4a/us-central1';

    this.pureHttpService.callFirebaseFunction(`${this.functionUrl}/getData`, objPostData).subscribe((res: any) => {
      this.downloadFile(res.data, fileName);
      const historyRef = this.db.list(`/histories/${this.userId}`);
      historyRef.push({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        description: `${this.userEmail} downloaded the file, ${fileName}.`
      });
    }, error => {
      console.log('Fail to get the data to download.');
      console.log(error);
    });
  }

  onDeleteFile(key: string, storagePath: string, fileName: string) {
    this.storage.ref(storagePath).delete();
    this.db.list(`/uploads/${this.userId}/${key}`).remove();
    const historyRef = this.db.list(`/histories/${this.userId}`);
    historyRef.push({
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      description: `${this.userEmail} deleted the file, ${fileName}.`
    });
  }

}
