# angular-sf
Angular SF Project

```
Important!
Latest changes:
Now, Angular CLI by default builds the project to folder "dist/project_name".
So I added the new variable *DIST_PATH* to .env file. The default value of *DIST_PATH* is *dist*.
If you use "@angular/cli": "~1.7.3", you should define this path some like this "dist/project_name"
```

## How use it:
1. Copy gulpfile.js file to the root folder of your project
2. Copy salesforce.service.ts file to the folder services of your Angular project
3. Install dependecies: 
```sh
npm install gulp gulp-zip gulp-jsforce-deploy dotenv gulp-rename gulp-replace gulp-file  --save-dev
```
4. Create file .env in to the root folder of your project and fill it
```js
SF_USERNAME=YOUR_ORG_USERNAME
SF_PASSWORD=YOUR_PASSWORD+TOKEN
LOGIN_URL=https://LOGIN.salesforce.com or https://TEST.salesforce.com
PAGE_NAME=YOUR_PAGE_NAME
RESOURCE_NAME=YourStaticResources
CONTROLLER=YOUR_APEX_CONTROLLER
EXTENSIONS=YOUR_EXTENSIONS
API_VERSION=YourAPIVersion
BASE_HREF=/
DEV_RESOURCES_URL=http://localhost:4200 or other URL
```
5. Add scripts to package.json
```js
"dev": "ng build && gulp rm && gulp build-dev-package && gulp deploy && ng serve",
"prod": "ng build && gulp rm && gulp build-package && gulp deploy"
```
6. Using resources in your HTML templates

Template:
```html
<img class="logo" [src]="getSFResourse('assets/logo2.png')">
```
Component:
```js
import { Component } from '@angular/core';
import { SalesforceService } from './services/salesforce.service';
@Component({
 selector: 'app-home',
 templateUrl: './home.component.html',
 styleUrls: ['./home.component.scss']
})
export class HomeComponent{
 constructor(
   private sfService: SalesforceService
 ) { }
 public getSFResourse = (path: string) => this.sfService.getSFResourse(path);
}
```
7. Using RemoteActions
Component:
```js
import { Component } from '@angular/core';
import { SalesforceService } from './services/salesforce.service';
@Component({
 selector: 'app-home',
 templateUrl: './home.component.html',
 styleUrls: ['./home.component.scss']
})
export class HomeComponent{
 constructor(
   private sfService: SalesforceService
 ) {
  this.sfService.callRemote('SomeController.RemouteActionMethod',
      [JSON.stringify(param_1),JSON.stringify(param_N)], this.successCallback, this.failedCallback);
  }
  private successCallback = (response) => console.log(response)
  private failedCallback = (response) => console.log(response)
}
```
8. Use command `npm run dev` to dev mode. 
Your project will deploy to Salesforce ORG and will take resources from your local dev server.
9. Use command `npm run prod`. 
This command creates the package with page and resources next it will deploy on Salesforce.
