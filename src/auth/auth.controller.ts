import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtectd } from './decorators/role-protectd.decorator';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User,
    // TODO - Implement this method
  ){
    return this.authService.checkAuthStatus(user)
  }


  @Get('private')
  @UseGuards( 
    AuthGuard()
  )
  testingPrivateRoute(
    //@Req() req: Express.Request,
    @GetUser() user: User,
    @GetUser('email') email: string,

    @RawHeaders() rawHeaders: string[]
  ) {
    //console.log(req.user)

    console.log(user)

    return {
      message: 'This is a private route',
      user: user,
      email: email,
      rawHeaders: rawHeaders
    };
  }

  @Get('private2')
  @RoleProtectd(ValidRoles.admin, ValidRoles.superUser)
  //@SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards( 
    AuthGuard(),
    UserRoleGuard
  )
  privateRoute2(
    @GetUser() user: User,
  ){

    return {
      ok: true,
      user: user
    }

  }


  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  privateRoute3(
    @GetUser() user: User,
  ){

  }

}
