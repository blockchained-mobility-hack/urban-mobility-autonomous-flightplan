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

export class FlightPlanCreateComponent extends AsyncComponent {

  @ViewChild('ViewChild') createForm: any;

  private uav: any;

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

  // set the initial default values for the air taxi
  async _ngOnInit() {
    this.uav = {
      pilot: false,
      owner: [ ]
    };
  }

  _ngOnDestroy() {
  }

  async createUAV() {
    // ask if the user is ready to create
    try {
      await this.alertService.showSubmitAlert(
        '_uav.question-create-uav',
        '_uav.question-create-uav-question',
        '_uav.cancel',
        '_uav.ok',
      );
    } catch (ex) {
      return;
    }

    //use the active account to set the owner for the twin
    this.uav.owner = this.core.activeAccount();

    // start the queue!
    this.queueService.addQueueData(
      new QueueId(
        `uavtwin.${ getDomainName() }`,
        'UAVDispatcher'
      ),
      this.uav
    );

    this.routingService.goBack();
  }
}