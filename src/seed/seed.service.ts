import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { In, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class SeedService {
  constructor(
    private readonly ProductsService: ProductsService,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  )
  {}


  async runSeed() {

    await this.deleteTables();
    const admin: User = await this.insertNewUsers();


    await this.insertNewProducts( admin );


    return 'This action a new seed';
  }


  private async deleteTables(){
    await this.ProductsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    await queryBuilder
      .delete()
      .where({})
      .execute();

    return true;
  }

  private async insertNewUsers(){
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach(seedUser => {
      let { password, ...userData } = seedUser;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      
      });
      users.push(user);
    });

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];

  }


  private async insertNewProducts( user: User){
    await this.ProductsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach(product => {
      insertPromises.push(this.ProductsService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }

}
