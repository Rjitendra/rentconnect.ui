import {
  ConnectionPositionPair,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgMenuComponent } from '../components/ng-menu/ng-menu';

@Directive({
  selector: '[ngMenuTriggerFor]',
})
export class NgMenuTriggerDirective implements OnDestroy {
  @Input('ngMenuTriggerFor') menu!: NgMenuComponent;

  private overlayRef!: OverlayRef;
  private subscription = new Subscription();

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef<HTMLElement>,
  ) {}

  @HostListener('click')
  onClick() {
    if (this.menu?.templateRef) {
      this.openMenu();
    } else {
      console.error('NgMenuComponent or its templateRef is null.');
    }
  }

  private openMenu() {
    if (this.overlayRef?.hasAttached()) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(this.getPositions());

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    const portal = new TemplatePortal(
      this.menu.templateRef,
      this.menu.viewContainerRef,
    );
    this.overlayRef.attach(portal);

    this.subscription.add(
      this.overlayRef.backdropClick().subscribe(() => {
        this.overlayRef.detach();
      }),
    );
  }

  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
      },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
      },
    ];
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.overlayRef?.dispose();
  }
}
