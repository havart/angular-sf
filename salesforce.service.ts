import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare class Visualforce {
    static remoting: { Manager: { invokeAction: any } };
}

/**
 * interface RemoteActionConfig:
 *
 * buffer - Boolean	Whether to group requests executed close to each other in time into a single request.
 * The default is true. JavaScript remoting optimizes requests that are executed close to each other in time and groups
 * the calls into a single request.
 * This buffering improve the efficiency of the overall request-and-response cycle,
 * but sometimes it’s useful to ensure all requests execute independently.
 *
 * escape - Boolean	Whether to escape the Apex method’s response. The default is true.
 * timeout	Integer	The timeout for the request, in milliseconds.
 * The default is 30,000 (30 seconds). The maximum is 120,000 (120 seconds, or 2 minutes).
 */
interface RemoteActionConfig {
    buffer: boolean;
    escape?: boolean;
    timeout?: number;
}

@Injectable({
    providedIn: 'root'
})

export class SalesforceService {

    public getResource = (path: string) => `${window['_VfResources']}/${path}`;

    /**
     * @method remoteAction
     * @param methodPath - ControllerName.RemoteActionMethodName
     * @param params - Use the parameters as convenient for you
     * @param config - Configuration parameters of remote action
     */
    public remoteAction(methodPath: string, params: any, config?: RemoteActionConfig): Observable<any> {
        return new Observable (observer  => {
            Visualforce.remoting.Manager.invokeAction(
                methodPath,
                ...params,
                (result, event) => {
                    if (event.status) {
                        observer.next(result);
                    } else {
                        observer.error(result);
                    }
                    observer.complete();
                },
                config || { buffer: false, escape: false }
            );
        });
    }
}
