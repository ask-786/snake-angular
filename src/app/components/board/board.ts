import { afterNextRender, Component, signal } from '@angular/core';
import type { Coord } from '../../model/model';
import { NgClass } from '@angular/common';
import { IsSnakePipe } from '../../pipes/is-snake-pipe';
import { IsFoodPipe } from '../../pipes/is-food-pipe';

@Component({
  selector: 'app-board',
  imports: [NgClass, IsSnakePipe, IsFoodPipe],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  snake = signal<Coord[]>([{ x: 9, y: 9 }]);
  food = signal<Coord>({ x: 19, y: 0 });
  direction = signal({ x: 0, y: 1 });
  intervalTime = signal(200);
  board = signal<Coord[][]>([]);

  gameStatus = signal<'playing' | 'over' | 'paused'>('playing');

  interval?: NodeJS.Timeout;

  readonly boardSize = 20;

  constructor() {
    this.board.update(() => {
      const board: Coord[][] = [];
      for (let x = 0; x < this.boardSize; x++) {
        const row = [];
        for (let y = 0; y < this.boardSize; y++) {
          row.push({ x, y });
        }
        board.push(row);
      }
      return board;
    });

    afterNextRender(() => {
      window.addEventListener('keydown', this.onKeyDown.bind(this));
      this.startGame();
    });
  }

  startGame() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(this.moveSnake.bind(this), this.intervalTime());
  }

  onKeyDown(event: KeyboardEvent) {
    const { x, y } = this.direction();

    switch (event.code) {
      case 'ArrowUp':
        if (x === 0 && y === 1) return;
        this.direction.update(() => ({
          x: 0,
          y: -1,
        }));
        break;

      case 'ArrowDown':
        if (x === 0 && y === -1) return;
        this.direction.update(() => ({
          x: 0,
          y: 1,
        }));
        break;

      case 'ArrowRight':
        if (x === -1 && y === 0) return;
        this.direction.update(() => ({
          x: 1,
          y: 0,
        }));
        break;

      case 'ArrowLeft':
        if (x === 1 && y === 0) return;
        this.direction.update(() => ({
          x: -1,
          y: 0,
        }));
        break;

      case 'Space':
        this.pauseOrContinue();
        break;

      case 'Escape':
        this.restartGame();
        break;
    }
  }

  restartGame() {
    const reset = () => {
      this.snake.set([{ x: 9, y: 9 }]);
      this.direction.set({ x: 0, y: 1 });
      this.gameStatus.set('playing');
      this.startGame();
    };

    if (this.gameStatus() === 'over') reset();

    const confirmation = confirm('Are you sure you want to restart the game?');

    if (confirmation) reset();
  }

  pauseOrContinue() {
    if (this.gameStatus() === 'over') return;

    if (this.gameStatus() === 'playing') {
      this.gameStatus.set('paused');
      if (this.interval) {
        clearInterval(this.interval);
      }
      return;
    }

    this.gameStatus.set('playing');
    this.startGame();
  }

  moveSnake() {
    const head = {
      x: this.snake()[0].x + this.direction().x,
      y: this.snake()[0].y + this.direction().y,
    };

    if (head.x < 0) {
      head.x = this.boardSize - 1;
    }

    if (head.y < 0) {
      head.y = this.boardSize - 1;
    }

    if (head.x >= this.boardSize) {
      head.x = 0;
    }

    if (head.y >= this.boardSize) {
      head.y = 0;
    }

    if (head.x === this.food().x && head.y === this.food().y) {
      this.snake.update((snake) => [head, ...snake]);

      if (this.snake().length % 5 === 0) {
        this.intervalTime.update((time) => Math.max(time - 10, 50));
        this.startGame();
      }

      this.generateFood();
      return;
    }

    if (this.snake().some((el) => el.x === head.x && el.y === head.y)) {
      this.gameStatus.set('over');
      clearInterval(this.interval);
      alert(`Game Over, your score is ${this.snake().length}`);
      return;
    }

    this.snake.update((snake) => [head, ...snake.slice(0, -1)]);
  }

  generateFood() {
    const food = {
      x: Math.floor(Math.random() * this.boardSize),
      y: Math.floor(Math.random() * this.boardSize),
    };

    while (this.snake().some((el) => el.x === food.x && el.y === food.y)) {
      food.x = Math.floor(Math.random() * this.boardSize);
      food.y = Math.floor(Math.random() * this.boardSize);
    }

    this.food.update(() => ({
      x: Math.floor(Math.random() * this.boardSize),
      y: Math.floor(Math.random() * this.boardSize),
    }));
  }
}
