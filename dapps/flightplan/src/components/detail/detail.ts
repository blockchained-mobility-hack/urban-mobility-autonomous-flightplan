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
  private allowedToCreateFlightPlans;
  private dbcp;
  private metadata;
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
      
    // wath the window size when it changes, detect changes
    this.core.utils.windowSize(() => {
      this.ref.detectChanges();
    });

    // is the user the owner and is permitted to create flightplans?
    this.allowedToCreateFlightPlans = await this.bcc.rightsAndRoles.hasUserRole(
      this.contractAddress,
      this.core.activeAccount(),
      this.core.activeAccount(),
      0 // => owner
    );

    // load dbcp
    this.dbcp = await this.descriptionService.getDescription(this.contractAddress);

        try {
      // load the technical informations
      this.metadata = await this.bcc.dataContract.getEntry(
        this.contractAddress,
        'technicalData',
        this.core.activeAccount()
      );

      // add translation for dapp-wrapper header
      this.translateService.addSingleTranslation(this.contractAddress, this.metadata.name);
    } catch (ex) {
      this.core.utils.log(this.core.utils.getErrorLog(ex));
      // show error for user
      try {
        this.alertService.showAlert(
          '_uavdigitaltwin.generic-error',
          this.core.utils.getErrorLog(ex),
        );
      } catch (ex) { }
    }
  }

  _ngOnDestroy() {
  }
}