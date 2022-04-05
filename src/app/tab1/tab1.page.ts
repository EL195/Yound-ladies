import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoadService } from '../services/load.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  userInfo: string;
  user: any;

  chatsCollection: AngularFirestoreCollection<any[]>;
  chats: Observable<any>;
  myChats : any = [];

  name_filtered_items: Array<any>;
  public goalList: any[];
  public loadedGoalList: any[];

  constructor(
    public router: Router,
    public alertCtrl: AlertController,
    public load:LoadService,
    private toast: ToastService,
    private db: AngularFirestore,
    private auth: AuthService,
  ) {}



  ngOnInit(): void {
  this.load.present();
    this.userInfo = localStorage.getItem('user');
    if(this.userInfo){
      this.user = JSON.parse(this.userInfo);
      console.log("connected")
      if(this.user.role=="beneficiary"){
        this.getChatsBeneficiary(this.user.id);
      }
      else if(this.user.role=="advisor"){
        this.getChatsAdvisor();
      }
      else{
        this.getChatsAdmin();
      }
    }
    else{
      this.router.navigate(['/login']);
    } 
  }
  async checkUser(){
    const user = await this.auth.isLoggedIn()
        if (user) {
          console.log("connecté");
        }
  }

  profil(){
    this.router.navigate(['/tabs/tab3']);
  }

  initializeItems(): void {
    this.myChats = this.loadedGoalList;
  }

  filterList(evt) {
    this.initializeItems();
    const searchTerm = evt.srcElement.value;
   // console.log(searchTerm)
    if (!searchTerm) {
      return;
    }
    console.log(searchTerm)
    //this.search = true;
   // console.log(this.search)
    //console.log(this.goalList);
    this.myChats = this.goalList.filter(currentGoal => {
      if (currentGoal.title && searchTerm) {
        //console.log(currentGoal.fName)
        if (currentGoal.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          console.log(currentGoal.title)
          return true;
        }
        //console.log(currentGoal.fName)
        return false;
      }
    });
  }

  getChatsAdvisor() {
  this.chatsCollection = this.db.collection('chats', ref => ref.where('assignTo', '==', this.user.id));
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
      this.myChats = da;
      this.goalList = da;
      this.loadedGoalList = da;
      this.load.dismiss();
    })
  }

  adminChat(item){
    //console.log(item);
    this.router.navigate(['/chat', item.idChat]);


  }

  getChatsBeneficiary(user){
    this.chatsCollection = this.db.collection('chats', ref => ref.where('createdBy', '==', user));
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
      this.myChats = da;
      this.goalList = da;
      this.loadedGoalList = da;
      this.load.dismiss();
      //console.log(da);
    })
  }

  getChatsAdmin(){
    this.chatsCollection = this.db.collection('chats');
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
      this.myChats = da;
      this.goalList = da;
      this.loadedGoalList = da;
      this.load.dismiss();
      //console.log(da);
    })
  }


  login(){
    this.router.navigate(['/login']);
  }

  async create() {
    const prompt = await this.alertCtrl.create({
      message: "Veuillez entrer le titre de votre besoin suivi de sa description",
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Le tire de votre besoin ici'
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Décrivez votre besoin ici'
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
          text: 'Démarrer',
          handler: data => {
            this.createChat(data);
          }
        }
      ]
    });
    prompt.present();
  }


  createChat(data: any) {
    this.db.collection("chats").add({
      title: data.title,
      description: data.description,
      createdBy: this.user.id,
      createdByUrl: this.user.photoURL,
      createdByname: this.user.fName,
      resvolve: false,
      assignTo: "",
      assignToName: "",
      assignToUrl: "",
      validateToName: "",
      validateToUrl: "",
      validateTo: "",
      dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
      idChat: 'chat_' + Math.random().toString(36).substr(2, 9),
      visible: false
    });
    
  }

  myChat(item){
    if(item.visible == false){
      this.toast.presentToast("Cette discussion est en attente de validation");
    }
    else{
      this.router.navigate(['/chat', item.idChat]);
    }
  }

  logout(){
    this.auth.signoutUser();

  }



}
