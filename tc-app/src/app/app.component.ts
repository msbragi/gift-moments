import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
//import { TranslocoDirective } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TranslocoService } from '@jsverse/transloco';
import { CookieConsentComponent } from './Components/cookie-consent/cookie-consent.component';
import { LoadingComponent } from './Components/shared/loading/loading.component';
import { FooterComponent } from './Features/footer/footer.component';
import { MenuComponent } from './Features/menu/menu.component';
import { ToolbarComponent } from './Features/toolbar/toolbar.component';
import { StoreService } from './Services/common/store.service';
import { I18nLang } from './Models/config.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    ToolbarComponent,
    MenuComponent,
    FooterComponent,
    LoadingComponent,
    CookieConsentComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  sidenavOpen: boolean = false;
  siteMode = StoreService.getSiteMode();

  constructor(
    private translocoService: TranslocoService,
    private router: Router
  ) {
    // Set available languages from config
    const langs: string[] = StoreService.getAvailableLangs().map((lang: I18nLang) => { return lang.code });
    translocoService.setAvailableLangs(langs || ['en']);
  }

  routeChanged(event: any) {
    this.sidenavOpen = false; // Close the sidenav when the route changes
  }
 
  isHomePage(): boolean {
    // Example: matches /pages/en/home, /pages/it/home, etc.
    const homeRegex = /^\/pages\/[a-z]{2}\/home$/;
    return homeRegex.test(this.router.url);
  }
 
}
