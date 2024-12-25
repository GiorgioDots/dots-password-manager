import {
  ComponentFactoryResolver,
  ComponentRef,
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
  @Input() iconPosition: 'before' | 'after' = 'before';

  private littleLoaderComponent: ComponentRef<LittleLoaderComponent>;

  constructor(
    private el: ElementRef<HTMLButtonElement>,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef
  ) {
    this.renderer.addClass(this.el.nativeElement, 'btn');

    this.littleLoaderComponent = this.viewContainerRef.createComponent(
      LittleLoaderComponent
    );

    effect(() => {
      this.littleLoaderComponent.instance.icon = this.icon;
      if (this.isLoading != undefined) {
        const isLoading = this.isLoading();
        this.littleLoaderComponent.instance.setLoading(isLoading);
        this.littleLoaderComponent.changeDetectorRef.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    if (this.iconPosition == 'before') {
      this.littleLoaderComponent.instance.customStyle = 'margin-right: .25rem';
      host.insertBefore(
        this.littleLoaderComponent.location.nativeElement,
        host.firstChild
      );
    } else {
      this.littleLoaderComponent.instance.customStyle = 'margin-left: .25rem';
      host.appendChild(this.littleLoaderComponent.location.nativeElement);
    }

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
    if (this.dotsColor) return `btn-${this.dotsColor}`;
    return undefined;
  }
}

export type dotsButtonSizes = 'sm';
export type dotsButtonColors = 'primary' | 'crust' | 'error' | 'mantle';
