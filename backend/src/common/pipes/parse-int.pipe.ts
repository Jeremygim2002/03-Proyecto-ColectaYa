import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue)) {
      throw new BadRequestException(`${metadata.data} debe ser un número válido`);
    }

    if (parsedValue <= 0) {
      throw new BadRequestException(`${metadata.data} debe ser un número positivo`);
    }

    return parsedValue;
  }
}
