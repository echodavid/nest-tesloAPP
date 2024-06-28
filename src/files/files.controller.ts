import { BadRequestException, Controller, Get, Header, Param, Post, Res, StreamableFile, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter,fileNamer } from './helpers/index';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}



  @Get('product/:imageName')
  @Header('Content-Type', 'image/jpeg')
  findProductImage(
    //@Res() res: Response, //indica que la respuesta se hace manualmente
    @Param('imageName') imageName: string,
  ){

    const path = this.filesService.getStaticProductImage(imageName);

    const stream = createReadStream(this.filesService.getStaticProductImage(imageName));
    return new StreamableFile(stream);
  }



  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFilter,
    //limits: { fileSize: 1000},
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
  }))
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File) {
      
      if(!file) 
        return new BadRequestException('No file provided');

      const secure_url = `${this.configService.get('HOST_API')}/product/${file.filename}`

      return {
        secure_url,
      };
  }
}
