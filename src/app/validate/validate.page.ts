import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoadService } from '../services/load.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-validate',
  templateUrl: './validate.page.html',
  styleUrls: ['./validate.page.scss'],
})
export class ValidatePage implements OnInit {
  userInfo: string;
  user: any;

  chatsCollection: AngularFirestoreCollection<any[]>;
  usersCollection: AngularFirestoreCollection<any[]>;
  users : Observable<any>;
  info : any[];

  age_filtered_items: Array<any>;
  name_filtered_items: Array<any>;
  public goalList: any[];
  public loadedGoalList: any[];

  chats: Observable<any>;
  myChats : any = [];
  postChat: string;
  profileRef: AngularFirestoreDocument<any>;



  constructor(
    public router: Router,
    public alertCtrl: AlertController,
    public load:LoadService,
    private toast: ToastService,
    private db: AngularFirestore,
    private auth: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.load.present();
    this.userInfo = localStorage.getItem('user');
    if(this.userInfo){
      this.user = JSON.parse(this.userInfo);
      console.log("connected")
      if(this.user.role=="admin"){
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


  getChatsAdmin(id) {
    this.chatsCollection = this.db.collection('chats', ref => ref.where('idChat', '==', id));
    this.chats = this.chatsCollection.snapshotChanges().pipe(
    map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        this.postChat = a.payload.doc.id;
        return { id, ...data };
      });
      })
    );
    this.chats.subscribe(da=>{
      this.myChats = da[0];
      this.getUsers();
    })
  }

  initializeItems(): void {
    this.info = this.loadedGoalList;
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
    //console.log(this.search)
    //console.log(this.goalList);
    this.info = this.goalList.filter(currentGoal => {
      if (currentGoal.fName && searchTerm) {
        //console.log(currentGoal.fName)
        if (currentGoal.fName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          console.log(currentGoal.fName)
          return true;
        }
        //console.log(currentGoal.fName)
        return false;
      }
    });
  }

  getUsers() {
    this.usersCollection = this.db.collection('users', ref => ref
    .where('visible', '==', true)
    .where('role', '==', 'advisor'));
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
      this.info = da;
      this.goalList = da;
      this.loadedGoalList = da;
      console.log(da);
      this.load.dismiss();
    })
  }

  async validate(user) {
    const prompt = await this.alertCtrl.create({
      message: "Voulez-vous assigner cette discussion à "+user.fName+" ?",
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Oui assigner',
          handler: data => {
            let url = "chats"
            this.profileRef = this.db.doc(`${url}/${this.postChat}`);
            this.profileRef.update({
              assignToUrl : user.photoURL,
              assignToName :  user.fName,
              assignTo :  user.id,
              validateTo : this.user.id,
              validateToName : this.user.fName,
              validateToUrl :this.user.photoURL,
              visible : true
            });
            this.router.navigate(['/chat', this.myChats.idChat]);
          }
        }
      ]
    });
    prompt.present();
  }

  async unValidate(user) {
    const prompt = await this.alertCtrl.create({
      message: "Voulez-vous retirer cette discussion à "+user.fName+" ?",
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Oui retirer',
          handler: data => {
            let url = "chats"
            this.profileRef = this.db.doc(`${url}/${this.postChat}`);
            this.profileRef.update({
              assignToUrl : '',
              assignToName :  '',
              assignTo : '',
              validateTo : this.user.id,
              validateToName : this.user.fName,
              validateToUrl :this.user.photoURL,
              visible : true
            });
          }
        }
      ]
    });
    prompt.present();
  }


}
