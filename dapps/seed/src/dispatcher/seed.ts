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
export class SeedDispatcherService {
  constructor(
    public singleton: SingletonService,
    public core: EvanCoreService,
    public bcc: EvanBCCService,
    public descriptionService: EvanDescriptionService
  ) {
    return singleton.create(SeedDispatcherService, this);
  }
}

export const SeedDispatcher = new QueueDispatcher(
  [
    new QueueSequence(
      '_seeddispatcher.title',
      '_seeddispatcher.description',
      async (service: SeedDispatcherService, queueEntry: any) => {
        const entries = queueEntry.data;
        for (let entry of entries) {
          console.dir(entry);
        }
      }
    )
  ],
  translations,
  'SeedDispatcherService'
);
