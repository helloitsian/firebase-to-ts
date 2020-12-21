# Firebase to Typescript

### Motivations

I wanted a quick way to export my firebase collections to Typescript interfaces.

### Getting Started

_NOTE: This does not support subcollections currently_

Before coding, you need to set up your admin secret credentials through firestore.
[firebase.google.com/docs/admin/setup](https://firebase.google.com/docs/admin/setup)

```
"use strict";
import admin from "firebase-admin";
import generateTsInterfaces from "../src/index.js";
import serviceAccount from "/path/to/firebase/credentials"; // custom path to your firebase creds

// init firebase
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// init firestore
const firestore = firebase.firestore();

// pass in your firestore object, and add exportToFile options.
generateTsInterfaces(firestore, {
  exportToFile: {
    name: "apiInterfaces.ts",
  },
});

// check your output file, and success!
```
