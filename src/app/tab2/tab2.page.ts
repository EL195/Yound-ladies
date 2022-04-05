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
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{
  userInfo: string;
  user: any;
  searchValue: string = "";
  search : boolean = false;

  chatsCollection: AngularFirestoreCollection<any[]>;
  chats: Observable<any>;
  myChats : any = [];

  usersCollection: AngularFirestoreCollection<any[]>;
  users : Observable<any>;
  info : any[];

  age_filtered_items: Array<any>;
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
        //this.getChatsBeneficiary(this.user.id);
      }
      else if(this.user.role=="advisor"){
        //this.getChatsAdmin();
      }
      else{
        this.getUsers();
      }
    }
    else{
      this.router.navigate(['/login']);
    }
  }

  getItems(event){
      console.log(event.detail.data);
  }


  getUsers() {
    this.usersCollection = this.db.collection('users', ref => ref.where('role', '==', 'advisor'));
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
      this.load.dismiss();
      this.goalList = da;
      this.loadedGoalList = da;
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
    this.search = true;
    console.log(this.search)
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

  validate(item){
    //console.log(item.id);
    this.router.navigate(['/user', item.id]);
  }

}
