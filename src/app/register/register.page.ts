import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { LoadService } from '../services/load.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
    name : any;
    email : any;
    phone : any;
    password : any;
    role : any;
    phoneNumber : any;

    successMsg: string = '';
    errorMsg: string = '';

    passwordType: string = 'password';
    passwordIcon: string = 'eye-off';


  constructor(
    private auth: AuthService,
    private toast: ToastService,
    public router: Router,
    public alertCtrl: AlertController,
    public load:LoadService
  ) { }

  ngOnInit() {
  }



  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
}


  register(){
    console.log(this.role)
   // console.log(this.phoneNumber.internationalNumber)
    if(this.role == "" || this.role == null || this.role ==undefined) {
        this.toast.presentToast("Veuillez choisir un rôle");
    }
    else if (this.name == "" || this.name == null || this.name ==undefined) {
      this.toast.presentToast("Veuillez renseigner votre nom");
    }
    else if (this.email == "" || this.email == null || this.email ==undefined) {
      this.toast.presentToast("Veuillez renseigner votre email");
    }
    else if (this.phoneNumber == "" || this.phoneNumber == null || this.phoneNumber ==undefined) {
      this.toast.presentToast("Veuillez renseigner votre numéro de téléphone");
    }
    else if (this.password == "" || this.password == null || this.password ==undefined) {
      this.toast.presentToast("Veuillez renseigner votre mot de passe");
    }
    else{
      //console.log(this.phoneNumber);
      this.registering();
    }
  }


  async registering() {
    const prompt = await this.alertCtrl.create({
      message: "En vous insrivant vous acceptez nos termes et conditions de confidentialités",
      buttons: [
        {
          text: 'En savoir plus',
          handler: data => {
            this.router.navigate(['/term']);
          }
        },
        {
          text: 'J\'accepte',
          handler: data => {
            //this.load.present();
            let value = {
              name : this.name,
              email : this.email,
              phone : this.phoneNumber.internationalNumber,
              password : this.password,
              role : this.role
           } 
           console.log(value)
           this.name = "";
           this.email = "";
           this.phoneNumber = "";
           this.password = "";
           this.role = "";
           this.signUp(value);
          }
        }
      ]
    });
    prompt.present();
  }


  signUp(value) {
    this.auth.createUser(value)
      .then((response) => {
        console.log(response);
        console.log(response.user.uid);
        this.load.dismiss();
        this.auth.enrol(value, response.user.uid)
      }, error => {
        this.errorMsg = error.message;
        this.successMsg = "";
        console.log(error)
        this.load.dismiss();
      })
  }

  login(){
    this.router.navigate(['/login']);
  }
}
