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
      owner: [ ],
      picture: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICBpZD0ic3ZnOCIKICAgdmVyc2lvbj0iMS4xIgogICB2aWV3Qm94PSIwIDAgMTExLjMzMjE3IDY2LjgyMzE2NiIKICAgaGVpZ2h0PSI2Ni44MjMxNjZtbSIKICAgd2lkdGg9IjExMS4zMzIxN21tIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjMgKDNjZTU2OTMsIDIwMTgtMDMtMTEpIgogICBzb2RpcG9kaTpkb2NuYW1lPSJkcm9uZS0yLnN2ZyI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjAiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjE5NTIiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTAwOCIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE5MjAiCiAgICAgZml0LW1hcmdpbi1ib3R0b209IjAiCiAgICAgZml0LW1hcmdpbi1yaWdodD0iMCIKICAgICBmaXQtbWFyZ2luLWxlZnQ9IjAiCiAgICAgZml0LW1hcmdpbi10b3A9IjAiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9ImczNzI0IgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjeT0iOTMuNTgwNDA2IgogICAgIGlua3NjYXBlOmN4PSIxMzMuMjUwOTgiCiAgICAgaW5rc2NhcGU6em9vbT0iMC45ODk5NDk0OSIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgYm9yZGVyb3BhY2l0eT0iMS4wIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBpZD0iYmFzZSIgLz4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE1Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlua3NjYXBlOmxhYmVsPSJMYXllciAxIgogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiCiAgICAgaWQ9ImxheWVyMSIKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDEuMDk1ODIzLC01MC40MDk4NSkiPgogICAgPGcKICAgICAgIHN0eWxlPSJmaWxsOiNmNWY1ZjU7b3BhY2l0eToxIgogICAgICAgaWQ9ImczNzI0IgogICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMS4xOTMyNzA4LDAsMCwxLjE5MzI3MDgsMzYuODAwMDQ4LDE4LjQzMDE5MykiPgogICAgICA8cGF0aAogICAgICAgICBpZD0icGF0aDM3MTMiCiAgICAgICAgIGQ9Ik0gODQuOSw0MCBIIDc3IGMgLTEuMSwwIC0yLDAuOSAtMiwyIDAsMC4yIDAsMC42IDAsMSBoIC04LjMgYyAtMi40LC02LjkgLTExLC02LjkgLTE2LjQsLTYuOSAtNS40LDAgLTE0LDAgLTE2LjQsNi45IGggLTguMyBjIDAsLTAuNSAwLC0wLjggMCwtMSAwLC0xLjEgLTAuOSwtMiAtMiwtMiBoIC03LjkgYyAtMS4xLDAgLTIsMC45IC0yLDIgMCwxLjMgMCw3LjkgMi44LDEwLjcgMC45LDAuOSAyLDEuNCAzLjIsMS40IDEuMiwwIDIuMywtMC41IDMuMiwtMS40IDEuMywtMS4zIDIsLTMuNiAyLjQsLTUuNiBoIDguMSBjIDAsMC4xIDAsMC4yIDAsMC4zIDAsMy41IDEsNi40IDMsOC43IGwgLTMuNSw1LjUgYyAtMC42LDAuOSAtMC4zLDIuMiAwLjYsMi44IDAuMywwLjIgMC43LDAuMyAxLjEsMC4zIDAuNywwIDEuMywtMC4zIDEuNywtMC45IGwgMy4yLC00LjkgYyAyLjgsMS44IDYuNiwyLjggMTEuMSwyLjggNC40LDAgOC4xLC0xIDEwLjksLTIuNyBsIDMuMSw0LjkgYyAwLjQsMC42IDEsMC45IDEuNywwLjkgMC40LDAgMC43LC0wLjEgMS4xLC0wLjMgMC45LC0wLjYgMS4yLC0xLjggMC42LC0yLjggbCAtMy40LC01LjMgYyAyLC0yLjMgMy4xLC01LjMgMy4xLC04LjggMCwtMC4xIDAsLTAuMiAwLC0wLjMgaCA4LjEgYyAwLjQsMi4xIDEuMSw0LjMgMi40LDUuNiAwLjksMC45IDIsMS40IDMuMiwxLjQgMS4yLDAgMi4zLC0wLjUgMy4yLC0xLjQgMi44LC0yLjggMi44LC05LjQgMi44LC0xMC43IEMgODYuOSw0MC45IDg2LDQwIDg0LjksNDAgWiBtIC02NSw5LjggQyAxOS44LDUwIDE5LjcsNTAgMTkuNiw1MCAxOS41LDUwIDE5LjUsNTAgMTkuMyw0OS44IDE4LjQsNDguOSAxNy45LDQ2LjMgMTcuNyw0NCBoIDMuOCBjIC0wLjIsMi4zIC0wLjcsNC45IC0xLjYsNS44IHogbSAzMC40LC05LjcgYyAxMCwwIDEzLjEsMS43IDEzLjEsNy4yIDAsNC4xIC0xLjksNi41IC00LjIsOCAwLC0wLjMgMC4xLC0wLjUgMC4xLC0wLjggMCwtNC4zIC0zLC02LjUgLTguOSwtNi41IC01LjksMCAtOC45LDIuMiAtOC45LDYuNSAwLDAuMyAwLDAuNSAwLjEsMC44IC0yLjQsLTEuNSAtNC4yLC0zLjkgLTQuMiwtOCAtMC4yLC01LjYgMi45LC03LjIgMTIuOSwtNy4yIHogbSAtNC45LDE0LjQgYyAwLC0xIDAsLTIuNSA0LjksLTIuNSA0LjksMCA0LjksMS41IDQuOSwyLjUgMCwxIDAsMi4yIC00LjksMi4yIC00LjksMCAtNC45LC0xLjIgLTQuOSwtMi4yIHogTSA4MS4zLDQ5LjggQyA4MS4xLDUwIDgxLDUwIDgwLjksNTAgODAuOCw1MCA4MC44LDUwIDgwLjYsNDkuOCA3OS43LDQ4LjkgNzkuMiw0Ni4zIDc5LDQ0IGggMy44IGMgLTAuMSwyLjMgLTAuNiw0LjkgLTEuNSw1LjggeiBtIC0xNi4xLDI0IGMgMC44LDAuOCAwLjgsMiAwLDIuOCAtNCw0IC05LjMsNi4yIC0xNC45LDYuMiAtNS42LDAgLTEwLjksLTIuMiAtMTQuOSwtNi4yIC0wLjgsLTAuOCAtMC44LC0yIDAsLTIuOCAwLjgsLTAuOCAyLC0wLjggMi44LDAgMy4yLDMuMiA3LjUsNSAxMiw1IDQuNiwwIDguOCwtMS44IDEyLC01IDAuOSwtMC44IDIuMiwtMC44IDMsMCB6IG0gLTE0LjksMC43IGMgLTMuNCwwIC02LjYsLTEuMyAtOSwtMy43IC0wLjgsLTAuOCAtMC44LC0yIDAsLTIuOCAwLjgsLTAuOCAyLC0wLjggMi44LDAgMS43LDEuNyAzLjksMi42IDYuMiwyLjYgMi4zLDAgNC41LC0wLjkgNi4yLC0yLjYgMC44LC0wLjggMiwtMC44IDIuOCwwIDAuOCwwLjggMC44LDIgMCwyLjggLTIuNCwyLjQgLTUuNiwzLjcgLTksMy43IHogTSAyNy42LDM4LjEgYyAwLDAgMCwwIDAsMCA3LjIsMCA4LC0zLjkgOCwtNS42IDAsLTIuMSAtMSwtNS41IC04LC01LjUgLTMuMiwwIC02LjIsMS44IC04LDMgLTEuNywtMS4yIC00LjgsLTMuMSAtOCwtMy4xIC03LjIsMCAtOCwzLjkgLTgsNS42IDAsMi4xIDEsNS41IDgsNS41IDAsMCAwLDAgMCwwIDMuMiwwIDYuMiwtMS44IDgsLTMgMS43LDEuMyA0LjcsMy4xIDgsMy4xIHogbSAwLC03LjIgYyAyLjYsMCA0LDAuNSA0LDEuNSAwLDEuMSAtMS4zLDEuNiAtNCwxLjYgLTEuNSwwIC0zLjIsLTAuOCAtNC42LC0xLjYgMS40LC0wLjcgMy4xLC0xLjUgNC42LC0xLjUgeiBtIC0xNiwzLjEgYyAtMi42LDAgLTQsLTAuNSAtNCwtMS41IDAsLTEuMSAxLjMsLTEuNiA0LC0xLjYgMS41LDAgMy4yLDAuOCA0LjYsMS42IC0xLjQsMC43IC0zLjEsMS41IC00LjYsMS41IHogbSA3Ny4zLC03LjEgYyAtMy4yLDAgLTYuMiwxLjggLTgsMyAtMS43LC0xLjIgLTQuOCwtMy4xIC04LC0zLjEgLTcuMiwwIC04LDMuOSAtOCw1LjYgMCwyLjEgMSw1LjUgOCw1LjUgMCwwIDAsMCAwLDAgMy4yLDAgNi4yLC0xLjggOCwtMyAxLjcsMS4yIDQuOCwzLjEgOCwzLjEgMCwwIDAsMCAwLDAgNy4yLDAgOCwtMy45IDgsLTUuNiAwLC0yIC0xLC01LjUgLTgsLTUuNSB6IE0gNzMsMzQgYyAtMi42LDAgLTQsLTAuNSAtNCwtMS41IDAsLTEuMSAxLjMsLTEuNiA0LC0xLjYgMS41LDAgMy4yLDAuOCA0LjYsMS42IEMgNzYuMiwzMy4yIDc0LjUsMzQgNzMsMzQgWiBtIDE1LjksMC4xIGMgLTEuNSwwIC0zLjIsLTAuOCAtNC42LC0xLjYgMS4zLC0wLjggMy4xLC0xLjYgNC42LC0xLjYgMi42LDAgNCwwLjUgNCwxLjUgMCwxLjIgLTEuMywxLjcgLTQsMS43IHoiCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIHN0eWxlPSJzdHJva2Utd2lkdGg6MS40Mjg1NzE0NjtvcGFjaXR5OjEiCiAgICAgICAgIGQ9Im0gMjc5Ljc1Njg4LDE2OS43ODE5NSBjIC0xLjY2NDk3LC0wLjYxOTA5IC02LjQzMzQ2LC02LjU1MjU4IC0xMC41OTY2MSwtMTMuMTg1NTMgbCAtNy41Njk0LC0xMi4wNTk5MSAtOC42ODkwOSwzLjg5Njk2IGMgLTEzLjU0NTAxLDYuMDc0OCAtMjIuODAyMDQsNy43OTU4NyAtNDEuNTQ2MjQsNy43MjQzMiAtMTguODIzNjcsLTAuMDcxOSAtMzAuMDkzNTUsLTIuMzQwMzYgLTQyLjI2Mjk4LC04LjUwNzA4IC00LjAxODc2LC0yLjAzNjQ2IC03LjQ2NzY3LC0zLjQ5ODcyIC03LjY2NDI0LC0zLjI0OTQ2IC0wLjE5NjU3LDAuMjQ5MjUgLTMuNzc3MjgsNS41OTYwNCAtNy45NTcxNCwxMS44ODE3NiAtOC41NTM4NywxMi44NjM0MiAtOS4yNDcyNCwxMy41MTkwMyAtMTQuMzI5OTMsMTMuNTQ5NTUgLTkuNjI0OTksMC4wNTc4IC05LjM2NDAzLC03Ljg2ODk5IDAuNzg1NzIsLTIzLjg2NjgxIDQuMzIxNDIsLTYuODExMzUgNy44NTcxNCwtMTIuOTE1MjEgNy44NTcxNCwtMTMuNTY0MTQgMCwtMC42NDg5MiAtMS41ODIxNCwtMy41NzY3OSAtMy41MTU4NywtNi41MDYzNyAtNC43MTQ0OSwtNy4xNDI0MiAtNy41NjEyNSwtMTUuNjE2OTUgLTguNzM3LC0yNi4wMDkyMjkgbCAtMC45NzMzMiwtOC42MDMwMDMgSCAxMTUuNzk0OCA5Ny4wMzE2ODIgbCAtMS43NjcyNTIsNy41IEMgOTEuNzMyMjE4LDExMy43NzMyOSA4MC40ODcwMjQsMTI0LjA3MjYzIDY5LjgzNDMsMTIyLjA3NDE2IDU1Ljk1MjIxMywxMTkuNDY5ODcgNDYuNDA0NDA2LDk5LjUzMjI5MyA0Ni4zNjYzMjgsNzMuMDY4NzIzIDQ2LjM0ODU5Miw2MC43NDIxODEgNDguMDU0MDE2LDU5Ljg1NDQzNyA3MS43NTE5NTcsNTkuODU0NDM3IGMgMjIuMjgzMzczLDAgMjUuMjk0OTQ1LDEuMDQ2MTggMjYuODQ4Mzk0LDkuMzI2Nzc0IGwgMC45MzAzMDMsNC45NTg5NCBoIDE4Ljk3MTg1NiBjIDE4LjY4Mzg3LDAgMTguOTg0NTYsLTAuMDUwNiAxOS44MDg0NywtMy4zMzMzMzEgMS40MDgyOCwtNS42MTEwMjUgMTIuMDA5MDcsLTE2LjI5OTM4IDIwLjA4NDM0LC0yMC4yNTAyNDEgMTEuMDY0ODksLTUuNDEzNTQ3IDI2Ljc5MzgyLC03Ljc0NTMxOSA1Mi4yNDU5MywtNy43NDUzMTkgMjUuNDAxMiwwIDQxLjE3OTg5LDIuMzMxMjA2IDUyLjE2ODk0LDcuNzA3NjUgOC4zMTAyOSw0LjA2NTg0NyAxNy4yNjQ3NiwxMi45OTg5NTUgMTkuNTIyNzIsMTkuNDc2MTY1IGwgMS40NDQ5OCw0LjE0NTA3NiBoIDE5LjE0NTk4IDE5LjE0NTk1IHYgLTMuNjM2MzY0IGMgMCwtMiAxLjU3NzkzLC01LjIxNDI4NiAzLjUwNjUsLTcuMTQyODU3IDMuMzc5NDUsLTMuMzc5NDUyIDQuMjEwOTcsLTMuNTA2NDkzIDIyLjk1MTA2LC0zLjUwNjQ5MyAxMC42OTQ1LDAgMjAuNjgxMzYsMC42NjE5MTQgMjIuMTkzLDEuNDcwOTIgNS44MTQ5LDMuMTEyMDM3IDcuMjIzNTEsOC43OTM0MjMgNS42NDE4OSwyMi43NTUzNTcgLTEuOTI5MDUsMTcuMDI4ODI2IC01LjgwODU5LDI3LjA4Njg5NiAtMTIuOTI5MDksMzMuNTE5ODM2IC00Ljc4MTA0LDQuMzE5MzggLTYuNjg2ODEsNS4xMTEwMyAtMTIuMzA0MDYsNS4xMTEwMyAtMTEuMjk3NzgsMCAtMTkuMzQ1NzcsLTguNTI1NzQgLTIzLjQ1NTgxLC0yNC44NDgyMjIgbCAtMS42NzcyMiwtNi42NjA3NzUgLTE4Ljc0ODg0LDAuMzk3MzU1IC0xOC43NDg4NiwwLjM5NzM1NiAtMC45NTc3MSw5LjY4NzYwNiBjIC0wLjg4MTc5LDguOTE5NTggLTYuMDk4LDIyLjU2Mzg2IC0xMS4zNzg3NiwyOS43NjM5MiAtMS4zOTgzNCwxLjkwNjU3IC0wLjI4NDg4LDQuNTMwMjggNi4zOTMwNSwxNS4wNjQyOCA0LjQ0OTE3LDcuMDE4MjkgOC4wODYyOCwxNC40MTUwNCA4LjA4NjI4LDE2LjQ0NDk4IDAsNS41MDk0NCAtNS4zNjgxNyw4Ljg3NDk4IC0xMC44ODQzNyw2LjgyMzg3IHogbSAtNDkuNzczOTcsLTM3LjY4OTk0IGMgNS4xMzk5MywtMy4zNjc4MiA0LjUwODM2LC0xMS4zOTg2NCAtMS4yMzIxMywtMTUuNjY3MDggLTMuNDU3MDYsLTIuNTcwNTcgLTYuMDQ0NSwtMi45OTkwNiAtMTguMTA5NTMsLTIuOTk5MDYgLTE2Ljc5NTg2LDAgLTIxLjgzNzEzLDIuNDUxOTIgLTIyLjU3MjIzLDEwLjk3ODQ3IC0wLjc0MzI4LDguNjIxMjkgNS44NzEwOSwxMS4zMzY0NyAyNS43NjEzNSwxMC41NzQ5OSA4LjY0MTEyLC0wLjMzMDgzIDEzLjYwNTA0LC0xLjIxODE0IDE2LjE1MjU0LC0yLjg4NzMyIHogbSAtNTcuOTEzMDksLTkuNjEyMDYgYyAwLC04LjgwNTY1IDUuNTIwMTEsLTE3LjI5MzQxIDEzLjkwODM4LC0yMS4zODU2NSA1LjQ3MzY4LC0yLjY3MDM0NSA5Ljc0NTU5LC0zLjQyNDk1OSAyMS44MjM3NywtMy44NTUwNjMgMTYuMzQxMjEsLTAuNTgxOTEgMjQuMDMzNCwwLjg0MTM0NyAzMS41NTIwOCw1LjgzNzk4MyA1LjcxMjU2LDMuNzk2MzQgMTEuMjg3MiwxMy45OTU4NSAxMS4yODcyLDIwLjY1MTM1IDAsMi41ODM1MSAwLjUxMjM5LDQuNjk3MyAxLjEzODY0LDQuNjk3MyAyLjUxNTczLDAgMTEuNzc0NiwtMTEuMTQ2NzggMTQuODMyNzMsLTE3Ljg1NzE1IDIuNDYwNjMsLTUuMzk5MjggMy4yNTY4LC05Ljc1ODIxIDMuMjYxNjMsLTE3Ljg1NzE0IDAuMDE1NCwtMjUuODY1MTcyIC0xMi41MTg4MSwtMzIuODA3NTMzIC01OS4yMzMsLTMyLjgwNzUzMyAtNDYuMTQ3MTEsMCAtNTguNDU3NTMsNi42MzkzMDEgLTU4LjU0MDA1LDMxLjU3MjA1NCAtMC4wNDMsMTIuOTg4Nzg5IDMuNTYwMzcsMjMuMzE4MTg5IDEwLjc1MzE1LDMwLjgyNDk4OSAzLjIyNzcxLDMuMzY4NjMgNi42MjE2Miw2LjEyNDc4IDcuNTQyMDIsNi4xMjQ3OCAxLjAxMDg1LDAgMS42NzM0NSwtMi4zNTQzIDEuNjczNDUsLTUuOTQ1OTIgeiBNIDc0LjYwNjI4NSwxMDMuNzgzMDEgYyAyLjIwODEwNywtMi43MDQ5MiA2LjAzNDk2NiwtMTYuNjgzOTczIDYuMDM0OTY2LC0yMi4wNDUwMDMgdiAtNC43NDA3MTMgaCAtOC43NjgxMTYgLTguNzY4MTE3IGwgMC45NTIxNTcsOC4xMDEzNjkgYyAxLjAwNzYwMiw4LjU3MzExNyA1LjUxNjEwMywyMC40NzAwNTcgNy43NTczOTcsMjAuNDcwMDU3IDAuNzMzNjg5LDAgMS45ODk5NTksLTAuODAzNTcgMi43OTE3MTMsLTEuNzg1NzEgeiBNIDM1My40NTcxNSw5OS40OTcyOTQgYyAxLjQ2MDM5LC0zLjMzOTI4NiAzLjEwNTQ2LC05Ljc2Nzg1NyAzLjY1NTcyLC0xNC4yODU3MTQgbCAxLjAwMDQ1LC04LjIxNDI4NiBoIC05LjU3NTg4IC05LjU3NTkgbCAwLjk1NDg4LDYuMDcxNDI5IGMgMi4xMzIxOSwxMy41NTcxNjcgNS44OTExOSwyMi40OTk5OTcgOS40NTc1OSwyMi40OTk5OTcgMC43ODUzNCwwIDIuNjIyNzYsLTIuNzMyMTQgNC4wODMxNCwtNi4wNzE0MjYgeiIKICAgICAgICAgaWQ9InBhdGgzNzQ1IgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjIyMTcyOTUsMCwwLDAuMjIxNzI5NSwzLjYwMDAwMDEsMjYuOCkiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIHN0eWxlPSJzdHJva2Utd2lkdGg6MS40Mjg1NzE0NjtvcGFjaXR5OjEiCiAgICAgICAgIGQ9Im0gMjc5LjQzMTA5LDE3MC4yNzYzNiBjIC0xLjA1ODQ0LC0wLjQxMzg4IC01LjQwMTUxLC02LjE0MjQxIC05LjY1MTI4LC0xMi43MzAwNyAtNC4yNDk3NiwtNi41ODc2NiAtOC4yODU5LC0xMS45Nzc1NyAtOC45NjkyMiwtMTEuOTc3NTcgLTAuNjgzMzIsMCAtNC42OTczOCwxLjUxNTUgLTguOTIwMTUsMy4zNjc3NyAtMTIuNzQ0NTYsNS41OTAyNiAtMjIuMjkwODcsNy4yOTA5NCAtNDAuNTM0OSw3LjIyMTMgLTE4LjgyMzY3LC0wLjA3MTkgLTMwLjA5MzU1LC0yLjM0MDM2IC00Mi4yNjI5OCwtOC41MDcwOCAtNC4wMTg3NiwtMi4wMzY0NiAtNy40Njc2NywtMy40OTg3MiAtNy42NjQyNCwtMy4yNDk0NiAtMC4xOTY1NywwLjI0OTI1IC0zLjc3NzI4LDUuNTk2MDQgLTcuOTU3MTQsMTEuODgxNzYgLTguNTUzODcsMTIuODYzNDIgLTkuMjQ3MjQsMTMuNTE5MDMgLTE0LjMyOTkzLDEzLjU0OTU1IC05LjM5NDg0LDAuMDU2NCAtOS4zMzYwMiwtNy44MjQ1IDAuMTcxNjEsLTIyLjk5NTEyIDMuOTgzNjcsLTYuMzU2NDQgNy41NTE3OCwtMTIuMzYxNzMgNy45MjkxMywtMTMuMzQ1MDkgMC4zNzczNCwtMC45ODMzNSAtMS4yNTQxOSwtNC45MzYzIC0zLjYyNTYzLC04Ljc4NDM0IC00LjYwNDc3LC03LjQ3MTk2IC04LjY4OTM5LC0yMC45OTQyOCAtOC42ODkzOSwtMjguNzY2NjA3IFYgOTEuMjAwMDggbCAtMTguNzM0NDgsMC4zOTg2MDcgLTE4LjczNDQ4MiwwLjM5ODYwNyAtMi41NDk3MDgsOC4yNDcyODYgYyAtNi4yNjk1ODUsMjAuMjc5NiAtMjEuNTQyNjAzLDI3Ljk1NDcgLTM0LjI4NzYzOSwxNy4yMzA0NSAtOC40MjQ2ODcsLTcuMDg4OSAtMTQuMTg4OTQ1LC0yNC40ODU2MTYgLTE0LjI0MDMxOSwtNDIuOTc3NzM2IC0wLjAzODc3LC0xMy45NTYxNDQgMS4xNTEwOTEsLTE0LjY0Mjg1NyAyNS4zNzE2MTUsLTE0LjY0Mjg1NyAyMi4yODMzNzMsMCAyNS4yOTQ5NDUsMS4wNDYxOCAyNi44NDgzOTQsOS4zMjY3NzQgbCAwLjkzMDMwMyw0Ljk1ODk0IGggMTguMjc2Njk2IDE4LjI3NjcgbCAzLjY1MjU3LC02LjIzMjY0IEMgMTUwLjY1MDYsNDkuMjg0MTk5IDE2OC45Mzg2NSw0Mi44MTEyNiAyMTAuNjQxMjUsNDIuODExMjYgYyAyNS40NTIxLDAgNDEuMTgxMDQsMi4zMzE3NzIgNTIuMjQ1OTMsNy43NDUzMTkgOC4wNzUyNywzLjk1MDg2MSAxOC42NzYwNiwxNC42MzkyMTYgMjAuMDg0MzQsMjAuMjUwMjQxIDAuODI0MzUsMy4yODQ0NyAxLjExNzAzLDMuMzMzMzMxIDE5Ljk2NzQ2LDMuMzMzMzMxIGggMTkuMTMwODQgdiAtMy42MzYzNjQgYyAwLC0yIDEuNTc3OTMsLTUuMjE0Mjg2IDMuNTA2NSwtNy4xNDI4NTcgMy4zODY4NSwtMy4zODY4NDUgNC4xODQ1NywtMy41MDY0OTMgMjMuMzc4NzcsLTMuNTA2NDkzIDE3LjY1NjM1LDAgMjAuMjc0MSwwLjMxNjA3NyAyMy40NzU4MiwyLjgzNDU0OCA0LjkzOTQxLDMuODg1MzM1IDUuNjc1MjEsOC4wNzc4OCAzLjkxMDMzLDIyLjI4MDU0IC0yLjA1MTksMTYuNTEyMjg1IC01LjkzNjY1LDI2LjMzMjc3NSAtMTIuOTA4MDYsMzIuNjMxMDI1IC00Ljg3Mzk2LDQuNDAzMzIgLTYuNjMwNiw1LjExMTAzIC0xMi42ODY0NCw1LjExMTAzIC0xMS4xODA0NywwIC0xOC45MTM1NywtOC4zMjc5MSAtMjMuMDczNDMsLTI0Ljg0ODIyMiBsIC0xLjY3NzIyLC02LjY2MDc3NSAtMTguNzQ4ODQsMC4zOTczNTUgLTE4Ljc0ODg2LDAuMzk3MzU2IC0wLjk1NzcxLDkuNjg3NjA2IGMgLTAuODc5MzQsOC44OTQ4MSAtNi4xMTI4MSwyMi42MDQwOCAtMTEuMzM3MDMsMjkuNjk3NzcgLTEuMzQxOTYsMS44MjIxOCAtMC4xNDM2NCw0LjYxOTIgNi4zOTMwNCwxNC45MjIxOSA3Ljk4NjksMTIuNTg4NzkgOS44MDk5NSwxOC45MzAyMSA2LjI1ODg1LDIxLjc3MTI0IC0yLjUwOTQ5LDIuMDA3NzEgLTcuMTQ3NjUsMy4wOTA1NSAtOS40MjQ0NSwyLjIwMDI2IHogbSAtNTUuMjU2NjcsLTM2LjA5MTc3IGMgOS40NzE2LC0yLjE5NTk1IDEyLjM0NzIzLC0xMC4wMDgxOSA2LjAxNDg2LC0xNi4zNDA1NyAtNi41MzY3MSwtNi41MzY3MiAtMzIuNTU5MzQsLTYuNTM2NzIgLTM5LjA5NjA2LDAgLTYuMTA0NTMsNi4xMDQ1NCAtMy40NTA0LDE0LjIwMzk2IDUuMzMyMTIsMTYuMjcxNTYgNi44Mzc0MSwxLjYwOTY4IDIwLjk1MjQ1LDEuNjQ0NzkgMjcuNzQ5MDgsMC4wNjkgeiBtIC01Mi4wODExLC0xMS44MzAxNSBjIDAuMDM0NywtOC45NTUxNCA0LjkzNjYsLTE2LjU3NTY1IDEzLjUwMDM0LC0yMC45ODc1MiA2LjAzMzYyLC0zLjEwODQgOS4zNjQxNiwtMy43MjY3MzMgMjIuMjU4ODgsLTQuMTMyNDc2IDE2LjUxNTkxLC0wLjUxOTY4OSAyNC4wMjI3LDAuODcyNjQgMzEuNTAxNTEsNS44NDI3NzYgNS43MTI1NiwzLjc5NjM0IDExLjI4NzIsMTMuOTk1ODUgMTEuMjg3MiwyMC42NTEzNSAwLDIuNTgzNTEgMC41NjgwNiw0LjY5NzMgMS4yNjIzNCw0LjY5NzMgMi4yOTEwNSwwIDExLjg2OTA1LC0xMS42ODQyMiAxNC40OTQ4NSwtMTcuNjgyMjggNi4yMjM5NSwtMTQuMjE3MjU3IDQuNjk0OTUsLTMxLjc3MDM0MyAtMy40Nzk0NywtMzkuOTQ0Nzc2IC03LjY3OTgsLTcuNjc5NzkxIC0xNi42NjI3LC05Ljc4NTU3OSAtNDUuMTM0ODYsLTEwLjU4MDU4MyAtNDAuMjY4NiwtMS4xMjQzODggLTU1LjcwMjYxLDIuNjczNjEyIC02Mi41MjI1MywxNS4zODU1NDQgLTMuMDMyNTQsNS42NTI0NjkgLTMuMzYzMTcsNy44MDA5NTYgLTIuODUyNTQsMTguNTM2Mzc2IDAuNDMxNjcsOS4wNzUxNzkgMS40MTQzNiwxMy43NjY5MTkgMy44ODk3OSwxOC41NzE0MjkgMy4yNzUwNSw2LjM1NjQ2IDExLjg3NjUxLDE1LjcxNDI5IDE0LjQ0NDE0LDE1LjcxNDI5IDAuNzI5NzcsMCAxLjMzNzQzLC0yLjczMjE1IDEuMzUwMzUsLTYuMDcxNDMgeiBNIDc2LjU1MDE1Miw5OS4wMzI5MTEgYyAxLjU5MDEwNSwtMy41OTQ2OTYgMy4yNTEwMzgsLTEwLjAyMzI2NyAzLjY5MDk2LC0xNC4yODU3MTQgbCAwLjc5OTg2MiwtNy43NDk5MDMgaCAtOC45Njc5NzkgLTguOTY3OTc3IGwgMC45NTIxNTcsOC4xMDEzNjkgYyAxLjA1NjM5Miw4Ljk4ODI0OCA1LjU1MDc0NiwyMC40NzAwNTcgOC4wMTI2NDcsMjAuNDcwMDU3IDAuODc0MDc2LDAgMi44OTAyMjUsLTIuOTQxMTEgNC40ODAzMywtNi41MzU4MDkgeiBtIDI3Ni4wMjM1MzgsMi42MDcyMzkgYyAyLjExMzA1LC00LjEzODU5NiA1LjIxMDQyLC0xNy4xMzEwOTIgNS4yMTA0MiwtMjEuODU2MDI5IDAsLTIuNDc3NTYgLTEuMDMwNDcsLTIuNzg2ODI3IC05LjI4NTcyLC0yLjc4NjgyNyAtNS4xMDcxNCwwIC05LjI3NDU1LDAuNDgyMTQzIC05LjI2MDkxLDEuMDcxNDI5IDAuMTAxNTcsNC4zODQzMDEgNC42MTg5MSwyMS40MDUwMjIgNi40MDQxNywyNC4xMjk2NjcgMi44NzExMiw0LjM4MTg4IDQuNDc1NzQsNC4yNTI2NiA2LjkzMjA0LC0wLjU1ODI0IHoiCiAgICAgICAgIGlkPSJwYXRoMzc0NyIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMC4yMjE3Mjk1LDAsMCwwLjIyMTcyOTUsMy42MDAwMDAxLDI2LjgpIiAvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg=="
    };
  }

  _ngOnDestroy() {
  }

  changeImg(event) {
    var reader = new FileReader();
    reader.onload = (e) => {
       this.uav.picture = e.target.result;
       this.ref.detectChanges();
    }
    reader.readAsDataURL(event.srcElement.files[0]);
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