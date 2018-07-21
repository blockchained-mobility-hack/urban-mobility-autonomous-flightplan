import {
  getDomainName
} from 'dapp-browser';

import {
  Component,     // @angular/core
  DomSanitizer,
  ChangeDetectorRef,
  ViewChild
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

import {
  Ipld
} from 'bcc';

/**************************************************************************************************/

@Component({
  selector: 'uavcreate',
  templateUrl: 'create.html',
  animations: [ ]
})

export class UAVCreateComponent extends AsyncComponent {

  @ViewChild('ViewChild') createForm: any;

  private taxi: any = {};

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
  async _ngAfterViewInit() {
    setTimeout(() => this.ref.detectChanges());
  }


  _ngOnDestroy() {
  }

  createUAV() {
    console.dir(this.taxi)
  }
}