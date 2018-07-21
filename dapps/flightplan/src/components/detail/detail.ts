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
  EvanTranslationService,
  EvanRoutingService,
  EvanBcService,
  EvanDescriptionService,
  EvanQueue,
  QueueId
} from 'angular-core';

import {
  Ipld,
  prottle
} from 'bcc';

/**************************************************************************************************/

@Component({
  selector: 'uavdetail',
  templateUrl: 'detail.html',
  animations: [ ]
})

/**
 * Overview over all created uav by the current user.
 */
export class FlightPlanDetailComponent extends AsyncComponent {


  private contractAddress;
  private flightplan;
  constructor(
    private _DomSanitizer: DomSanitizer,
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private bcService: EvanBcService,
    private core: EvanCoreService,
    private descriptionService: EvanDescriptionService,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private queueService: EvanQueue,
    private translateService: EvanTranslationService,
  ) {
    super(ref);
  }

  /**
   * Setup 
   */
  async _ngOnInit() {
    // get contract address from url
    this.contractAddress = this.routingService.getHashParam('address');   
   
    try {
      // load the technical informations
      this.flightplan = await this.loadFlightPlan(this.contractAddress, () => {
        this.ref.detectChanges();
      });

    } catch (ex) {

    }
  }

  public async loadFlightPlan(contractAddress: string, onUpdate?: Function): Promise<any> {
    const activeAccount = this.core.activeAccount();

    // load metadata
    const metadata = await this.bcc.dataContract.getEntry(
      contractAddress,
      'technicalData',
      activeAccount
    );

    // create the return value
    let flightPlan = {
      metadata,
      loading: true
    }
    return flightPlan;
  }

  _ngOnDestroy() {
  }
}