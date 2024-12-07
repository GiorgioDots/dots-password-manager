import { Component, HostListener, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-drawer',
  imports: [],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent implements OnInit {
  @HostListener('window:resize', [])
  onResize() {
    this.checkIfMobile();
  }

  isDrawerOpen = signal(false);
  isMobileView = signal(false);

  ngOnInit(): void {
    this.checkIfMobile();
  }

  toggleDrawer() {
    this.isDrawerOpen.update((u) => !u);
  }

  private checkIfMobile() {
    this.isMobileView.set(window.innerWidth < 768); // Tailwind's lg breakpoint
  }
}
