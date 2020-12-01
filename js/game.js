import Player, { players } from './player.js';
import SAOLchecker from './SAOLchecker.js';
import Board from './board.js';
import Score from './score.js';

export default class Game {

  constructor(tilesFromBag) {


    this.createBoard();
    this.render();
    this.showPlayerButtons();
    this.tilesFromBag = tilesFromBag;
    this.playerIndex = 0;
    //this.lettersFromFile();
    this.start();
  }


  /* Starting up the game with start() to set how's the first player */

  start() {
    // console.log('im inside start');

    this.playerTurn();

    // When click on 'Stå över'-button, there will be a new player and the board will render
    $('.pass').on('click', () => {
      // console.log('im clicking the pass button');
      this.playerTurn();
      this.render();
    });

    // When click on 'Lägg brickor'-button, there will be a new player and the board will render
    // Shoul also count score on word
    $('.play-tiles').on('click', () => {
      console.log('im clicking the play tiles button');
      // get points for word
      // CountScores(); ??? 

      this.playerTurn();
      this.render();

    });

  }

  async playerTurn() {
    // console.log('current index ' + this.playerIndex);
    // console.log('player array length ' + players.length);

    /* Alternative to switch between players turns */
    // If player index is more och equal to player array length then go back to index 0.
    // Because the current player is the last player, and the next player will be the first.
    // It all starts over.
    if (this.playerIndex >= players.length) {
      this.playerIndex = 0;
    }

    // Set this.player to the player with playerindex in players array
    // so this.player will be the new player each round
    this.player = players[this.playerIndex].name;

    // Set this.tiles to empty so the current players tiles can be this.tiles
    this.tiles = [];

    // set this.tiles to the current players tiles
    this.tiles.push(players[this.playerIndex].tiles[0]);

    // If the players has played tiles and they have less than 7, push new tiles to their playing board
    if (this.tiles[0].length < 7) {
      // numberOfTiles will be how many new tiles the player will need
      let numberOfTiles = 0;
      for (let i = 0; i < 7; i++) {
        if (!this.tiles[0][i]) {
          numberOfTiles++;
          // console.log(numberOfTiles);
        }
      }

      // newTiles will get x number of new tiles from tilesFromBag
      let newTiles = [...this.tilesFromBag.splice(0, numberOfTiles)];
      // push the new tiles to the players current tiles
      for (let i = 0; i < numberOfTiles; i++) {
        this.tiles[0].push(newTiles[i]);
      }

      // console.log(this.tiles[0]);
      // console.log(this.tiles);
    }

    /* Disable all other players tile fields */

    this.showAndHidePlayers();

    // Inrease player index so when new round, the next player will this.player
    this.playerIndex++;
    // console.log('new index ' + this.playerIndex);

  }

  showAndHidePlayers() {
    // Hide all other players tileboards except for the current player
    for (let i = 0; i < players.length; i++) {
      // If this.player ( a name ) is the same as any player in the array
      // Than show the players tileboard
      if (this.player === players[i].name) {
        // console.log(`#box${players.indexOf(players[i])} ska visas`);
        $(`#box${players.indexOf(players[i])}`).show();
      } else {
        // Else hide the players tileboards
        // console.log(`#box${players.indexOf(players[i])} ska inte visas`);
        $(`#box${players.indexOf(players[i])}`).hide();
      }
    }
  }

  addEvents() {


    console.log('im inside add events');

    $('.board > div').mouseenter(e => {
      let me = $(e.currentTarget);
      if ($('.is-dragging').length && !me.find('.tiles').length) {
        // If the current square on the board has a class '.tile', don't add hover,
        // because then there already is a tile in that square
        if (me.find('.tile').length === 0) {
          me.addClass('hover');
        }
      }
    });
    $('.board > div').mouseleave(e =>
      $(e.currentTarget).removeClass('hover')
    );

    let that = this;

    // Drag-events: We only check if a tile is in place on dragEnd
    // $('.stand .tile').not('.none').draggabilly({ containment: 'body' })
    $('.playertiles').not('.none').draggabilly({ containment: 'body' }).on('dragEnd', e => {

      console.log('were in player tiles draggabilly on');
      // get the dropZone square - if none render and return

      let $dropZone = $('.hover');
      if (!$dropZone.length) { this.render(); return; }

      // console.log($dropZone);

      // the index of the square we are hovering over
      let squareIndex = $('.board > div').index($dropZone);
      // console.log('square index is ' + squareIndex);
      // console.log();

      // convert to y and x coords in this.board
      let y = Math.floor(squareIndex / 15);
      let x = squareIndex % 15;
      // console.log('y: ' + y);
      // console.log('x: ' + x);
      // console.log('Tiles on this position: ');
      // console.log(!this.board[y][x].tile);

      // the index of the chosen tile

      let $tile = $(e.currentTarget);
      // Check what index the tile have that lays in a div under each players individual id="box"
      let tileIndex = $(`#box${(this.playerIndex - 1)} > div`).index($tile);
      // console.log($tile);
      // console.log('the current player tile is ' + tileIndex);

      // If board doesn't have any div with class '.tile' then there isn't any tiles on board
      if (!$('.board > div > .tile').length) {
        // If there isn't any tiles on board, and the squareIndex is not in the middle
        // Re-render and return
        if (squareIndex !== 112) {
          this.render();
          return;
        }
        // If there is at least one tile on board then check if the new tile the player is trying to drop
        // has another tile around, if not - re-render and return. Or else place the tile and render the new board (As before)
        // It most be specific conditions for the board squares on the outer rim otherwise it will return error 
        // when we try to check if a square on the board has a tile and that square doesn't exist.
      } else if ((y === 0 && x === 0 && !this.board[y + 1][x].tile && !this.board[y][x + 1].tile)
        || (x === 0 && y > 0 && y < 14 && !this.board[y - 1][x].tile && !this.board[y + 1][x].tile && !this.board[y][x + 1].tile)
        || (x === 14 && y === 0 && !this.board[y][x - 1].tile && !this.board[y + 1][x].tile)
        || (x === 14 && y > 0 && y < 14 && !this.board[y - 1][x].tile && !this.board[y - 1][x].tile && !this.board[y][x - 1].tile)
        || (x === 14 && y === 14 && !this.board[y - 1][x].tile && !this.board[y][x - 1].tile)
        || (y === 14 && x > 0 && x < 14 && !this.board[y][x + 1].tile && !this.board[y][x - 1].tile && !this.board[y - 1][x].tile)
        || (y === 14 && x === 0 && !this.board[y - 1][x].tile && !this.board[y][x + 1].tile)
        || (y === 0 && x > 0 && x < 14 && !this.board[y][x - 1].tile && !this.board[y][x + 1].tile && !this.board[y + 1][x].tile)
        || (x > 0 && x < 14 && y > 0 && y < 14 && !this.board[y - 1][x].tile && !this.board[y + 1][x].tile && !this.board[y][x + 1].tile && !this.board[y][x - 1].tile)) {
        this.render();
        return;
      }

      // Add the moved tile from players tile array to the boards tiles
      // console.log(that.player);
      // console.log(that.tiles[0]);
      this.board[y][x].tile = that.tiles[0].splice(tileIndex, 1);
      // console.log(this.board);
      // console.log(this.board[y][x].tile);
      // When droped a tile on the board, re-render

      this.checkNewWordsOnBorad(y, x);

      this.render();

    });

  }


  render() {


    // $('.board').remove();
    // let $board = $('<div class="board"/>').appendTo('.playing-window');
    // this.board.flat().forEach(x => $board.append('<div/>'));

    //********************************************* */


    if (!$('.board').length) {
      $('.playing-window').append(`
        <div class="board"></div>
        <div class="tiles"></div>
      `);
    }


    $('.board').empty();
    // render the board RENDER THE BOARD AFTER EACH PLAYER
    //console.log(this.board.flat());
    $('.board').html(
      this.board.flat().map(x => `
        <div class="${x.special ? 'special-' + x.special : ''}">
        ${x.tile ? `<div class="tile">${x.tile[0].char}<div class="points">${x.tile[0].points}</div></div>` : ''}
        </div>
      `).join('')
    );

    // this.checkForNewWords(y, x);

    // Empty the player tileboards window before rendering, otherwise there will be double each time it renders
    $('.playing-window-left').empty();
    // showPlayers needs to be first
    this.showPlayers();
    // showAndHide cannot be done unless we have read the showPlayers method
    this.showAndHidePlayers();
    // We want the addEvents to be last so the player can make their move
    this.addEvents();
  }

  checkNewWordsOnBorad(y, x) {

    let wordH = [];  //to save  all the infromation on the horisontal 
    let wordV = [];  //to save all the infromation on the vertical 
    let wordArray = [];  //to save the final word array(word,points,extra points word times) 
    let c = ''; //temp variable to save this.board[i][j].tile[0].char
    let p = 0;  //temp variable to save this.board[i][j].tile[0].points;
    let s = ''; //temp variableto save this.board[i][j].special

    console.log('y: ' + y);
    console.log('x: ' + x);

    // CHECK HORISONTAL
    for (let i = 0; i < this.board.length; i++) {
      // CHECK VERTICAL
      for (let j = 0; j < this.board[i].length; j++) {
        // If we come across a board square that has a tile on it 
        if (this.board[i][j].tile) {
          // if (i === y && j === x) {
          // First check if we have another tile above/below AND side/side
          // Add the letter to both vertical and horisontal word  
          if ((this.board[i + 1][j].tile || this.board[i - 1][j].tile) && (this.board[i][j + 1].tile || this.board[i][j - 1].tile)) {
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordV.push({ x: i, y: j, char: c, points: p, special: s });
            wordH.push({ x: i, y: j, char: c, points: p, special: s });
            // If we only have a tile above/below, add the letter to vertical word
          } else if (this.board[i + 1][j].tile || this.board[i - 1][j].tile) {
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordV.push({ x: i, y: j, char: c, points: p, special: s });
            // If we only have a tile side/side, add the letter to horisontal word
          } else if (this.board[i][j + 1].tile || this.board[i][j - 1].tile) {
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordH.push({ x: i, y: j, char: c, points: p, special: s });
            // If we have a tile but no other tile beside us, add to both vertical and horisontal word
            // This will only be at the start of game, when the first tile is placed
          } else {
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordV.push({ x: i, y: j, char: c, points: p, special: s });
            wordH.push({ x: i, y: j, char: c, points: p, special: s });
          }
        }
      }
    }
    wordV.sort((a, b) => a.y > b.y ? -1 : 1);
    wordH.sort((a, b) => a.x > b.x ? -1 : 1);
    console.log('vertical wordV: ', wordV);
    console.log('horisontal wordH: ', wordH);

    //Collect all the letters from same column and made it up to en word. 
    //Calulate the points of word even if it has extra points(2x letters,3x letters). 
    //save the words multiple times  if it has extra points(2x word,3x word). 
    if (wordV.length > 1) {
      let word = '';
      let points = 0;
      let multiple = 1;
      for (let i = 0; i < wordV.length; i++) {
        if (((i < wordV.length - 1) && (wordV[i].y === wordV[i + 1].y)) || ((i > 0) && (wordV[i].y === wordV[i - 1].y))) {
          word += wordV[i].char;
          if (wordV[i].special) {
            if ((wordV[i].special) === '2xLS') { points += 2 * wordV[i].points }
            else if ((wordV[i].special) === '3xLS') { points += 3 * wordV[i].points }
            else if ((wordV[i].special) === '2xLW') { multiple *= 2 }
            else if ((wordV[i].special) === '3xLW') { multiple *= 3 }
            else points += wordV[i].points;
          }
          else {
            points += wordV[i].points;
          }
        }
        //if it is another column then save the word to wordArray. Initialize variables in order to save the new words.
        if ((i === wordV.length - 1) || (wordV[i].y !== wordV[i + 1].y)) {
          wordArray.push({ word: word, points: points, multiple: multiple })
          word = '';
          points = 0;
          multiple = 1;
        }

      }
      console.log('the words currently on board:', wordArray);
    }
    //Collect all the letters from same row and made it up to en word. 
    //Calulate the points of word even if it has extra points(2x letters,3x letters). 
    //save the words multiple times  if it has extra points(2x word,3x word). 
    if (wordH.length > 1) {
      let word = '';
      let points = 0;
      let multiple = 1;
      for (let i = 0; i < wordH.length; i++) {
        if (((i < wordH.length - 1) && (wordH[i].x === wordH[i + 1].x)) || ((i > 0) && (wordH[i].x === wordH[i - 1].x))) {
          word += wordH[i].char
          if (wordH[i].special) {
            if ((wordH[i].special) === '2xLS') { points += 2 * wordH[i].points }
            else if ((wordH[i].special) === '3xLS') { points += 3 * wordH[i].points }
            else if ((wordH[i].special) === '2xLW') { multiple *= 2 }
            else if ((wordH[i].special) === '3xLW') { multiple *= 3 }
            else points += wordH[i].points;
          }
          else {
            points += wordH[i].points;
          }
        }
        //if it is another row then save the word to wordArray. Initialize variables in order to save the new words.
        if ((i === wordH.length - 1) || (wordH[i].x !== wordH[i + 1].x)) {
          wordArray.push({ word: word, points: points, multiple: multiple })
          word = '';
          points = 0;
          multiple = 1;
        }
      }
      console.log('the words currently on board:', wordArray);
    }
    this.countScore(wordArray);
  }


  createBoard() {
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


  showPlayers() {
    players.forEach(player => {
      let index = 0
      $('.playing-window-left').append(`
        <div class="playerWrapper">
        <div class="playername">${player.name}</div>
        <div class="score">Poäng :<div id="score${players.indexOf(player)}"></div></div>
        </div>
        <div class="tiles-box"><div id="box${players.indexOf(player)}"></div></div>
        `);
      // console.log(player.tiles[0].length);
      while (index < player.tiles[0].length) {
        // console.log('appending tiles');
        $(`#box${players.indexOf(player)}`).append(`
        <div class="playertiles">${player.tiles[0][index].char}<div class="points">${player.tiles[0][index].points}</div>
      `);

        index++;
      }
      $(`#box${players.indexOf(player)}`).append(`
        <div class="playertiles ${player.tiles[1][0].char === ' ' ? '' : 'none'}"></div>
      `);

    });
    // console.log(players);

  }

  showPlayerButtons() {
    $('.playing-window').append(
      `<button class="play-tiles">Lägg brickor</button>
      <button class="pass">Stå över</button>
      <style>
      .play-tiles {
        font-family: 'Neucha', cursive;
        font-size: 20px;
         background-color: white;
         border: 3px solid aliceblue; 
         border-radius: 3px;
      }
      .pass {
        font-family: 'Neucha', cursive;
        font-size: 20px;
         background-color: white;
         border: 3px solid aliceblue; 
         border-radius: 3px;
      }
      </style>
      `
    );
  }

  async lettersFromFile() {
    let letters = [];
    // Read the tile info from file
    (await $.get('data/tiles.txt'))
      .split('\r').join('') // Windows safe :)
      .split('\n').forEach(x => {
        // For each line split content by ' '
        // x[0] = char, x[1] = points, x[2] = occurences
        x = x.split(' ');
        x[0] = x[0] === '_' ? ' ' : x[0];
        // add tiles to this.tiles
        letters.push({ char: x[0], points: +x[1] });
      });
    return letters;
  }

  async countScore(wordsInArray) {
    console.log('------im in countScore()------');
    console.log(wordsInArray[0])

    let wordsToCheck = [`${wordsInArray[0]}`].map(x => x.toUpperCase());

    //read the file to the array
    let letters = await this.lettersFromFile();

    for (let word of wordsToCheck) {
      console.log(word + "is: " + await SAOLchecker.scrabbleOk(word))

      if (await SAOLchecker.scrabbleOk(word) === false) {
        // (false === false) --> (true)
        $('body').append('<div class="boxForWord"><span class="word">' +
          word + '</span><hr>ok in Scrabble: ' +
          // check if ok scrabble words
          // by calling await SAOLchecker.scrabbleOk(word)
          await SAOLchecker.scrabbleOk(word) + '<hr>' +
          // add explanations/entries from SAOL in body
          // by using await SAOLchecker.lookupWord(word)
          // (maybe fun to show in scrabble at some point?)
          await SAOLchecker.lookupWord(word) + '</div');
        continue;
      }
      if (await SAOLchecker.scrabbleOk(word)) {
        $('body').append(`<div class="boxForWord" id="${word}-box"><span class="word">` +
          word + `</span><hr>ok in Scrabble: ` +
          // check if ok scrabble words
          // by calling await SAOLchecker.scrabbleOk(word)
          await SAOLchecker.scrabbleOk(word) + '<hr>');
        /*     let wordPoints = 0;
             for (let i = 0; i < word.length; i++) {
               let letterInWord = word.charAt(i);
               //find the letters points          
               let letterPoints = letters
                 // get char
                 .filter(letter => letter.char === letterInWord)
                 // get their points
                 .map(letter => letter.points);
               let points = letterPoints[0];
               wordPoints += points;
             } */
        $(`#${word}-box`).append(`<div><span class="points"></span><hr> points: ${wordPoints}<hr>` +
          // add explanations/entries from SAOL in body
          // by using await SAOLchecker.lookupWord(word)
          // (maybe fun to show in scrabble at some point?)
          await SAOLchecker.lookupWord(word) + '</div');
      }

    }

  }


}