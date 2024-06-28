

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if(!file) return callback(new Error('No file provided'), false);

    const fileExtension = file.mimetype.split('/')[1]
    const validExtension = ['jpeg', 'jpg', 'png'];

    if(validExtension.includes(fileExtension)) 
        return callback(null, true)



    callback(null, false);

}