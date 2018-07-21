import {
  getDomainName
} from 'dapp-browser';

import {
  Component,     // @angular/core
  DomSanitizer,
  ElementRef,
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
  QueueId,
  EvanToastService
} from 'angular-core';

import {
  TaskService
} from 'task';

import {
  Ipld,
  prottle
} from 'bcc';

/**************************************************************************************************/

@Component({
  selector: 'flightplan-detail',
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
    private core: EvanCoreService,
    private bcc: EvanBCCService,
    private bcService: EvanBcService,
    private routingService: EvanRoutingService,
    private ref: ChangeDetectorRef,
    private descriptionService: EvanDescriptionService,
    private translateService: EvanTranslationService,
    private alertService: EvanAlertService,
    private _DomSanitizer: DomSanitizer,
    private toastService: EvanToastService,
    private queueService: EvanQueue,
    private elementRef: ElementRef,
    private taskService: TaskService
  ) {
    super(ref);
  }

  async _ngOnInit() {
    // get contract address from url
    this.contractAddress = this.routingService.getHashParam('address');   
   
    try {
      // load the technical informations
      this.flightplan = await this.loadFlightPlan(this.contractAddress, () => {
        this.ref.detectChanges();
      });

      // add translation for dapp-wrapper header
      this.translateService.addSingleTranslation(this.contractAddress, this.flightplan.metadata.name);
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

  /**
   * If the dapp is loaded directly with an contract address as parameter, we need to trick the
   * dapp-loader, to load not the uav contract address, but the contract addresses load for the uav
   *
   * @return     {Promise<void>}  resolved when done
   */
  _ngAfterViewInit() {
    this.elementRef.nativeElement.id = this.contractAddress;
  }

  /**
   * Loads a flightplan and its sub tasks. Sets several statuses and sub tasks stuff.
   *
   * @param      {string}        contractAddress  contract address to load the data for
   * @param      {Function}      onUpdate         Function that is called when sub checks are loaded
   *                                              and the calling component should update its data
   * @return     {Promise<any>}  loads a flightplan and its data
   */
  public async loadFlightPlan(contractAddress: string, onUpdate?: Function): Promise<any> {
    const activeAccount = this.core.activeAccount();

    // load metadata
    const metadata = await this.bcc.dataContract.getEntry(
      contractAddress,
      'technicalData',
      activeAccount
    );

    // load all sub tasks
    let checks = await this.bcc.dataContract.getListEntries(
      contractAddress,
      'tasks',
      activeAccount,
      true,
      true,
      Number.MAX_VALUE,
      0,
      false
    );

    // map the checks to handle it as sub objects with loading symbols for reference handling and
    // later updates
    checks = checks.map(check => {
      return {
        address: check,
        loading: true
      }
    });

    // create the return value
    let flightPlan = {
      metadata,
      checks: [ ],
      loading: true
    }

    // go throguh the elements asynchronisouly and trigger the result
    if (checks.length > 0) {
      (async () => {
        await prottle(10, checks.map((check, index) => async () => {
          // get the task, reload data everytime and wait for detail is loaded 
          const subTask = await this.getTask(check.address, true, true);

          // if subtask is valid, add it to the checks array
          if (!subTask.error) {
            flightPlan.checks.push(subTask);
          }

          this.ref.detectChanges();
        }));

        delete flightPlan.loading;
        this.ref.detectChanges();
      })();
    }

    return flightPlan;
  }


  public async getTask(taskId: string, reload?: boolean, awaitDetails?: boolean|Function) {
    let existingTask = this.taskService.tasks.find(task => task.address === taskId);

    const dataContract = this.bcc.dataContract;
    let loadedTask = await this.bcc.profile.getContract(taskId);

    loadedTask = this.bcc.utils.deepCopy(loadedTask);

    if (!loadedTask) {
      loadedTask = {
        error: 'Not permitted'
      };
    } else {
      existingTask = this.taskService.tasks.find(task => task.address === taskId);

      const index = this.taskService.tasks.indexOf(existingTask);

      if (index !== -1) {
        this.taskService.tasks.splice(index, 1);
        this.taskService.tasks.splice(index, 0, loadedTask);
      } else {
        this.taskService.tasks.push(loadedTask);
      }

      loadedTask.loading = true;
      loadedTask.address = taskId;
      // reset members
      loadedTask.members = [ ];
      loadedTask.metadata = await this.taskService.getTaskMetadata(taskId);

      if (typeof awaitDetails === 'function') {
        setTimeout(async () => {
          await this.taskService.loadDetailsForTask(dataContract, this.core.activeAccount(), loadedTask);
          
          awaitDetails(loadedTask)
        });
      } else if (awaitDetails) {
        await this.taskService.loadDetailsForTask(dataContract, this.core.activeAccount(), loadedTask);
      } else {
        this.taskService.loadDetailsForTask(dataContract, this.core.activeAccount(), loadedTask);
      }
    }
    if (loadedTask.todos) {
      loadedTask.solvedTodos = loadedTask.todos.filter(todo => todo.solved).length;
    }
    return loadedTask;
  }

  /**
   * Open the sub task
   *
   * @param      {string}  contractAddress  contract address of the sub task
   */
  openCheck(contractAddress: string) {
    this.routingService.navigate(`./${ contractAddress }`);
  }
}