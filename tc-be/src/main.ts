import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(helmet());

    const configService = app.get(ConfigService);

    // CORS configuration
    const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:4200').split(',');
    const corsMethods = configService.get<string>('CORS_METHODS', 'GET,POST,PUT,DELETE,PATCH,OPTIONS').split(',');
    const corsHeaders = configService.get<string>('CORS_HEADERS', 'Content-Type,Authorization,Accept,Origin,X-Requested-With').split(',');
    const corsCredentials = configService.get<boolean>('CORS_CREDENTIALS', false);

    app.enableCors({
        origin: corsOrigins,
        methods: corsMethods,
        allowedHeaders: corsHeaders,
        credentials: corsCredentials,
    });

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('Gift Moments')
        .setVersion('1.0')
        .setDescription(`📦 Gift Moments API Documentation`)
        .addTag('Gift Moments', 'Gift Moments entry point')
        .addTag('auth', 'Gift Moments authorization')
        .addTag('admin', 'Gift Moments administration')
        .addTag('users', 'Users that can create a capsule')
        .addTag('library', 'User content\' s library')
        .addTag('capsules', 'User\'s capsules')
        //        .addTag('items', 'Items contained in a capsule')
        //        .addTag('recipients', 'Recipients that can view the capsule when opened')
        .addTag('dashboard', 'Activities / Notifications manager')
        .addTag('subscriptions', 'User subscription')
        .addTag('subscription-plans', 'Subscriptions type list')
        .addTag('payments', 'Payment management')
        //.addTag('contents', 'Retrieve specific content')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                in: 'header',
            },
            'jwt-auth',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    const swaggerOptions = {
        swaggerOptions: {
            defaultModelsExpandDepth: -1
        }
    }

    const methodOrder = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    const sortedPaths = {};

    Object.keys(document.paths).sort().forEach(path => {
        sortedPaths[path] = {};
        const methods = Object.keys(document.paths[path]);

        methods.sort((a, b) => {
            const indexA = methodOrder.indexOf(a.toLowerCase());
            const indexB = methodOrder.indexOf(b.toLowerCase());
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        methods.forEach(method => {
            const operation = document.paths[path][method];
            operation.operationId = `${methodOrder.indexOf(method.toLowerCase()) + 1}_${operation.operationId || method + '_' + path.split('/').pop()}`;
            sortedPaths[path][method] = operation;
        });
    });

    document.paths = sortedPaths;
    SwaggerModule.setup('api-docs/v1', app, document, swaggerOptions);

    if (configService.get('NODE_ENV') !== 'production') {
        try {
            writeFileSync('../docs/openapi3-spec.json', JSON.stringify(document, null, 2));
            console.log('✅ OpenAPI spec written successfully');
        } catch (error) {
            console.warn('⚠️ Could not write OpenAPI spec file:', error.message);
        }
    }

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    const port = configService.get<number>('PORT', 3000);
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();