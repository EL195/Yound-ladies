import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
//import * as firebase from 'firebase/app';
//import * from 'firebase/app';
import firebase from 'firebase/compat/app';
import { LoadService } from './../services/load.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { FirebaseApp } from '@angular/fire/compat';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userRef: AngularFirestoreCollection<any>;
  docRef: AngularFirestoreDocument<any>;
  itemsCollection: AngularFirestoreCollection<any[]>;
  usersCollection: AngularFirestoreCollection<any[]>;
  items: Observable<any>;
  users: Observable<any>;
  user : any = [];
  connected : boolean = false;
  visible: boolean = false;
  
  constructor(
    private angularFireAuth: AngularFireAuth,
    private db: AngularFirestore,
    public load:LoadService,
    private toast: ToastService,
    public router: Router,
  ) { 
    
  }


  createUser(value) {
    this.load.present();
    return new Promise<any>((resolve, reject) => {
      this.angularFireAuth.createUserWithEmailAndPassword(value.email, value.password)
          .then(
            res => resolve(res),
            err => reject(err))
    })
  }




  async updatePassword(oldCredentials, newPassword){
    const user = await this.angularFireAuth.currentUser;
    console.log("Current User is : ");
    console.log(user);

    const credential = firebase.auth.EmailAuthProvider.credential(
      oldCredentials.email, 
      oldCredentials.password
  );

    user.reauthenticateWithCredential(credential).then(function() {
      // User re-authenticated.
      console.log("User Reauthenticated");
        user.updatePassword(newPassword).then(function() {
          // Update successful.
          console.log("Password Modified Successfully");
        }).catch(function(error) {
          // An error happened.
          console.log("Password Not Modified");
        });
    }).catch(function(error) {
      // An error happened.
      console.log("User Not Reauthenticated");
    });

  }


  signinUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.angularFireAuth.signInWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err))
    })
  }

  signoutUser() {
    return new Promise<void>((resolve, reject) => {
      if (this.angularFireAuth.currentUser) {
        this.angularFireAuth.signOut()
          .then(() => {
            console.log("Sign out");
            localStorage.clear();
            this.router.navigate(['/login']);
            resolve();
          }).catch(() => {
            reject();
          });
      }
    })
  }

isLoggedIn(){
  return this.angularFireAuth.authState.pipe(first()).toPromise();
}

isAuthentificated() {
  return this.angularFireAuth.authState
}

getCurrentUSer() {
  return this.angularFireAuth.currentUser
}

currentUser(id) {
  console.log(id);
  this.userRef = this.db.collection('users', ref => ref.
  where('id', '==', id) );
  return this.userRef.snapshotChanges().pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data();
      const key = a.payload.doc.id;
      return { key, ...data };
    }))
  );
}

userDetails() {
    return this.angularFireAuth.user
}

enrol(value, id){
  this.userRef = this.db.collection('users');
  if(value.role=="beneficiary"){
      this.visible = true;
  }
  this.userRef.add({
    id : id,
    email : value.email,
    fName : value.name,
    lName : '',
    address : '',
    pays : '',
    region : '',
    ville : '',
    phone : value.phone,
    photoURL : '',
    role : value.role,
    dateCreated : firebase.firestore.Timestamp.fromDate(new Date()),
    createdByID : '',
    createdByName : '',
    visible : this.visible
  });
  this.toast.presentToast('Enregistrement réussi');
  this.load.dismiss();
  this.router.navigate(['/login']);
}

 // Recover password
 PasswordRecover(passwordResetEmail) {
  return new Promise<any>((resolve, reject) => {
    this.angularFireAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(
        res => resolve(res),
        err => reject(err))
  })
}


}
