import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import { User } from "src/user/entities/user.entity";
import { Location } from "src/location/entities/location.entity";
import { Category } from "src/location/entities/category.entity";
import { DataSource } from "typeorm";
import { WithLengthColumnType } from "typeorm/driver/types/ColumnTypes";
import { HttpModule } from "@nestjs/axios";
import { LocationModule } from "src/location/location.module";
import { UserSubscriber } from "src/subscribers/user_subscriber";
import { Plan } from "src/plan/entities/plan.entity";
import { PlanModule } from "src/plan/plan.module";
import { Event } from "src/plan/entities/event.entity";
import { LocationHour } from "src/location/entities/location_hour.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: "postgres",
        host: config.get<string>("DB_HOST"),
        extra: {
          socketPath: config.get<string>("DB_SOCKETPATH"),
        },
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USERNAME"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_NAME"),
        entities: [User, Location, Category, Plan, Event, LocationHour],
        subscribers: [UserSubscriber],
        synchronize: false,
        logging: config.get<string>("NODE_ENV") !== "production",
      }),
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options);

        // Push vector into length column type
        dataSource.driver.supportedDataTypes.push(
          "vector" as WithLengthColumnType,
        );
        dataSource.driver.withLengthColumnTypes.push(
          "vector" as WithLengthColumnType,
        );

        // Initialize datasource
        await dataSource.initialize();

        return dataSource;
      },
    }),
    UserModule,
    AuthModule,
    LocationModule,
    PlanModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 1,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
