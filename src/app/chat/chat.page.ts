import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { finalize, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoadService } from '../services/load.service';
import { ToastService } from '../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  userInfo: string;
  user: any;
  text : any;
  chatRef: AngularFirestoreDocument<any>;

  chatsCollection: AngularFirestoreCollection<any[]>;
  chats: Observable<any>;
  myChats : any = [];

  chatCollection: AngularFirestoreCollection<any[]>;
  chat: Observable<any>;
  myChat : any = [];

  constructor(
    public router: Router,
    public alertCtrl: AlertController,
    public load:LoadService,
    private toast: ToastService,
    private db: AngularFirestore,
    private auth: AuthService,
    private route: ActivatedRoute,
    public actionSheetController: ActionSheetController,
    private camera: Camera,
    private storage: AngularFireStorage,
  ) { }

  ngOnInit() {
    this.load.present();
    this.userInfo = localStorage.getItem('user');
    if(this.userInfo){
      this.user = JSON.parse(this.userInfo);
      console.log("connected")
      if(this.user.role=="beneficiary"){
        this.route.paramMap.subscribe(paramMap => {
          let id = paramMap.get('id');
           this.getChatsAdvisor(id);
         });
      }
      else if(this.user.role=="advisor"){
        this.route.paramMap.subscribe(paramMap => {
          let id = paramMap.get('id');
           this.getChatsAdvisor(id);
         });
      }
      else{
        this.route.paramMap.subscribe(paramMap => {
          let id = paramMap.get('id');
           this.getChatsAdmin(id);
         });
      }
    }
    else{
      this.router.navigate(['/login']);
    }
  }

  getChatsAdvisor(id) {
    this.chatsCollection = this.db.collection('chats', ref => ref.where('idChat', '==', id));
    this.chats = this.chatsCollection.snapshotChanges().pipe(
    map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      });
      })
    );
    this.chats.subscribe(da=>{
      this.myChats = da[0];
      this.load.dismiss();
      this.getChats(this.myChats.idChat);
      console.log(da);
    })
  }

  getChats(idChat: any) {
    this.chatCollection = this.db.collection('chat', ref => ref
    .where('idChat', '==', idChat)
    .orderBy('dateCreated', 'asc'));
    this.chat = this.chatCollection.snapshotChanges().pipe(
    map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      });
      })
    );
    this.chat.subscribe(da=>{
      console.log(da);
      this.myChat = da;
    })
  }

  async edit(chat){
    const alert = await this.alertCtrl.create({
      header: 'Voulez vous vraiment modifier ce message ?',
      inputs: [
        {
          name: 'text',
          type: 'textarea',
          placeholder : chat.text
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
          text: 'Modifier',
          handler: (data) => {
            console.log('Confirm Ok');
            let url = "chat"
            this.chatRef = this.db.doc(`${url}/${chat.id}`);
            this.chatRef.update({
              text : data.text
            });
            //this.load.present();
            this.getChats(chat.idChat) ;
          }
        }
      ]
    });

    await alert.present();
  }



  async delet(chat){
    const alert = await this.alertCtrl.create({
      header: 'Voulez vous vraiment supprimer ce message ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Oui supprimer',
          handler: (data) => {
            console.log('Confirm Ok');
            let url = "chat"
            this.chatRef = this.db.doc(`${url}/${chat.id}`);
            this.chatRef.update({
              visible : false
            });
            //this.load.present();
            this.getChats(chat.idChat) ;
          }
        }
      ]
    });

    await alert.present();
  }

  getChatsAdmin(id) {
    this.chatsCollection = this.db.collection('chats', ref => ref.where('idChat', '==', id));
    this.chats = this.chatsCollection.snapshotChanges().pipe(
    map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      });
      })
    );
    this.chats.subscribe(da=>{
      this.myChats = da[0];
      this.load.dismiss();
      console.log(da);
    })
  }

  validate(myChats){
    this.router.navigate(['/validate', myChats.idChat]);
  }
  
  getChatsBeneficiary(id: any) {
    throw new Error('Method not implemented.');
  }

  send(item){
    console.log(this.text)
    console.log(item)
 this.db.collection("chat").add({
      text: this.text,
      url: "",
      you: item.assignToName,
      type : "text",
      youId: item.assignTo,
      youUrl: item.assignToUrl,
      me: item.createdByname,
      meId: this.user.id,
      meUrl : this.user.photoURL,
      owner: this.user.id,
      delete: 0,
      dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
      idChat: item.idChat,
      visible: true
    });
    this.text = "";
    this.getChats(item.idChat) ;
  } 


  async media(item) {
    const actionSheet = await this.actionSheetController.create({
      //header: 'Service client',
      header: "Envoyer une image",
      cssClass : 'serviceclient',
        buttons: [{
        text: 'Choisir dans la galerie',
        role: 'destructive',
        icon: 'call',
        handler: () => {
          console.log('Delete clicked');
        }
      }, 
      {
        text: 'Prendre une photo',
        icon: 'mail',
        handler: () => {
          console.log('Share clicked');
        }
      }
/*       {
        text: 'www.skiptheline.ca',
        icon: 'globe',
        handler: () => {
          console.log('Favorite clicked');
        }
      } */
    ]
    });
    await actionSheet.present();
  }

  takePic(item){
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType : this.camera.PictureSourceType.PHOTOLIBRARY
    }

    this.camera.getPicture(options).then((imageData) => {
      //console.log(imageData);
      const num = 'img_' + Math.random().toString(36).substr(2, 9);
      let Pic = 'data:image/jpeg;base64,' + imageData;
      const filePath = `profile_photos/${num}.jpeg`;
      //alert(filePath);
      const ref = this.storage.ref(filePath);
      const task = ref.putString(Pic, 'data_url');
      // get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
        ref.getDownloadURL().subscribe(url => {
          //this.imgPic = (url); // <-- do what ever you want with the url..
          this.saveImage(url, item);
          });
        })
      ).subscribe();

     }, (err) => {
      // Handle error this.imgPic = ref.getDownloadURL()
      console.log(err);
     });

  }

  choosePic(item){
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType : this.camera.PictureSourceType.PHOTOLIBRARY
    }

    this.camera.getPicture(options).then((imageData) => {
      //console.log(imageData);
      const num = 'img_' + Math.random().toString(36).substr(2, 9);
      let Pic = 'data:image/jpeg;base64,' + imageData;
      const filePath = `profile_photos/${num}.jpeg`;
      //alert(filePath);
      const ref = this.storage.ref(filePath);
      const task = ref.putString(Pic, 'data_url');
      // get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
        ref.getDownloadURL().subscribe(url => {
          //this.imgPic = (url); // <-- do what ever you want with the url..
          this.saveImage(url, item);
          });
        })
      ).subscribe();

     }, (err) => {
      // Handle error this.imgPic = ref.getDownloadURL()
      console.log(err);
     });

  }

  saveImage(url, item){
    this.db.collection("chat").add({
      text: "",
      url: url,
      type : "image",
      you: item.assignToName,
      youId: item.assignTo,
      youUrl: item.assignToUrl,
      me: item.createdByname,
      meId: this.user.id,
      meUrl : this.user.photoURL,
      owner: this.user.id,
      delete: 0,
      dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
      idChat: item.idChat,
      visible: true
    });
    this.getChats(item.idChat) ;
  }

}
