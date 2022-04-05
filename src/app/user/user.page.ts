import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoadService } from '../services/load.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  user: any = {};

  usersCollection: AngularFirestoreCollection<any[]>;
  profileRef: AngularFirestoreDocument<any>;
  users : Observable<any>;
  info : any;
  id: string;

  constructor(
    public router: Router,
    public alertCtrl: AlertController,
    public load:LoadService,
    private toast: ToastService,
    private db: AngularFirestore,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}




  ngOnInit(): void {
    this.load.present();
    this.route.paramMap.subscribe(paramMap => {
      let id = paramMap.get('id');
      this.getUsers(id);
     });
  }   
  

  getUsers(id) {
    this.usersCollection = this.db.collection('users', ref => ref.where('id', '==', id));
    this.users = this.usersCollection.snapshotChanges().pipe(
    map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        this.id = a.payload.doc.id;
        id = a.payload.doc.id;
        return {id, ...data };
      });
      })
    );
    this.users.subscribe(da=>{
      console.log(this.id);
      this.user = da[0];
      this.load.dismiss();
    })
  }

  validate(item){
    //console.log(item.id);
    this.router.navigate(['/user', item.id]);
  }

  updateProfile(type, item){
    console.log(this.id);
    let url ="users";
    if(type=="active"){
      this.profileRef = this.db.doc(`${url}/${this.id}`);
      this.profileRef.update({
        visible : true
      });
      this.load.present();
      this.getUsers(item.id);
    }
    else{
      this.profileRef = this.db.doc(`${url}/${this.id}`);
      this.profileRef.update({
        visible : false
      });
      this.load.present();
      this.getUsers(item.id);
    }

  }

}
