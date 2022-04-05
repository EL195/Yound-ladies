import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoadService } from '../services/load.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  user: any = {};
  usersCollection: AngularFirestoreCollection<any[]>;
  profileRef: AngularFirestoreDocument<any>;
  users : Observable<any>;
  info : any;
  id: string;
  userInfo: string;
  editUser : any = {};
  edit : boolean = false;
  profile: Observable<any[]>;
  imgPic : Observable<any>;


  constructor(
    public router: Router,
    public alertCtrl: AlertController,
    public load:LoadService,
    private db: AngularFirestore,
    private auth: AuthService,
    private route: ActivatedRoute,
    private camera: Camera,
    private storage: AngularFireStorage,
    private alertController : AlertController
  ) {}


  ngOnInit(): void {
    this.load.present();
    this.userInfo = localStorage.getItem('user');
    if(this.userInfo){
      this.user = JSON.parse(this.userInfo);
      this.getUsers(this.user.id);
    }
    else{
      this.router.navigate(['/login']);
    }
  }



  editPassword(){
    this.editPasswordPrompt()
  }

  editProfile(profile){
    console.log(profile.value);
    let url = "users";
    this.profileRef = this.db.doc(`${url}/${this.id}`);
    this.profileRef.update({ 
      email : this.user.email,
      fName : this.user.fName,
      lName : this.user.lName,
      pays : this.user.pays,
      region : this.user.region,
      ville : this.user.ville,
      address : this.user.address,
      phone : this.user.phone,
      });
    this.edit = false; 
    this.router.navigate(['/tabs/tab3']);
    }

  async editPasswordPrompt() {
    const alert = await this.alertController.create({
      header: 'Changer Mot De Passe!',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder : 'Mail'
        },
        {
          name: 'oldPassword',
          type: 'password',
          placeholder : 'Ancien Mot De Passe'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder : 'Nouveau Mot De Passe'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok');
            if(data.oldPassword.trim() != ''){
              console.log('New Password : ' + data.newPassword);
              let credentials = { "email" : data.email, "password" : data.oldPassword }
              this.auth.updatePassword(credentials, data.newPassword)
            }
          }
        }
      ]
    });

    await alert.present();
  }

  logOut(){
    this.auth.signoutUser();
  }

  takePic(){
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType : this.camera.PictureSourceType.PHOTOLIBRARY
    }

    this.camera.getPicture(options).then((imageData) => {
      //console.log(imageData);
      let Pic = 'data:image/jpeg;base64,' + imageData;
      const filePath = `profile_photos/${this.id}.jpeg`;
      //alert(filePath);
      const ref = this.storage.ref(filePath);
      const task = ref.putString(Pic, 'data_url');
      // get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
        ref.getDownloadURL().subscribe(url => {
          //this.imgPic = (url); // <-- do what ever you want with the url..
          this.updateProfilePhoto(url);
          });
        })
      ).subscribe();

     }, (err) => {
      // Handle error this.imgPic = ref.getDownloadURL()
      console.log(err);
     });

  }

  updateProfilePhoto(url){
    let urlUser ="users";
    this.profileRef = this.db.doc(`${urlUser}/${this.id}`);
    this.profileRef.update({
      photoURL : url
    });
    this.load.present();
    this.getUsers(this.user.id);
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

}
