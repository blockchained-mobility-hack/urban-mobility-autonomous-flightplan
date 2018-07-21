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


  public modType;
  public propType;

  constructor(
    public singleton: SingletonService,
    public core: EvanCoreService,
    public bcc: EvanBCCService,
    public descriptionService: EvanDescriptionService
  ) {

    this.modType = {
      "Set": "0xd2f67e6aeaad1ab7487a680eb9d3363a597afa7a3de33fa9bf3ae6edcb88435d",
      "Remove": "0x8dd27a19ebb249760a6490a8d33442a54b5c3c8504068964b74388bfe83458be"
    };
    this.propType = {
      "Entry": "0x84f3db82fb6cd291ed32c6f64f7f5eda656bda516d17c6bc146631a1f05a1833",
      "ListEntry": "0x7da2a80303fd8a8b312bb0f3403e22702ece25aa85a5e213371a770a74a50106"
    };
      
    return singleton.create(UAVDispatcherService, this);
  }
}

export const UAVDispatcher = new QueueDispatcher(
  [
    new QueueSequence(
      '_uav.dispatcher.title',
      '_uav.dispatcher.description',
      async (service: UAVDispatcherService, queueEntry: any) => {
        const uavs = queueEntry.data;
        const uavDescription = await service.descriptionService.getDescription(`uavdigitaltwin.${ getDomainName() }`, true);
        for (let uav of uavs) {
          const digitalTwin = await service.bcc.dataContract.create(
            // this is the ENS of generic test twin factory
            'dt.factory.testbc.evan',
            // your own accountID as the owner
            service.core.activeAccount(),
            null,
            { public: uavDescription }
          );
          await service.bcc.profile.addBcContract('uavtwin.evan', digitalTwin.options.address, uav)
          await Promise.all([
            service.bcc.rightsAndRoles.setOperationPermission(
              digitalTwin,        // contract to be updated
              service.core.activeAccount(),              // account, that can change permissions
              0,                  // role id, uint8 value
              'technicalData',                // name of the object
              service.propType.Entry,         // what type of element is modified
              service.modType.Set,       // type of the modification
              true,                       // grant this capability
            ),
            service.bcc.rightsAndRoles.setOperationPermission(
              digitalTwin,        // contract to be updated
              service.core.activeAccount(),              // account, that can change permissions
              0,                  // role id, uint8 value
              'flightPlans',                // name of the object
              service.propType.ListEntry,         // what type of element is modified
              service.modType.Set,       // type of the modification
              true,                       // grant this capability
            ),
            service.bcc.profile.storeForAccount(service.bcc.profile.treeLabels.contracts)
          ]);
          uav.weight = parseFloat(uav.weight);
          uav.owner = service.core.activeAccount();
          await service.bcc.dataContract.setEntry(digitalTwin, 'technicalData', uav, service.core.activeAccount())
        }
      }
    )
  ],
  translations,
  'UAVDispatcherService'
);
