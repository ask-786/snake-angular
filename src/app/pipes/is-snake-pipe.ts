import { Pipe, PipeTransform } from '@angular/core';
import { Coord } from '../model/model';

@Pipe({
  name: 'isSnake',
})
export class IsSnakePipe implements PipeTransform {
  transform(snake: Coord[], x: number, y: number) {
    return snake.some((el) => el.x === x && el.y === y);
  }
}
