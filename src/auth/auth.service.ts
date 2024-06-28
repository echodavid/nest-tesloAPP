import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,


    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {

    try {

      const {  password, ...userData} =   createUserDto;


      //prepara la informacion para ser guardada en la base de datos
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      //guarda la informacion en la base de datos
      await this.userRepository.save(user);
      
      const { password: passwordUser, ...userWithoutPassword } = user;

      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: user.id }),
      };

    } catch (error) {
      this.handleDBError(error);
    }

    return 'This action adds a new auth';
  }

  async login(loginUserDto: LoginUserDto) {
      const {password, email} = loginUserDto;
      //busca el usuario en la base de datos
      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true, id: true}
      });

      //si no existe el usuario
      if (!user) {
        throw new UnauthorizedException('Not valid credentials - email');
      }
      if ( !bcrypt.compareSync(password, user.password) ) {
        throw new UnauthorizedException('Not valid credentials - password');
      }

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };

  }


  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private userWithoutPassword(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }


  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
  



  private handleDBError(error: any) : never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('check the logs for more information');
  }

}
