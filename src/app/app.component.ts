import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    public splashScreen : SplashScreen,
    private platform: Platform,
  ) {
    this.platform.ready().then(async () => {
      setTimeout(()=>{
        this.splashScreen.hide()
       }, 2000)
 })
  }
}
