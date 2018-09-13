// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyB328WgtnZgwmDDQ_5uMJTba4goqNcoOFo",
    authDomain: "test-d7b4a.firebaseapp.com",
    databaseURL: "https://test-d7b4a.firebaseio.com",
    projectId: "test-d7b4a",
    storageBucket: "test-d7b4a.appspot.com",
    messagingSenderId: "79073754666"
  },
  functionUrl: 'https://us-central1-test-d7b4a.cloudfunctions.net'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
