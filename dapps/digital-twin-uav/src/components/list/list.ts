import {
  getDomainName
} from 'dapp-browser';

import {
  Component,     // @angular/core
  DomSanitizer,
  ChangeDetectorRef
} from 'angular-libs';

import {
  AnimationDefinition,
  AsyncComponent,
  createOpacityTransition,
  createRouterTransition,
  EvanAlertService,
  EvanBCCService,
  EvanCoreService,
  EvanQrCodeService,
  EvanRoutingService,
  EvanBcService,
  EvanDescriptionService,
  EvanQueue,
  QueueId
} from 'angular-core';



/**************************************************************************************************/

@Component({
  selector: 'uavlist',
  templateUrl: 'list.html',
  animations: [ ]
})

/**
 * Overview over all created uav by the current user.
 */
export class UAVListComponent extends AsyncComponent {

  constructor(
    private _DomSanitizer: DomSanitizer,
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private bcService: EvanBcService,
    private core: EvanCoreService,
    private descriptionService: EvanDescriptionService,
    private qrCodeService: EvanQrCodeService,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private queueService: EvanQueue
  ) {
    super(ref);
  }

  /**
   * Setup 
   */
  async _ngOnInit() {

  }

  _ngOnDestroy() {
  }


  navigateToUAVCreate() {
    console.log('switch to cration of digital twin');
  }
}