import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ ConfigModule],
      inject: [ConfigService],
      useFactory: ( configService: ConfigService ) => {
        return {
          secret: configService.get('JWT_SECRET'), //es posible que las variables no se declaren antes de que se monte la aplicación, sería mejor ascrincrono
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN') || '2h'
          }
        }
      }
    })


    // JwtModule.register({
    //   secret: process.env.JWT, //es posible que las variables no se declaren antes de que se monte la aplicación, sería mejor ascrincrono
    //   signOptions: { expiresIn: '2h' },
    // }),

  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
