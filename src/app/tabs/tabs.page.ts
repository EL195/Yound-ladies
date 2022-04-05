import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { interval, Subscription } from 'rxjs';
import 'rxjs/add/observable/interval';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit{
  userInfo: string;
  user: any;
  counterSubscription: Subscription;
  

  constructor(
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.userInfo = localStorage.getItem('user');
    this.user = JSON.parse(this.userInfo);
    const counter = Observable.interval(5000);
    this.counterSubscription = counter.subscribe(
      (value) => {
        this.userInfo = localStorage.getItem('user');
        console.log(this.userInfo);
        if(this.userInfo){
          this.user = JSON.parse(this.userInfo);
        }
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
        console.log('Observable complete!');
      }
    );
  }

  ngOnDestroy() {
    this.counterSubscription.unsubscribe();
  }

}
