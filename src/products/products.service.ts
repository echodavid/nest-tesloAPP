import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BeforeInsert, DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductImage, Product } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    
    try{

      const {images = [], ...productDetails} = createProductDto;

      //solo crea la instancia del producto
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(
          (image) => this.productImageRepository.create({url: image})
        ),
        user: user
    });

      await this.productRepository.save(product);

      return {...product, images: product.images.map((image) => image.url)};

    } catch (error) {
      this.handleError(error);
    }
    


  }


  // TODO: paginar
  async findAll(paginationDto: PaginationDto) {
    const {limit=5, offset=0} = paginationDto;

    try{
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        }
      });
      return products.map(({ images, ...rest }) => (
        {
          ...rest, 
          images: images.map((image) => image.url)
        }
      ));
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(term: string) {
    let product: Product;
    if(!isNaN(Number(term))){
      product = await this.productRepository.findOneBy({id: Number(term)});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder // query builder
      .where('LOWER(title) =LOWER(:title) or slug =:slug', {
        title: term,
        slug: term
      })
      .leftJoinAndSelect('product.images', 'images')
      .getOne(); //evita la inyeccion de sql


      //product = await this.productRepository.findOneBy({slug: term});
    }
    if(!product){
      throw new BadRequestException('Product not found');
    }
    return product;

  }

  async update(id: number, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate
    });

    if(!product){
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    //crear query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try{
      if(images){

        //eliminacion de las imagenes
        await queryRunner.manager.delete(
          ProductImage, {product: {id: product.id}}
        );

        //creacion de las imagenes, aún no impacta DB
        product.images = images.map(
          (image) => 
            this.productImageRepository.create({url: image})
        );

        // para este punto, aún no se hace el commit de las transacciones
        // se debe hacer el commit para que se guarden los cambios


      } 

      product.user = user;
      //actualiza el producto
      await queryRunner.manager.save(product);
      //await this.productRepository.save(product);

      //hace el commit de las transacciones
      await queryRunner.commitTransaction();
      //libera la conexion
      await queryRunner.release();
      return this.findOnePlain(`${product.id}`);

    } catch (error) {

      //vuelve atrás de las transacciones
      await queryRunner.rollbackTransaction();
      await queryRunner.release();


      this.handleError(error);
    }
  }

  async remove(id: number) {
    const result = await this.productRepository.delete({id: id});
    if(result.affected === 0){
      throw new BadRequestException(`Product with ID ${id} not found`);
    }
    return
  }

  async findOnePlain(term: string){
    const { images = [], ...product } = await this.findOne(term);

    return {
      ...product,
      images: images.map((image) => image.url)
    }
  }


  private handleError(error: any){
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error creating produc -- Check Logs');
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try{
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleError(error);
    }
  }

}
