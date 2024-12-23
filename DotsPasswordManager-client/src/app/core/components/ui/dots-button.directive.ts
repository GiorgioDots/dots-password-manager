import {
  ComponentFactoryResolver,
  computed,
  Directive,
  effect,
  ElementRef,
  Input,
  Renderer2,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { LittleLoaderComponent } from './little-loader/little-loader.component';
import { LucideIconData } from 'node_modules/lucide-angular/icons/types';
import { LoaderCircle } from 'lucide-angular';

@Directive({
  selector: '[dotsButton]',
})
export class DotsButtonDirective {
  @Input() dotsSize: dotsButtonSizes | undefined;
  @Input() dotsColor: dotsButtonColors | undefined;
  @Input() isLoading: WritableSignal<boolean> | undefined;
  @Input() icon: LucideIconData | undefined;

  constructor(
    private el: ElementRef<HTMLButtonElement>,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef
  ) {
    this.renderer.addClass(this.el.nativeElement, 'btn');

    const littleLoaderComponent = this.viewContainerRef.createComponent(
      LittleLoaderComponent
    );

    const host = this.el.nativeElement;
    host.insertBefore(
      littleLoaderComponent.location.nativeElement,
      host.firstChild
    );

    effect(() => {
      littleLoaderComponent.instance.icon = this.icon;
      if (this.isLoading != undefined) {
        const isLoading = this.isLoading();
        littleLoaderComponent.instance.setLoading(isLoading);
        littleLoaderComponent.changeDetectorRef.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    const sizeClass = this.getSizeClass();
    if (sizeClass) this.renderer.addClass(this.el.nativeElement, sizeClass);
    const colorClass = this.getColorClass();
    if (colorClass) this.renderer.addClass(this.el.nativeElement, colorClass);
  }

  getSizeClass() {
    if (this.dotsSize == 'sm') return 'btn-small';
    return undefined;
  }

  getColorClass() {
    if (this.dotsColor == 'primary') return 'btn-primary';
    if (this.dotsColor == 'error') return 'btn-error';
    if (this.dotsColor == 'crust') return 'btn-crust';
    return undefined;
  }
}

export type dotsButtonSizes = 'sm';
export type dotsButtonColors = 'primary' | 'crust' | 'error';
