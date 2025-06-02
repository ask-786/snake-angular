import { Pipe, PipeTransform } from '@angular/core';
import { Coord } from '../model/model';

@Pipe({
  name: 'isFood',
})
export class IsFoodPipe implements PipeTransform {
  transform(food: Coord, x: number, y: number) {
    return food.x === x && food.y === y;
  }
}
