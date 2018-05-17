import { Injectable } from '@angular/core';

declare class Visualforce {
  static remoting: { Manager: { invokeAction: any } };
}

@Injectable()
export class SalesforceService {

  public getSFResource = (path: string) => `${window['_VfResources']}/${path}`;

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
            resolve(result);
        } else {
          reject(result);
        }
      },
      config || { buffer: false, escape: false }
    );
  }

}
