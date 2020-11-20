

import Game from './game.js';
import { players } from './player.js';


export default class Board {
  //constructor() {
  async start(tilesFromBag) {
    // Create some tiles


    /*this.tiles = 'ABCDEFGH'.split('')
      .map(x => ({ char: x }));*/
    new Game(tilesFromBag);
    this.createBoard();
    this.render();


    //this.createBoard();
    // this.render();

    this.showPlayers();
    this.showPlayerButtons();

    //console.log(this.board);



  }


  createBoard() {
    // this.board = [...new Array(15)].map(x => new Array(15).fill({
    //   specialValue: '2w', tile: undefined
    // }));

    this.board = [...new Array(15)].map(x => [...new Array(15)].map(x => ({})));


    // Add some info about special squares
    // Triple word score (3xWs) or swedish (3xOp) Op = Ordpoäng
    [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]]
      .forEach(([y, x]) => this.board[y][x].special = '3xWS');
    // Double letter score (2xLs) or swedish (2xBp) Bp = bokstavspoäng
    [[0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], [7, 11],
    [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]]
      .forEach(([y, x]) => this.board[y][x].special = '2xLS');
    // Triple letter score (3xLs) or swedish (3xOp)
    [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]]
      .forEach(([y, x]) => this.board[y][x].special = '3xLS');
    // Double word score (2xWs) or swedish (3xBp)
    [[1, 1], [1, 13], [2, 2], [2, 12], [3, 3], [3, 11], [4, 4], [4, 10], [7, 7], [10, 4], [10, 10], [11, 3], [11, 11],
    [12, 2], [12, 12], [13, 1], [13, 13]]
      .forEach(([y, x]) => this.board[y][x].special = '2xWS');
    this.board[7][7].special = 'middle-star';
  }

  render() {
    // add the tiles and board divs if non-existant
    if (!$('.board').length) {
      $('body').append(`
        <div class="board"></div>
        <div class="tiles"></div>
      `);
    }

    // render the board
    $('.board').html(
      this.board.flat().map(x => `
        <div class="${x.special ? 'special-' + x.special : ''}">
          ${x.tile ? `<div class="tile">${x.tile.char}</div>` : ''}
        </div>
      `).join('')
    );

    // render the tiles
    /* $('.tiles').html(
       this.tiles.map(x => `<div>${x.char}</div>`).join('')
 
     );*/

    // this.addEvents();


  }


  addEvents() {
    // Set a css-class hover on the square the mouse is above
    // if we are dragging and there is no tile in the square
    //.board > div
    $('.board > div').mouseenter(e => {
      let me = $(e.currentTarget);
      if ($('.is-dragging').length && !me.find('.tile').length) {
        me.addClass('hover')
      }
    });
    $('.board > div').mouseleave(e =>
      $(e.currentTarget).removeClass('hover')
    );

    // Drag-events: We only check if a tile is in place on dragEnd
    //tiles > div
    $('.playertiles').draggabilly().on('dragEnd', e => {
      // get the dropZone square - if none render and return
      let $dropZone = $('.hover');
      if (!$dropZone.length) { this.render(); return; }

      // the index of the square we are hovering over
      let squareIndex = $('.board > div').index($dropZone);

      // convert to y and x coords in this.board
      let y = Math.floor(squareIndex / 15);
      let x = squareIndex % 15;

      // the index of the chosen tile
      let $tile = $(e.currentTarget);
      //.tiles > div
      let tileIndex = $('.playertiles').index($tile);

      // put the tile on the board and re-render
      this.board[y][x].tile = this.tiles.splice(tileIndex, 1)[0];
      this.render();
    });
  }

  showPlayers() {
    players.forEach(player => {
      let index = 0
      $('.playing-window-left').append(`
        <div class="playername">${player.name}</div>
        <div class="tiles-box"><div id="box${players.indexOf(player)}"></div></div>
        `);
      console.log(player.tiles[0].length);
      while (index < player.tiles[0].length) {
        console.log('appending tiles');
        $(`#box${players.indexOf(player)}`).append(`
        <div class="playertiles">${player.tiles[0][index].char}<div class="points">${player.tiles[0][index].points}</div>
      `);

        index++;
      }
      $(`#box${players.indexOf(player)}`).append(`
        <div class="playertiles ${player.tiles[1][0].char === ' ' ? '' : 'none'}"></div>
      `);

    });
    console.log(players);
    this.addEvents();
  }

  showPlayerButtons() {
    $('.playing-window').append(
      `<button class="play-tiles">Lägg brickor</button>
      <button class="pass">Stå över</button>`
    );
  }


}
