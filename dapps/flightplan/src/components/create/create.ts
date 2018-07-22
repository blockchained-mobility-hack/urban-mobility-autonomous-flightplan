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
  EvanTranslationService,
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
 /**
   * translated month names for the date time input
   */
  private monthShortNames: any;

  private defaultHeight: number = 300;

  /**
   * initial flightplan object
   */
  private flightplan: any = {
    coordinates: [ ]
  };

  /**
   * UAV contract address
   */
  private uavContractAddress: string;

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
    private translationService: EvanTranslationService,
    private queueService: EvanQueue
  ) {
    super(ref);
  }

  /**
   * Setup initial parameters.
   *
   * @return     {Promise<void>}  resolved when done
   */
  async _ngOnInit() {
    this.monthShortNames = this.translationService.instant('_flightplan.month-short-names').split(',');
    debugger;
    // take the first hash within the url to get the parent contract address
    this.uavContractAddress = window.location.hash.split('/')
      .filter(urlParam => urlParam.indexOf('0x') === 0)[0];
  }

  /**
   * Update initial form
   */
  _ngAfterViewInit() {
    setTimeout(() => this.ref.detectChanges());
  }

  /**
   * Handle the map click event and push the coordinate into the coordinates array.
   *
   * @param      {any}  $event  click event
   */
  mapClicked($event) {
    this.flightplan.coordinates.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      label: (this.flightplan.coordinates.length + 1).toString(),
      height: this.defaultHeight
    });

    this.ref.detectChanges();
  }

  /**
   * Uses the current input data to create a new digital twin flightplan.
   *
   * @return     {Promise<void>}  Resolved when done.
   */
  async createFlightPlan() {
    // ask if the user is ready to create
    try {
      await this.alertService.showSubmitAlert(
        '_flightplan.question-create-flightplan',
        '_flightplan.question-create-flightplan-question',
        '_flightplan.cancel',
        '_flightplan.ok',
      );
    } catch (ex) {
      return;
    }

    // format dates to int
    this.flightplan.startDate = new Date(this.flightplan.startDate).getTime(); 
    this.flightplan.endDate = new Date(this.flightplan.endDate).getTime(); 
    // start the queue!
    this.queueService.addQueueData(
      new QueueId(
        `flightplan.${ getDomainName() }`,
        'FlightPlanDispatcher'
      ),
      {
        uavContractAddress: this.uavContractAddress,
        technicalData: this.flightplan
      }
    );

    this.routingService.goBack();
  }
}