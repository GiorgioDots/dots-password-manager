import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessagesWrapperComponent } from './core/components/messages-wrapper/messages-wrapper.component';
import { MessagesService } from './core/components/messages-wrapper/messages.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, MessagesWrapperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  msgSvc = inject(MessagesService);
  constructor() {
    // this.msgSvc.addError('Title', 'this is a message');
    // this.msgSvc.addWarning('Title', 'this is a message');
    // this.msgSvc.addInfo('Title', 'this is a message');
  }
}
