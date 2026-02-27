# gifts capsule - Frontend Application

> **Angular 19 frontend for the gifts capsule platform**

This is the frontend application for gifts capsule, built with Angular 19 using standalone components, Angular Material, and modern web standards. The application provides a responsive, multilingual interface for creating, managing, and accessing digital gifts capsules.

## 🛠️ **Technical Stack**

### **Core Framework**
- **Angular 19** - Latest Angular with standalone components architecture
- **TypeScript 5.0+** - Strict type checking and modern ES features
- **RxJS 7.8+** - Reactive programming with observables
- **Zone.js** - Change detection and async operation handling

### **UI & Styling**
- **Angular Material 19** - Material Design component library
- **Angular CDK** - Component development kit for custom components
- **SCSS** - Enhanced CSS with variables, mixins, and nesting
- **Bootstrap 5.3** - Grid system and utility classes
- **Responsive Design** - Mobile-first approach with breakpoint management

### **Libraries & Tools**
- **@jsverse/transloco** - Internationalization framework
- **Chart.js + ng2-charts** - Data visualization and analytics
- **Leaflet** - Interactive maps and location services
- **QRCode** - QR code generation for sharing
- **@popperjs/core** - Tooltip and popover positioning

## 🏗️ **Architecture Overview**

### **Project Structure**
```
src/app/
├── Components/             # Feature components (standalone)
│   ├── dashboard/          # Main dashboard with timeline
│   ├── capsules/          # Capsule CRUD operations
│   ├── library/           # Media library management
│   ├── capsule-explorer/  # Content discovery interface
│   ├── email-verification/ # Authentication flows
│   └── ...
├── Core/                  # Core application services
│   ├── guards/            # Route guards (auth, permissions)
│   └── ...
├── Services/              # Business logic and API integration
│   ├── api/               # Backend API communication
│   ├── common/            # Shared utilities and helpers
│   └── ...
├── Features/              # Reusable UI components
├── Models/                # TypeScript interfaces and types
├── Pages/                 # Route-level page components
├── Pipes/                 # Data transformation pipes
├── Utils/                 # Pure utility functions
└── Validators/            # Custom form validators
```

### **Component Architecture**
- **Standalone Components** - No NgModules, simplified dependency injection
- **OnPush Change Detection** - Optimized performance with immutable patterns
- **Smart/Dumb Component Pattern** - Separation of business logic and presentation
- **Reactive Forms** - Model-driven forms with comprehensive validation
## 🚀 **Development Setup**

### **Prerequisites**
- **Node.js 18+** with npm
- **Modern browser** with ES2022 support
- **Backend service** running (see `../tc-be/`)

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Access application at http://localhost:4200
```

### **Available Scripts**
```bash
npm start                  # Development server with hot reload
npm run build             # Production build
npm run watch             # Development build with file watching
npm test                  # Run unit tests with Karma
npm run i18n:extract      # Extract translation keys
npm run i18n:find         # Find unused translation keys
npm run start:lan         # Development server accessible on LAN
```

### **Environment Configuration**
```bash
# Development with backend proxy
ng serve --proxy-config ./proxy.conf.json

# LAN access for mobile testing
ng serve --host 0.0.0.0 --disable-host-check
```

## ⚙️ **Configuration Files**

### **Angular Configuration** (`angular.json`)
- **Build Optimization** - Tree shaking, minification, source maps
- **Development Server** - Proxy configuration for backend API
- **Testing Setup** - Karma and Jasmine configuration
- **Internationalization** - Multi-language build configuration

### **TypeScript Configuration**
- **`tsconfig.json`** - Base TypeScript configuration
- **`tsconfig.app.json`** - Application-specific settings
- **`tsconfig.spec.json`** - Testing configuration

### **Proxy Configuration** (`proxy.conf.json`)
```json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### **Transloco Configuration** (`transloco.config.ts`)
- **Language Management** - Default language and fallbacks
- **Key Extraction** - Automatic translation key discovery
- **File Structure** - Flattened JSON structure for maintainability

## 🔧 **Development Patterns**

### **Service Architecture**
```typescript
// API Service Pattern
@Injectable({ providedIn: 'root' })
export class CapsuleApiService {
  constructor(private http: HttpClient) {}
  
  getCapsules(): Observable<Capsule[]> {
    return this.http.get<Capsule[]>('/api/capsules');
  }
}

// Business Logic Service
@Injectable({ providedIn: 'root' })
export class CapsuleService {
  constructor(private api: CapsuleApiService) {}
  
  getCapsulesByUser(userId: number): Observable<Capsule[]> {
    return this.api.getCapsules().pipe(
      map(capsules => capsules.filter(c => c.userId === userId))
    );
  }
}
```

### **Component Patterns**
```typescript
// Standalone Component
@Component({
  selector: 'app-capsule-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class CapsuleListComponent {
  capsules$ = this.capsuleService.getCapsules();
  
  constructor(private capsuleService: CapsuleService) {}
}
```

### **Form Handling**
```typescript
// Reactive Forms with Validation
export class CapsuleFormComponent {
  capsuleForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', Validators.required],
    deliveryDate: ['', [Validators.required, this.futureDateValidator]]
  });
  
  constructor(private fb: FormBuilder) {}
}
```

## 🌐 **Internationalization (i18n)**

### **Transloco Setup**
- **6 Languages Supported** - EN, ES, FR, IT, KA, RU
- **Lazy Loading** - Language files loaded on demand
- **Key Management** - Automated extraction and unused key detection
- **Structural Translations** - Flattened JSON for better organization

### **Translation Structure**
```
assets/i18n/
├── en.json          # English (default)
├── es.json          # Spanish
├── fr.json          # French
├── it.json          # Italian
├── ka.json          # Georgian
└── ru.json          # Russian
```

### **Usage Patterns**
```html
<!-- Template Translation -->
<div *transloco="let t">
  <h1>{{ t('common.welcome') }}</h1>
  <p>{{ t('capsules.description') }}</p>
</div>

<!-- Service Translation -->
constructor(private transloco: TranslocoService) {
  const message = this.transloco.translate('error.network');
}
```

### **Translation Management**
```bash
# Extract new translation keys
npm run i18n:extract

# Find unused translation keys
npm run i18n:find

# Generate missing translations
node utils/translation-generator.js
```

## 🎨 **UI/UX Implementation**

### **Angular Material Integration**
```typescript
// Material Module Usage
@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSnackBarModule
  ]
})
```

### **Responsive Design System**
- **Breakpoints** - Mobile-first with 576px, 768px, 992px, 1200px
- **Grid System** - Bootstrap 5.3 grid with Material components
- **Typography** - Material Design type scale
- **Color Scheme** - Material theming with custom palette

### **Performance Optimizations**
- **OnPush Change Detection** - Minimized change detection cycles
- **Lazy Loading** - Route-based code splitting
- **Image Optimization** - WebP format with fallbacks
- **Bundle Analysis** - Webpack bundle analyzer integration

## 🔒 **Security Implementation**

### **Authentication Flow**
```typescript
// JWT Token Management
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials)
      .pipe(tap(response => this.setToken(response.token)));
  }
}

// Route Protection
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated();
  }
}
```

### **HTTP Interceptors**
```typescript
// Request/Response Interceptor
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${this.getToken()}` }
    });
    return next.handle(authReq);
  }
}
```

## 📊 **Data Visualization**

### **Chart.js Integration**
```typescript
// Analytics Dashboard
@Component({
  template: `
    <canvas baseChart
      [data]="chartData"
      [options]="chartOptions"
      [type]="chartType">
    </canvas>
  `
})
export class AnalyticsComponent {
  chartData: ChartData = {
    labels: ['Created', 'Scheduled', 'Delivered'],
    datasets: [{
      data: [12, 19, 3],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  };
}
```

### **Interactive Maps**
```typescript
// Leaflet Map Integration
@Component({
  template: `<div id="map" class="map-container"></div>`
})
export class MapComponent implements OnInit {
  private map!: L.Map;
  
  ngOnInit() {
    this.map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }
}
```

## 🧪 **Testing Strategy**

### **Unit Testing with Jasmine & Karma**
```typescript
describe('CapsuleService', () => {
  let service: CapsuleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CapsuleService]
    });
    service = TestBed.inject(CapsuleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch capsules', () => {
    const mockCapsules = [{ id: 1, title: 'Test' }];
    
    service.getCapsules().subscribe(capsules => {
      expect(capsules).toEqual(mockCapsules);
    });

    const req = httpMock.expectOne('/api/capsules');
    expect(req.request.method).toBe('GET');
    req.flush(mockCapsules);
  });
});
```

### **Component Testing**
```typescript
describe('CapsuleListComponent', () => {
  let component: CapsuleListComponent;
  let fixture: ComponentFixture<CapsuleListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CapsuleListComponent, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(CapsuleListComponent);
    component = fixture.componentInstance;
  });

  it('should display capsules', () => {
    component.capsules$ = of([{ id: 1, title: 'Test Capsule' }]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test Capsule');
  });
});
```

## 🔧 **Build & Deployment**

### **Development Build**
```bash
# Development with source maps
ng build --configuration development

# Watch mode for continuous building
ng build --watch --configuration development
```

### **Production Build**
```bash
# Optimized production build
ng build --configuration production

# Build analysis
ng build --stats-json
npx webpack-bundle-analyzer dist/time-caps/stats.json
```

### **Docker Integration**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/time-caps /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

## 📈 **Performance Monitoring**

### **Bundle Analysis**
```bash
# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/time-caps/stats.json
```

### **Performance Metrics**
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Cumulative Layout Shift** - < 0.1
- **First Input Delay** - < 100ms

### **Code Quality**
```bash
# Linting
ng lint

# Formatting
npx prettier --write src/**/*.{ts,html,scss}

# Type checking
npx tsc --noEmit
```

## 🛠️ **Development Resources**

### **Documentation**
- **Architecture Guide** - [`.github/docs/architecture.md`](.github/docs/architecture.md)
- **Development Patterns** - [`.github/docs/patterns.md`](.github/docs/patterns.md)
- **Quick Reference** - [`.github/docs/quick-reference.md`](.github/docs/quick-reference.md)
- **Project Tasks** - [`.github/todo.md`](.github/todo.md)

### **VS Code Extensions (Recommended)**
- Angular Language Service
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Angular Snippets

### **Debugging**
```bash
# Start with debugging
ng serve --source-map=true

# Enable Angular DevTools
ng serve --configuration development
```

## 🤝 **Contributing**

### **Development Workflow**
1. Check [development guidelines](.github/docs/architecture.md)
2. Review [coding patterns](.github/docs/patterns.md)
3. Follow the [quick reference](.github/docs/quick-reference.md)
4. Check [pending tasks](.github/todo.md)

### **Code Standards**
- **TypeScript Strict Mode** - Enabled
- **ESLint Rules** - Angular recommended + custom rules
- **Prettier Configuration** - Consistent code formatting
- **Commit Convention** - Conventional commits for versioning

---

**gifts capsule Frontend** - Built with Angular 19 and modern web standards 🚀
