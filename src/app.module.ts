import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DestinationsModule } from './destination/destination.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TripModule } from './trip/trip.module';
import { ProductsModule } from './product/product.module';
import { InformationsModule } from './information/information.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { CoreModule } from './core/core.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@bemycluster.lsmhbr1.mongodb.net/BeMyGuide?retryWrites=true&w=majority`,
    ),
    CoreModule,
    DestinationsModule,
    UserModule,
    TripModule,
    ProductsModule,
    InformationsModule,
    MailModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'user/reset-password', method: RequestMethod.POST },
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/loggedIn', method: RequestMethod.GET },
      )
      .forRoutes(
        { path: 'user/me', method: RequestMethod.GET },
        { path: 'user/:id', method: RequestMethod.ALL },
        { path: 'administration/*', method: RequestMethod.ALL },
      );
  }
}
