import {
  getDomainName
} from 'dapp-browser';

import {
  Injectable,
  Component, OnInit, Input,            // @angular/core
  Validators, FormBuilder, FormGroup,  // @angular/forms
  DomSanitizer
} from 'angular-libs';

import {
  EvanBCCService,
  EvanBcService,
  EvanCoreService,
  QueueDispatcher,
  QueueSequence,
  SingletonService,
  EvanDescriptionService,
} from 'angular-core';

import {
  translations
} from '../i18n/registry';

/**************************************************************************************************/

@Injectable()
export class UAVDispatcherService {
  constructor(
    public singleton: SingletonService,
    public core: EvanCoreService,
    public bcc: EvanBCCService,
    public descriptionService: EvanDescriptionService
  ) {
    return singleton.create(UAVDispatcherService, this);
  }
}

export const UAVDispatcher = new QueueDispatcher(
  [
    new QueueSequence(
      '_uav.dispatcher.title',
      '_uav.dispatcher.description',
      async (service: UAVDispatcherService, queueEntry: any) => {
        const entries = queueEntry.data;
        for (let entry of entries) {
          console.dir(entry);
        }
      }
    )
  ],
  translations,
  'UAVDispatcherService'
);
