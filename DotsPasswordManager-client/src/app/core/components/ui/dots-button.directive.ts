import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[dotsButton]',
})
export class DotsButtonDirective {
  @Input() dotsSize: dotsButtonSizes | undefined;
  @Input() dotsColor: dotsButtonColors | undefined;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'btn');
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
