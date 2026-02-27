# gifts moment capsule - Backend API

> **NestJS 11 backend service for the gifts moment capsule platform**

This is the backend API service for gifts moment capsule, built with NestJS 11, TypeORM, and a hybrid MySQL/SQLite database architecture. The service provides RESTful APIs for gifts moment capsule management, user authentication, media handling, and scheduled content delivery.

## 🛠️ **Technical Stack**

### **Core Framework**
- **NestJS 11** - Progressive Node.js framework with TypeScript
- **TypeScript 5.0+** - Strict type checking and modern ES features
- **Node.js 18+** - Runtime environment with ES2022 support
- **Express.js** - Underlying HTTP server framework

### **Database & ORM**
- **TypeORM 0.3+** - Object-relational mapping with decorators
- **MySQL 8.0** - Primary database for user accounts and global data
- **SQLite 3** - Per-user databases for gifts moment capsule content isolation
- **Database Migrations** - Version-controlled schema management

### **Authentication & Security**
- **Passport.js** - Authentication middleware with JWT strategy
- **bcrypt** - Password hashing with salt rounds
- **class-validator** - DTO validation with decorators
- **helmet** - Security headers and CORS protection
- **rate-limiting** - Throttling for API endpoints

### **Additional Libraries**
- **Multer** - File upload handling with validation
- **Handlebars** - Email template rendering engine
- **NodeMailer** - SMTP email delivery service
- **compression** - Response compression middleware

## 🏗️ **Architecture Overview**

### **Project Structure**
```
src/
├── common/                    # Shared utilities and base classes
│   ├── decorators/           # Custom parameter decorators (@User, @Public)
│   ├── dto/                  # Base DTOs and common validation
│   ├── entities/             # Base entity with audit fields
│   ├── filters/              # Global exception filters
│   ├── guards/               # Authentication and authorization guards
│   ├── interceptors/         # Request/response transformation
│   ├── interfaces/           # Shared TypeScript interfaces
│   ├── pipes/                # Custom validation pipes
│   └── services/             # Base services and SQLite utilities
├── modules/                  # Feature modules by domain
│   ├── auth/                 # Authentication and authorization
│   ├── users/                # User management
│   ├── capsules/             # gifts moment capsule CRUD operations
│   ├── media/                # File upload and management
│   ├── email/                # Email service and templates
│   └── .../                  # Additional feature modules
├── database/                 # Database configuration and migrations
├── app.module.ts             # Root module with global configuration
└── main.ts                   # Application bootstrap
```

### **Modular Architecture**
- **Feature Modules** - Domain-driven module organization
- **Shared Common Module** - Reusable utilities and base classes
- **Database Module** - Connection management and configuration
- **Global Guards** - JWT authentication applied by default
- **Global Interceptors** - Logging, transformation, and error handling

## 🚀 **Development Setup**

### **Prerequisites**
- **Node.js 18+** with npm
- **MySQL 8.0** for primary database
- **SQLite 3** for user data isolation
- **SMTP Server** for email functionality (optional for development)

### **Installation**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and SMTP configuration

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev

# API available at http://localhost:3000
```

### **Available Scripts**
```bash
npm run start             # Production mode
npm run start:dev         # Development with hot reload
npm run start:debug       # Development with debugging enabled
npm run build             # Compile TypeScript to JavaScript
npm run test              # Run unit tests
npm run test:e2e          # Run end-to-end tests
npm run test:cov          # Run tests with coverage report
npm run migration:generate # Generate new migration
npm run migration:run     # Run pending migrations
npm run migration:revert  # Revert last migration
```

### **Environment Configuration**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=time_capsule

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=30d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

## ⚙️ **Database Architecture**

### **Hybrid Database Strategy**
```typescript
// MySQL for global data
@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// SQLite for per-user gifts moment capsule data
@Injectable()
export class SqliteService {
  async getUserDatabase(userId: number): Promise<Database> {
    const dbPath = `./data/user_capsules/user_${userId.toString().padStart(8, '0')}.db`;
    return new Database(dbPath);
  }
}
```

### **Migration Management**
```bash
# Generate migration from entity changes
npm run migration:generate -- --name CreateCapsuleTable

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### **Database Seeding**
```typescript
// Seed development data
@Injectable()
export class DatabaseSeeder {
  async seed() {
    await this.createTestUsers();
    await this.createSampleCapsules();
  }
}
```

## 🔧 **Core Service Patterns**

### **Base Service Architecture**
```typescript
// Abstract base service for CRUD operations
@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  constructor(
    @InjectRepository(T) protected repository: Repository<T>
  ) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async create(createDto: any): Promise<T> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  protected abstract checkOwnership(id: number, userId: number): Promise<boolean>;
}
```

### **Feature Service Implementation**
```typescript
@Injectable()
export class CapsuleService extends BaseService<Capsule> {
  constructor(
    @InjectRepository(Capsule) capsuleRepository: Repository<Capsule>,
    private sqliteService: SqliteService
  ) {
    super(capsuleRepository);
  }

  async findAllForUser(userId: number): Promise<Capsule[]> {
    return this.repository.find({ where: { userId } });
  }

  protected async checkOwnership(id: number, userId: number): Promise<boolean> {
    const capsule = await this.findOne(id);
    return capsule.userId === userId;
  }

  async createWithUserData(createDto: CreateCapsuleDto, userId: number): Promise<Capsule> {
    const capsule = await this.create({ ...createDto, userId });
    
    // Store detailed data in user's SQLite database
    const userDb = await this.sqliteService.getUserDatabase(userId);
    await userDb.run(`
      INSERT INTO capsule_content (capsule_id, content, media_files)
      VALUES (?, ?, ?)
    `, [capsule.id, createDto.content, JSON.stringify(createDto.mediaFiles)]);
    
    return capsule;
  }
}
```

## 🔐 **Authentication & Security**

### **JWT Authentication Strategy**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

// JWT Auth Guard (applied globally)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### **DTO Validation & Security**
```typescript
export class CreateCapsuleDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  deliveryDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaFileDto)
  @IsOptional()
  mediaFiles?: MediaFileDto[];
}

// Custom validator for future dates
@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDate implements ValidatorConstraintInterface {
  validate(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  defaultMessage(): string {
    return 'Delivery date must be in the future';
  }
}
```

### **Security Middleware**
```typescript
// Global exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    this.logger.error(`${request.method} ${request.url}`, exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## 📧 **Email System**

### **Email Service Architecture**
```typescript
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const template = await this.renderTemplate('verification', {
      verificationUrl: `${process.env.FRONTEND_URL}/verify?token=${token}`,
      userEmail: to,
    });

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Verify Your gifts moment capsule Account',
      html: template,
    });
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(__dirname, '../../templates', `${templateName}.hbs`);
    const template = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }
}
```

### **Email Templates (Handlebars)**
```handlebars
<!-- verification.hbs -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Account</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1>Welcome to gifts moment capsule!</h1>
        <p>Please click the button below to verify your email address:</p>
        <a href="{{verificationUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Verify Account
        </a>
        <p>If you didn't create this account, you can safely ignore this email.</p>
    </div>
</body>
</html>
```

## 📂 **File Upload & Media Management**

### **Multer Configuration**
```typescript
@Injectable()
export class FileUploadService {
  private storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const userId = req.user.userId;
      const uploadPath = path.join(process.env.UPLOAD_DEST, userId.toString());
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  private fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/avi', 'video/mov',
      'audio/mp3', 'audio/wav', 'audio/m4a',
      'application/pdf', 'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('File type not supported'), false);
    }
  };

  getMulterOptions(): MulterModuleOptions {
    return {
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
        files: 10, // Maximum 10 files per upload
      },
    };
  }
}
```

### **Media Controller Implementation**
```typescript
@Controller('media')
export class MediaController {
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: any,
    @Body() uploadDto: UploadMediaDto,
  ): Promise<MediaFile[]> {
    const savedFiles = await Promise.all(
      files.map(file => this.mediaService.saveFileMetadata(file, user.userId))
    );

    return savedFiles;
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: number,
    @User() user: any,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.mediaService.findOne(id);
    
    if (!await this.mediaService.checkOwnership(id, user.userId)) {
      throw new ForbiddenException('Access denied');
    }

    const filePath = path.join(process.env.UPLOAD_DEST, file.filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
```

## 🧪 **Testing Strategy**

### **Unit Testing with Jest**
```typescript
describe('CapsuleService', () => {
  let service: CapsuleService;
  let repository: Repository<Capsule>;
  let sqliteService: SqliteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CapsuleService,
        {
          provide: getRepositoryToken(Capsule),
          useClass: Repository,
        },
        {
          provide: SqliteService,
          useValue: {
            getUserDatabase: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CapsuleService>(CapsuleService);
    repository = module.get<Repository<Capsule>>(getRepositoryToken(Capsule));
    sqliteService = module.get<SqliteService>(SqliteService);
  });

  describe('findAllForUser', () => {
    it('should return user capsules', async () => {
      const mockCapsules = [
        { id: 1, title: 'Test Capsule', userId: 1 },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockCapsules);

      const result = await service.findAllForUser(1);
      
      expect(repository.find).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual(mockCapsules);
    });
  });

  describe('checkOwnership', () => {
    it('should return true for owned capsule', async () => {
      const mockCapsule = { id: 1, userId: 1 };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCapsule);

      const result = await service.checkOwnership(1, 1);
      
      expect(result).toBe(true);
    });

    it('should return false for non-owned capsule', async () => {
      const mockCapsule = { id: 1, userId: 2 };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCapsule);

      const result = await service.checkOwnership(1, 1);
      
      expect(result).toBe(false);
    });
  });
});
```

### **Integration Testing**
```typescript
describe('CapsuleController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token for testing
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    authToken = loginResponse.body.token;
  });

  it('/capsules (GET)', () => {
    return request(app.getHttpServer())
      .get('/capsules')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/capsules (POST)', () => {
    return request(app.getHttpServer())
      .post('/capsules')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Capsule',
        content: 'Test content',
        deliveryDate: new Date(Date.now() + 86400000), // Tomorrow
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toBe('Test Capsule');
        expect(res.body.id).toBeDefined();
      });
  });
});
```

## 🚀 **Deployment & Production**

### **Docker Configuration**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/templates ./templates

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

### **Production Environment Variables**
```bash
# Production .env
NODE_ENV=production
PORT=3000

# Database (Production)
DB_HOST=production-mysql-host
DB_PORT=3306
DB_USERNAME=time_capsule_user
DB_PASSWORD=super-secure-password
DB_DATABASE=time_capsule_prod

# Security
JWT_SECRET=production-jwt-secret-256-bit-minimum
JWT_REFRESH_SECRET=production-refresh-secret-256-bit-minimum

# Email (Production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# File Storage
UPLOAD_DEST=/app/storage
MAX_FILE_SIZE=52428800  # 50MB

# Logging
LOG_LEVEL=error
```

### **Health Checks & Monitoring**
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private typeormHealthIndicator: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.typeormHealthIndicator.pingCheck('database'),
      () => this.diskHealthIndicator.checkStorage('storage', { path: '/', threshold: 0.9 }),
      () => this.memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
```

## 📊 **Performance & Optimization**

### **Database Query Optimization**
```typescript
// Efficient queries with relations
@Injectable()
export class CapsuleService {
  async findWithRelations(id: number): Promise<Capsule> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'mediaFiles'],
      select: {
        user: ['id', 'email'], // Only select needed fields
      },
    });
  }

  // Pagination for large datasets
  async findPaginated(page: number, limit: number): Promise<[Capsule[], number]> {
    return this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  // Bulk operations
  async createMultiple(capsules: CreateCapsuleDto[]): Promise<Capsule[]> {
    const entities = this.repository.create(capsules);
    return this.repository.save(entities);
  }
}
```

### **Caching Strategy**
```typescript
@Injectable()
export class CacheService {
  @Cacheable('user-capsules', 300) // 5 minutes TTL
  async getUserCapsules(userId: number): Promise<Capsule[]> {
    return this.capsuleService.findAllForUser(userId);
  }

  @CacheEvict('user-capsules')
  async invalidateUserCache(userId: number): Promise<void> {
    // Cache will be cleared after method execution
  }
}
```

## 🛠️ **Development Resources**

### **Documentation**
- **Architecture Guide** - [`.github/docs/architecture.md`](.github/docs/architecture.md)
- **Development Patterns** - [`.github/docs/patterns.md`](.github/docs/patterns.md)
- **Quick Reference** - [`.github/docs/quick-reference.md`](.github/docs/quick-reference.md)
- **Project Tasks** - [`.github/todo.md`](.github/todo.md)

### **API Documentation**
```bash
# Start with Swagger documentation
npm run start:dev

# Access API docs at http://localhost:3000/api
```

### **Database Tools**
```bash
# Generate migration from entity changes
npm run migration:generate -- --name AddCapsuleStatus

# Create empty migration
npm run migration:create -- --name CustomMigration

# Schema synchronization (development only)
npm run schema:sync

# Database seeding
npm run seed:run
```

### **Development Debugging**
```bash
# Start with debugging enabled
npm run start:debug

# Debug specific module
DEBUG=nest:* npm run start:dev

# TypeORM query logging
DEBUG=typeorm:* npm run start:dev
```

## 🤝 **Contributing**

### **Development Workflow**
1. Check [backend architecture guide](.github/docs/architecture.md)
2. Review [NestJS patterns](.github/docs/patterns.md)
3. Follow the [development quick reference](.github/docs/quick-reference.md)
4. Check [pending backend tasks](.github/todo.md)

### **Code Standards**
- **NestJS Best Practices** - Follow official NestJS guidelines
- **TypeScript Strict Mode** - Enabled with comprehensive type checking
- **ESLint + Prettier** - Automated code formatting and linting
- **Conventional Commits** - Standardized commit message format
- **API Documentation** - Swagger/OpenAPI documentation required

### **Security Guidelines**
- **Input Validation** - All DTOs must have comprehensive validation
- **Authentication** - JWT tokens required for all non-public endpoints
- **Authorization** - Ownership validation for user-specific resources
- **Rate Limiting** - Implement throttling for sensitive endpoints
- **Error Handling** - Never expose internal system details

---

**gifts moment capsule Backend** - Built with NestJS 11 and enterprise-grade architecture 🚀
