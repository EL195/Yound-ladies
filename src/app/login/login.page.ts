import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
//import * as firebase from 'firebase/app';
//import * from 'firebase/app';
import firebase from 'firebase/compat/app';
import { LoadService } from './../services/load.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email : any;
  password : any;

  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  
  userRef: AngularFirestoreCollection<any>;
  docRef: AngularFirestoreDocument<any>;
  itemsCollection: AngularFirestoreCollection<any[]>;
  usersCollection: AngularFirestoreCollection<any[]>;
  items: Observable<any>;
  users: Observable<any>;
  user : any = [];


  constructor(
    public router: Router,
    private auth: AuthService,
    private toast: ToastService,
    private db: AngularFirestore,
    public load:LoadService,
    public alertCtrl: AlertController
  ) { }

  ngOnInit() {
    //this.load.dismiss();
  }

  register(){
    this.router.navigate(['/register']);
  }

  login(){
    let value = {
      email : this.email,
      password : this.password
    }
    this.signIn(value);
  }

  signIn(value) {
    this.load.present();
    this.auth.signinUser(value)
      .then((response) => {
        console.log(response)
        console.log(response);
        //this.router.navigateByUrl('dashboard');
        this.checkUser(response.user.email);
      }, error => {
          this.toast.presentToast("Mot de passe ou email inccorect");
          this.load.dismiss();
      })
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
}

  checkUser(email){
    console.log(email);
    this.usersCollection = this.db.collection('users', ref => ref.where('email', '==', email));
    this.users = this.usersCollection.snapshotChanges().pipe(
    map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      });
      })
    );
    this.users.subscribe(da=>{
      this.user = da[0];
      console.log(da[0])
      if(this.user.visible == true){
        this.load.dismiss();
        this.toast.presentToast("Connexion réussie!");
        localStorage.setItem('user', JSON.stringify(this.user));
        this.router.navigate(['/tabs/tab1']);
      }
      else{
        this.load.dismiss();
        this.toast.presentToast("Désolé votre compte est innactif.");
      }
     // return this.user;
    })
    return this.user;
  }

  async reset() {
    const prompt = await this.alertCtrl.create({
      message: "Veuillez entrer votre mail afin d'obtenir un email de réinitialisation",
      inputs: [
        {
          name: 'email',
          placeholder: 'hello@micheltanga.com'
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Envoyer',
          handler: data => {
            this.auth.PasswordRecover(data.email)
            .then((response) => {
              console.log(response);
              this.toast.presentToast("Email de réinitialisation envoyé.");
            }, error => {
                this.toast.presentToast("Ce compte n'existe pas.");
                this.load.dismiss();
            })
          }
        }
      ]
    });
    prompt.present();
  }




}
