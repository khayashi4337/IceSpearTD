import './style.css';
import { Game } from './game/Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    // game.start() is called by Menu
});
