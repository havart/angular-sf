import { Injectable } from '@angular/core';

declare class Visualforce {
  static remoting: { Manager: { invokeAction: any } };
}

@Injectable()
export class SalesforceService {

  public getSFResourse = (path: string) => `${window['_VfResourses']}/${path}`;

  public callRemote(methodName: string, params: string[], resolve, reject, config?: any) {
    Visualforce.remoting.Manager.invokeAction(
      methodName,
      ...params,
      function (result, event) {
        try {
          result = JSON.parse(result);
        } catch (error) {
          reject(error);
        }
        if (event.status) {
          if (result.type === 'success') {
            resolve(result);
          } else {
            reject(result);
          }
        } else {
          reject(result);
        }
      },
      config || { buffer: false, escape: false }
    );
  }

}
