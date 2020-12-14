import Player from './player.js';
import SAOLchecker from './SAOLchecker.js';
import Board from './board.js';
import Score from './score.js';
import Modal from './modal.js';
// import { players } from './player.js';
import { store } from './network.js';
import Bag from './bag.js';

console.log("Store från början", store)

export default class Game {

  constructor() {
    // When resizing the window realign tiles with squares
    // (some extra code here to make sure we do not connect resize several times)
    window.currentGame = this;
    if (!window.resizeAdded) {
      window.resizeAdded = true;
      $(window).resize(() => currentGame.alignPrelTilesWithSquares());
    }
    console.log('game starting');
    //----johanna
    this.storeCurrentWords = [];
    // this.storeOldWords = [];
    this.newestWords = [];
    // special-rutan
    this.usedSpecialTiles = [];
    //----johanna
    //  this.positionHasCounted = []; //this array to save the position on the board that has counted extra points.
    this.players = [];
    this.boxIndex;
  }

  async checkNewWordsInSAOL() {
    console.log('3. --- checkNewWordsInSAOL ---')
    let all = true;
    let none = true;
    console.log(this.storeCurrentWords.length)
    for (let i = 0; i < this.storeCurrentWords.length; i++) {
      console.log(this.storeCurrentWords[i])
      if (/\s/.test(this.storeCurrentWords[i].word) || await SAOLchecker.scrabbleOk(this.storeCurrentWords[i].word) === false) {
        console.log("one or more words are invalid")
        if (/\s/.test(this.storeCurrentWords[i].word)) {
          alert("Fill in the blank tile!")
        }
        this.newestWords = [];
        all = false;
      }
      else {
        none = false;
      }
    }
    console.log("all: " + all)
    console.log("none: " + none)
    //if all words in wordsArray are ok in Scrabble
    if (all && !none) {
      console.log('this.storeOldWords before countPlayerScore', this.storeOldWords);
      this.countPlayerScore(this.playerIndex);
      this.nextPlayer();
      console.log("end of round this.storeCurrentWords: ", this.storeCurrentWords)
      //console.log("end of round this.wordArrayCommitted", this.wordArrayCommitted)
    } else {
      console.log('--------Not approved word, will remove it from board-------');
      await Modal.alert('Du har ogiltiga ord på brädet!');
      this.removeTilesFromBoard();
    }
  }

  removeTilesFromBoard() {
    $('.playertiles').each((i, el) => {
      let $tile = $(el);
      let p = $tile.data().prelBoardPos;
      // If the tile has the property 'prelBoardPos' and it's not falsey. 
      // The tile thinks its on the board and we need to remove all 'board' propertys since it was a false word
      if (p) {
        // Empty the property 'prelBoardPos' for the tile data 
        delete $tile.data().prelBoardPos;
        // Save the tile that is currently on the board at p.y and p.x position
        let tileOnBoard = this.board[p.y][p.x].tile;
        // Delete the property 'tile' from board, the tile should not have a tile in that position anymore
        delete this.board[p.y][p.x].tile;
        // Get the tileIndex from what tile-box it's currently in (It still think it belongs to a tile-box because we never really move it from the div)
        let tileIndex = $(`#box0 > div > div`).index($tile);
        // Add the tile back to the players this.tiles array, by adding it back at the index it was before and with the tile that was on the board
        this.tiles[0].splice(tileIndex, 0, ...tileOnBoard).join('');
        // Save the tile we just added back, to a local variable
        let tileInArray = this.tiles[0][tileIndex];
        // Delete the tiles property 'onBoard' so it doesn't think that its on the board anymore
        delete tileInArray.onBoard;
        // Style the css back to its original place (the place it was on the player rack)
        $tile.css({ top: '', left: '' });
      }
    });

    // $('.playertiles').each((i, el) => {
    //   $(el).css({ top: 0, left: 0 });
    // });
  }

  async getTiles() {
    this.tilesFromBag = store.tilesFromFile;
  }

  /* Starting up the game with start() to set how's the first player */

  start(playerName) {
    this.getTiles();
    this.board = store.board;
    this.storeOldWords = store.storeOldWords;
    // this.positionHasCounted = store.positionHasCounted;
    this.name = playerName;
    for (let i = 0; i < store.players.length; i++) {
      if (playerName === store.players[i]) {
        this.players.push(new Player(store.players[i], ([...this.tilesFromBag.splice(0, 7)]), 0));
      }
    }
    // store.board = this.createBoard();
    this.playerTurn();
    // this.render();
    this.showPlayerButtons();
    // Set change button to disabled when starting the game
    $('.change-tiles').prop('disabled', true);
    this.buttonEvents();
  }

  endGame() {
    console.log('Sending player to score screen...')
    for (let i = 0; i < store.players.length; i++) {
      if (store.players[i] === this.player) {
        store.score[i] = this.players[0].score;
      }
    }
    $('.playing-window').hide()

    $('.score-screen-container').append(`
        <div class="player-table">
        <p class="scoreboard-text">  Scoreboard</p>
          <div class="player-table-inner">
          </div>
        </div>
      `);
    for (let i = 0; i < store.players.length; i++) {
      //store.players[i].score = this.players[i].score
      $('.player-table-inner').append(`
        <div class="scoreboard-players"> 
        <p class="scoreboard-players-text"> [${i}] ${store.score[i]} ${store.players[i]}</p>
        
        </div>
        `);
      $('.waiting-box').append(`
        <br>
          
          `);
    }
    this.render();
  }

  playerTurn() {
    if (this.tilesFromBag == 0) {
      this.endGame();
    }
    // if (this.tilesFromBag.length == 0) {
    //   alert('game over')
    // }
    if (store.currentPlayer >= store.players.length) {
      store.currentPlayer = 0;
    }
    console.log('This index is currently this.playerindex ' + store.currentPlayer);
    console.log('store players length', store.players.length);

    // This players turn
    this.player = store.players[store.currentPlayer];
    console.log('players name in playerturn ' + this.player);

    // Set this.tiles to empty so the current players tiles can be this.tiles
    this.tiles = [];

    // set this.tiles to the current players tiles
    this.tiles = this.players[0].tiles;
    console.log('this tiles in playerturn');
    console.log(this.tiles);
    // this.tiles.push(players[this.playerIndex].tiles[0]);

    // If the players has played tiles and they have less than 7, push new tiles to their playing board
    if (this.tiles[0].length < 7) {
      // numberOfTiles will be how many new tiles the player will need
      console.log('i have less than 7 tiles in my stand');
      let numberOfTiles = 0;
      for (let i = 0; i < 7; i++) {
        if (!this.tiles[0][i]) {
          numberOfTiles++;
          // console.log(numberOfTiles);
        }
      }
      console.log('number of new tiles', numberOfTiles);
      // newTiles will get x number of new tiles from tilesFromBag
      let newTiles = [...this.tilesFromBag.splice(0, numberOfTiles)];
      // push the new tiles to the players current tiles
      for (let i = 0; i < numberOfTiles; i++) {
        this.tiles[0].push(newTiles[i]);
      }
    }
    console.log('this many tiles are left in the bag: ' + this.tilesFromBag.length);
    this.render();
  }

  addEvents() {
    console.log('Im in addEvents');
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
    $('.playertiles').not('.none').draggabilly({ containment: 'body' })
      // Edited by TF
      .on('dragStart', e => { delete $(e.currentTarget).data().prelBoardPos; console.log('current target data', $(e.currentTarget).data()) })
      .on('dragMove', e => this.alignPrelTilesWithSquares())
      .on('dragEnd', function (e, pointer) {

        // get the tile and the dropZone square
        let $tile = $(e.currentTarget);
        console.log('current target data in dragend', $tile);
        let $dropZone = $('.hover');

        // the index of the square we are hovering over
        let squareIndex = $('.board > div').index($dropZone);
        // convert to y and x coords in this.board
        let y = Math.floor(squareIndex / 15);
        let x = squareIndex % 15;

        // move the tile back to the rack
        $tile.css({ top: '', left: '' });

        // if no drop zone or the square is taken then do nothing
        if (!$dropZone.length || store.board[y][x].tile) {

          console.log('---- IF THERE IS NO DROPZONE ------');

          let { pageX, pageY } = pointer;
          // let tileIndex = +$tile.attr('data-index');
          let $tileBoxSquare = $tile.parent('.tiles-box');
          let tileBoxSquareIndex = +$tileBoxSquare.attr('data-box');
          let $stand = $('#box0');
          let { top, left } = $stand.offset();
          let bottom = top + $stand.height();
          let right = left + $stand.width();


          if (pageX > left && pageX < right
            && pageY > top && pageY > bottom) {

            console.log('------ IM DROPPING THE TILE IN THE PLAYER RACK ------');

            // 1. What is the new box index?
            let newBoxIndex = Math.floor(8 * (pageX - left) / $stand.width());
            console.log('Im dropping the tile on the NEW index', newBoxIndex);
            let $newBoxSquare = $(`.tiles-box[data-box="${newBoxIndex}"]`);

            // 2. Is the new box empty?
            if (!$(`.tiles-box[data-box="${newBoxIndex}"] > div`).length) {

              // 3. Add the tile to the new box and remove it from the old position
              $(`.tiles-box[data-box="${newBoxIndex}"]`).append($tile);
              $(`.tiles-box[data-box="${tileBoxSquareIndex}"]`).empty();

              let so = $newBoxSquare.offset(), to = $tile.offset();
              let swh = { w: $newBoxSquare.width(), h: $newBoxSquare.height() };
              let twh = { w: $tile.width(), h: $tile.height() };
              let pos = {
                left: so.left - to.left + (swh.w - twh.w) / 2.8,
                top: so.top - to.top + (swh.h - twh.h) / 2.8
              };
              $tile.css(pos);

              // 4. Re-arrange the array so it matches to order on the player rack, by empty the array and push it back in the order it is on the rack (only if tiles-box is not empty)
              that.tiles[0] = [];
              console.log('Is the tile empty?', that.tiles[0].length);

              $('.tiles-box').each((i, el) => {
                if ($(`.tiles-box[data-box="${i}"] > div`).length) {
                  let tile = $(`.tiles-box[data-box="${i}"] > div`).text();
                  let letter = tile[0];
                  let points;
                  if (tile.length > 2) {
                    points = tile[1] + tile[2];
                  } else {
                    points = tile[1];
                  }
                  that.tiles[0].push({ char: letter, points: points });
                }
                // If the stile on player rack is weird, remove this
                // if ($tile.is($(el))) {
                //   $(el).removeAttr('style');
                // }
              });
            } else {
              // Added render the tiles when putting tiles back from board to players tiles board
              let so = $tileBoxSquare.offset(), to = $tile.offset();
              let swh = { w: $tileBoxSquare.width(), h: $tileBoxSquare.height() };
              let twh = { w: $tile.width(), h: $tile.height() };
              let pos = {
                left: so.left - to.left + (swh.w - twh.w) / 2.5,
                top: so.top - to.top + (swh.h - twh.h) / 2.5
              };
              $tile.css(pos);
            }
          }
          return;
        }
        // store the preliminary board position with the tile div
        // (jQuery can add data to any element)
        $tile.data().prelBoardPos = { y, x };
        that.alignPrelTilesWithSquares();
        // that.placePrelTilesOnBoard();
      });
  }

  // added by TF
  alignPrelTilesWithSquares() {
    // align tiles that have a prelBoardPos with correct squares
    $('.playertiles').each((i, el) => {
      let $tile = $(el);
      let p = $tile.data().prelBoardPos;
      if (!p) { return; }
      let $square = $('.board > div').eq(p.y * 15 + p.x);
      $tile.css({ top: '', left: '' });
      let so = $square.offset(), to = $tile.offset();
      let swh = { w: $square.width(), h: $square.height() };
      let twh = { w: $tile.width(), h: $tile.height() };
      let pos = {
        left: so.left - to.left + (swh.w - twh.w) / 6,
        top: so.top - to.top + (swh.h - twh.h) / 6
      };
      $tile.css(pos);
    });
  }

  // added by TF
  placePrelTilesOnBoard() {
    console.log('----- IM IN PLACE PREL TILES ON BOARD -----');
    $('.playertiles').each((i, el) => {
      let $tile = $(el);
      let p = $tile.data().prelBoardPos;
      if (!p) { return; }
      let tileIndex = $(`#box0 > div > div`).index($tile);
      let tile = this.tiles[0][tileIndex];
      tile.onBoard = true;
      this.board[p.y][p.x].tile = [tile];
    });
    this.checkNewWordsOnBoard();
    this.tiles[0] = this.tiles[0].filter(x => !x.onBoard);
  }

  // added by TF
  notFirstMoveOrCenterIsTaken() {
    let isFirstMove = this.board.flat().every(square => !square.tile);
    console.log('isFirstMove', isFirstMove);
    let centerIsTaken = !!([...$('.playertiles')].find(x => {
      let p = $(x).data().prelBoardPos;
      return p && p.x === 7 && p.y === 7;
    }));
    console.log('centerIsTaken', centerIsTaken);
    return !isFirstMove || centerIsTaken;
  }

  besideAnotherTile() {
    let isFirstMove = this.board.flat().every(square => !square.tile);
    if (isFirstMove) { return true; }
    let isBesideAnotherTile = false;
    console.log('-------- IM IN BESIDE ANOTHER TILE -------');
    $('.playertiles').each((i, el) => {
      let p = $(el).data().prelBoardPos;
      console.log('What is p ', p);
      if (p) {
        let y = p.y;
        let x = p.x;
        if ((y === 0 && x === 0 && !!this.board[y + 1][x].tile || !!this.board[y][x + 1].tile)
          || (x === 0 && y > 0 && y < 14 && !!this.board[y - 1][x].tile || !!this.board[y + 1][x].tile || !!this.board[y][x + 1].tile)
          || (x === 14 && y === 0 && !!this.board[y][x - 1].tile || !!this.board[y + 1][x].tile)
          || (x === 14 && y > 0 && y < 14 && !!this.board[y - 1][x].tile || !!this.board[y - 1][x].tile || !!this.board[y][x - 1].tile)
          || (x === 14 && y === 14 && !!this.board[y - 1][x].tile || !!this.board[y][x - 1].tile)
          || (y === 14 && x > 0 && x < 14 && !!this.board[y][x + 1].tile || !!this.board[y][x - 1].tile || !!this.board[y - 1][x].tile)
          || (y === 14 && x === 0 && !!this.board[y - 1][x].tile || !!this.board[y][x + 1].tile)
          || (y === 0 && x > 0 && x < 14 && !!this.board[y][x - 1].tile || !!this.board[y][x + 1].tile || !!this.board[y + 1][x].tile)
          || (x > 0 && x < 14 && y > 0 && y < 14 && !!this.board[y - 1][x].tile || !!this.board[y + 1][x].tile || !!this.board[y][x + 1].tile || !!this.board[y][x - 1].tile)) {
          console.log('Im in the if-sats')
          isBesideAnotherTile = true;
        }
      }
    });
    return isBesideAnotherTile;
  }

  render() {
    console.log('jag renderar');

    if (!$('.board').length) {
      $('.playing-window').append(`
        <div class="board"></div>
        <div class="tiles"></div>
      `);
    }

    $('.board').empty();
    // render the board RENDER THE BOARD AFTER EACH PLAYER
    $('.board').html(
      this.board.flat().map(x => `
        <div class="${x.special ? 'special-' + x.special : ''}">
        ${x.tile ? `<div class="tile">${x.tile[0].char}<div class="points">${x.tile[0].points}</div></div>` : ''}
        </div>
      `).join('')
    );

    console.log('Index of this player in store.players:', store.players.indexOf(this.name));
    console.log('Current player in store:', store.currentPlayer);
    if (store.players.indexOf(this.name) === store.currentPlayer) {
      $('.not-your-turn').remove();
    } else {
      $('.playing-window').append(`<div class="not-your-turn"><p>${this.player} spelar just nu...</p></div>`);

    }

    // Empty the player tileboards window before rendering, otherwise there will be double each time it renders
    $('.playing-window-left').empty();
    // showPlayers needs to be first

    this.showPlayers();
    this.showSaolText();

    // showAndHide cannot be done unless we have read the showPlayers method
    // this.showAndHidePlayers();
    // We want the addEvents to be last so the player can make their move

    this.buttonEvents();
    this.addEvents();
    this.changeTiles();
    // this.showPlayerButtons();
  }

  showSaolText() {
    $('.board').append(
      `<section class="saol">🎄SAOL🎄</section>`);
  }

  changeTiles() {
    console.log('Im in changeTiles()');
    $('.change-tiles').prop('disabled', true);
    // When double-clicking on the tiles do this function
    $('.playertiles').not('.none').dblclick(async function () {
      // If the player has played a tile then they cannot change any tiles the same round
      let stop = false;
      $('.playertiles').each((i, el) => {
        let $tile = $(el);
        let p = $tile.data().prelBoardPos;
        if (p) {
          stop = true;
          return;
        }
      });
      if (stop) {
        await Modal.alert('Du kan inte byta brickor när du har lagt brickor på brädet! Lägg tillbaka dem och försök igen!');
        return;
      } else {
        $(this).toggleClass('change');
        // First time someone mark the tile, the button gets enabled
        $('.change-tiles').prop('disabled', false);
        // If no tile has the class 'change', meaning no tile is marked atm
        // Change the buttons value to opposite of what it is now. 
        // If true, set to false. If false, set to true
        if ($('.change').length === 0) {
          $('.change-tiles').prop('disabled', (_, val) => !val);
        }
      }
    });
  }

  async buttonEvents() {
    this.showPlayerButtons();

    console.log('Im in button events');

    // When click on 'Stå över'-button, there will be a new player and the board will render
    $('.pass').on('click', () => {
      console.log('i have clicked on pass button');
      if (store.passcounter == 3) {
        this.endGame();
      }
      else {
        store.passcounter++;
      }
      console.log('this board in pass', this.tiles[0]);

      $('.playertiles').each((i, el) => {
        let $tile = $(el);
        let p = $tile.data().prelBoardPos;
        console.log('p from .pass button is', p)
        console.log('the tile from board', $tile);
        if (p) {
          console.log('There is tiles when I clicked the pass button');
          p = '';
          // The tile renders back to its player tiles if not played and is on board
          $tile.css({ top: '', left: '' });
        }
      });

      store.currentPlayer++;
      console.log('Changing player index', store.currentPlayer);

      // this.board = store.board;
      // this.tilesFromBag = store.tilesFromFile;

      this.playerTurn();
      this.render();
      // this.changeTiles();
    });

    // When click on 'Lägg brickor'-button, there will be a new player and the board will render
    // Shoul also count score on word
    $('.play-tiles').on('click', async () => {
      console.log('im pushing play-tiles');

      // only a valid move if not first move or center is taken
      // this.besideAnotherTile();
      if (!this.notFirstMoveOrCenterIsTaken()) {
        await Modal.alert('Du måste lägga första ordet så att det korsar mittenrutan!');
        this.render();
        return;
      }

      if (!this.besideAnotherTile()) {
        await Modal.alert('Du måste lägga dina ord brevid redan befintliga ord på brädet!');
        this.render();
        return;
      }

      this.placePrelTilesOnBoard();
      this.checkNewWordsInSAOL();
      store.passcounter = 0;
    });

    // To change tiles, locate what tile wants to be changed and change them to new tiles from bag. 
    // Put back the tiles that wants to be changed and scramble the bag

    $('.change-tiles').on('click', async () => {
      console.log('im pushing change-tiles');
      if (this.tilesFromBag.length < 7) {
        console.log('there are 7 or less tiles in bag');
        await Modal.alert('Du kan inte byta brickor när det är mindre än 7 brickor kvar.');
        // Put a div and message here instead
      }
      // How many tiles the player wants to remove
      let numberOfTiles = 0;
      let that = this;
      // Loop through the current players player tiles div
      // $(`#box${players.indexOf(players[this.playerIndex - 1])} > div`).each(function () {
      $(`#box0 > div > div`).each(function () {
        // If the current div have the class 'change'
        if ($(this).hasClass('change')) {
          console.log($(this).hasClass('change'));
          // What index does the div with the 'change' class have

          let indexOfTile = $('.change').index();
          console.log('this index has the change class', indexOfTile);
          // What text value does the current div have (we need to know the letter)
          let letterWithPoint = $(this).text();
          // Remove the point that follows when asking for text()
          let letterWithoutPoint = letterWithPoint[0];
          // Increase numberOfTiles so we now how many new tiles we need at the end
          numberOfTiles++;

          // Loop through the players tiles
          for (let i = 0; i < that.tiles[0].length; i++) {
            if (that.tiles[0][i].char === letterWithoutPoint) {
              // Remove that tile using the indexOfTile
              that.tiles[0].splice(indexOfTile, 1);
              // Push the players removed(changed) tiles back to tilesFromBag
              that.tilesFromBag.push(that.tiles[0][i]);
              return;
            }
          }
        }
      });
      // This is the same as for player when they need new tiles
      // Remove the number of tiles from tilesFromBag 
      let newTiles = [...this.tilesFromBag.splice(0, numberOfTiles)];
      // push the new tiles to the players current tiles
      for (let i = 0; i < numberOfTiles; i++) {
        this.tiles[0].push(newTiles[i]);
      }

      // 'Shake the bag'
      this.tilesFromBag.sort(() => Math.random() - 0.5);
      // Change player (since changing tiles is a move) and re-render
      store.tilesFromFile = this.tilesFromBag;

      store.currentPlayer++;
      console.log('Changing player index', store.currentPlayer);

      this.playerTurn();
      this.render();
      // this.changeTiles();
    });

  }

  async nextPlayer() {
    // if all words are ok in scrabble:
    console.log('5. --- nextPLayer() ---')
    //this.commitPlayedWords();
    // show words played in list

    store.currentPlayer++;
    this.playerTurn();
    this.render();

    //apend after render so it will appear in .saol element
    let boxForWord = '';
    for (let obj of this.storeCurrentWords) {
      console.log("appending " + obj.word + "to SAOL window")
      boxForWord = '<div class="boxForWord"><span class="word validWord">' + obj.word + '</span>'
      $('.saol').append(boxForWord)
    }
  }

  // --- johanna (gamla checkNewWordsOnBoard funktionen)
  checkNewWordsOnBoard() {

    console.log('2. --- checkNewWordsOnBoard ---')
    console.log('this.storeOldWords in the ', this.storeOldWords);

    let wordH = [];  //to save  all the infromation on the horisontal 
    let wordV = [];  //to save all the infromation on the vertical 
    let wordArray = [];  //to save the final word array(word,points,extra points word times) 
    let c = ''; //temp variable to save this.board[i][j].tile[0].char
    let p = 0;  //temp variable to save this.board[i][j].tile[0].points;
    let s = ''; //temp variableto save this.board[i][j].special

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
            ////// NEW ///////
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordV.push({ x: i, y: j, char: c, points: p, special: s });
            wordH.push({ x: i, y: j, char: c, points: p, special: s });
          }
        }
      }
    }
    wordV.sort((a, b) => a.y > b.y ? -1 : 1);//sort by value of y from small to big
    wordH.sort((a, b) => a.x > b.x ? -1 : 1);//sort by value of x from small to big
    // console.log('vertical wordV: ', wordV);
    // console.log('horisontal wordH: ', wordH);

    //Collect all the letters from same column and made it up to en word. 
    //Calulate the points of word even if it has extra points(2x letters,3x letters). 
    //save the words multiple times  if it has extra points(2x word,3x word). 
    if (wordV.length > 1) {
      let word = '';
      let points = 0;
      let multiple = 1;
      let position = [];
      //  let currentPositon = [];
      for (let i = 0; i < wordV.length; i++) {
        if (((i < wordV.length - 1) && (wordV[i].y === wordV[i + 1].y)) || ((i > 0) && (wordV[i].y === wordV[i - 1].y))) {
          word += wordV[i].char;
          position.push({ x: wordV[i].x, y: wordV[i].y });
          if (wordV[i].special && !this.usedSpecialTiles.find(tile => (tile.x === wordV[i].x && tile.y === wordV[i].y))) {
            if ((wordV[i].special) === '2xLS') { points += 2 * wordV[i].points }
            else if ((wordV[i].special) === '3xLS') { points += 3 * wordV[i].points }
            else if ((wordV[i].special) === '2xLW') { multiple *= 2; points += wordV[i].points; }
            else if ((wordV[i].special) === '3xLW') { multiple *= 3; points += wordV[i].points; }
            else if ((wordV[i].special) === 'middle-star') { multiple *= 2; points += wordV[i].points; }
            else points += wordV[i].points;

            // save the word that have used special box
            this.usedSpecialTiles.push({ x: wordV[i].x, y: wordV[i].y });

          }
          else {
            points += wordV[i].points;
          }
        }
        //if it is another column then save the word to wordArray. Initialize variables in order to save the new words.
        if ((i === wordV.length - 1) || (wordV[i].y !== wordV[i + 1].y)) {
          wordArray.push({ word: word, points: points, multiple: multiple, position: position })
          word = '';
          points = 0;
          multiple = 1;
          position = [];
        }

      }
    }
    //Collect all the letters from same row and made it up to en word. 
    //Calulate the points of word even if it has extra points(2x letters,3x letters). 
    //save the words multiple times  if it has extra points(2x word,3x word). 
    if (wordH.length > 1) {
      let word = '';
      let points = 0;
      let multiple = 1;
      let position = [];
      // let currentPositon = [];
      for (let i = 0; i < wordH.length; i++) {
        if (((i < wordH.length - 1) && (wordH[i].x === wordH[i + 1].x)) || ((i > 0) && (wordH[i].x === wordH[i - 1].x))) {
          word += wordH[i].char;
          position.push({ x: wordH[i].x, y: wordH[i].y });
          if (wordH[i].special && !this.usedSpecialTiles.find(tile => (tile.x === wordH[i].x && tile.y === wordH[i].y))) {
            if ((wordH[i].special) === '2xLS') { points += 2 * wordH[i].points; }
            else if ((wordH[i].special) === '3xLS') { points += 3 * wordH[i].points }
            else if ((wordH[i].special) === '2xLW') { multiple *= 2; points += wordH[i].points; }
            else if ((wordH[i].special) === '3xLW') { multiple *= 3; points += wordH[i].points; }
            else if ((wordH[i].special) === 'middle-star') { multiple *= 2; points += wordH[i].points; }
            else points += wordH[i].points;
            // save the word that have used special box
            this.usedSpecialTiles.push({ x: wordH[i].x, y: wordH[i].y });
          }
          else {
            points += wordH[i].points;
          }
        }
        //if it is another row then save the word to wordArray. Initialize variables in order to save the new words.
        if ((i === wordH.length - 1) || (wordH[i].x !== wordH[i + 1].x)) {
          wordArray.push({ word: word, points: points, multiple: multiple, position: position })
          word = '';
          points = 0;
          multiple = 1;
          position = [];
        }
      }
    }
    //------------------------------
    this.newestWords = []
    if (this.storeCurrentWords.length > 0) {
      // Check if a old words exists in the wordsarray
      for (let i = 0; i < wordArray.length; i++) {
        if (this.storeOldWords.indexOf(wordArray[i].word) !== -1) {
          console.log("old word! ", wordArray[i].word)
        } else {
          console.log("new word! ", wordArray[i].word)
          this.newestWords.push(wordArray[i])
        }
      }
      this.storeCurrentWords = this.newestWords;
    } else {
      this.storeCurrentWords = wordArray;
      // this.storeCurrentWords = wordArray.map(x => x);
    }

    // this.storeOldWords = [];
    console.log("wordArray before pushing to storeOldWords: ", this.storeOldWords)
    // store all words played in this.storeOldWords string value
    for (let i = 0; i < wordArray.length; i++) {
      this.storeOldWords.push(wordArray[i].word)
    }
    store.storeOldWords = this.storeOldWords;
    console.log("storeOldWords: ", this.storeOldWords)
    console.log("store.storeOldWords: ", store.storeOldWords)
    console.log("Checking word array: ", wordArray);
    console.log("this.storeCurrentWords: ", this.storeCurrentWords);
    //------------------------------
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

    return this.board;
  }

  showPlayers() {

    this.players.forEach(player => {
      let index = 0;
      $('.playing-window-left').append(`
      <div class="playerWrapper">
      <div class="playersName">${player.name}</div>
      <div class="score">Poäng: ${player.score}</div></div>
      </div>
      <div class="tiles-box-parent-div"><div id="box${this.players.indexOf(player)}"></div></div>
      `);
      while (index < player.tiles[0].length) {
        $(`#box0`).append(`
        <div class="tiles-box" data-box="${index}"><div data-index="${index}" class="playertiles ${player.tiles[0][index].char === ' ' ? 'blankTile' : ''}">${player.tiles[0][index].char}<div class="points">${player.tiles[0][index].points || ''}</div></div>
      `);
        index++;
      }
      $(`#box0`).append(`
        <div class="tiles-box empty" data-box="${index}"></div>
      `);

      $('.blankTile').on('staticClick', async e => {
        let me = $(e.currentTarget);
        let index = +me.attr('data-index');
        let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖabcdefghijklmnopqrstuvwxyzåäö';
        let pass = false;
        let char = '';
        do {
          char = await Modal.prompt('Skriv in en bokstav eller tryck avbryt för att markera brickan');
          if (char === null) {
            me.dblclick();
            return;
          }

          for (let i = 0; i < alphabet.length; i++) {
            console.log(char)
            console.log(alphabet.charAt(i))
            if (alphabet.charAt(i) == char) {
              console.log(alphabet.charAt(i) + ' is equals to' + char)
              player.tiles[0][index].char = char;
              pass = true;
            }
          }
        }
        while (!pass);
        console.log(player.tiles)
        me.html(char)
      })

      let boxIndex = 0;
      $('.playertiles').each((i, el) => {
        let $tile = $(el);
        let so = $(`.tiles-box[data-box="${boxIndex}"]`).offset(), to = $tile.offset();
        let swh = { w: $(`.tiles-box[data-box="${boxIndex}"]`).width(), h: $(`.tiles-box[data-box="${boxIndex}"]`).height() };
        let twh = { w: $tile.width(), h: $tile.height() };
        let pos = {
          left: so.left - to.left + (swh.w - twh.w) / 2.8,
          top: so.top - to.top + (swh.h - twh.h) / 2.8
        };
        $tile.css(pos);
        boxIndex++;
      });

    });

    // $('.playertiles').each((i, el) => {
    //   $(el).css({ top: 0, left: 0 });
    // });


  }


  showPlayerButtons() {
    console.log('Im in showPlayerButtons');
    $('.tiles-from-bag').remove();
    $('.play-tiles').remove();
    $('.pass').remove();
    $('.change-tiles').remove();

    console.log('The length of the tile bag array from show player buttons', store.tilesFromFile.length);
    $('.board').append(
      `
      <p class= "tiles-from-bag">🎁 ${this.tilesFromBag.length}</p>
      <button class="play-tiles">Lägg brickor</button>
      <button class="pass">Stå över</button>
      <button class="change-tiles">Byt brickor</button>
    `);
  }

  // --- johanna

  // async countPlayerScore(playerIndex, wordArray) {
  //   let currentWordPoints = 0;
  //   console.log('I am in countPlayerScore, wordArray: ', wordArray);
  //   console.log('I am in countPlayerScore, player: ', playerIndex);
  //   for (let i = 0; i < wordArray.length; i++) {
  //     console.log('I am in countPlayerScore, wordArray[i].word: ', wordArray[i].word);
  //     if (await SAOLchecker.scrabbleOk(wordArray[i].word)) {
  //       // currentWordPoints = wordArray[i].points * wordArray[i].multiple;
  //       currentWordPoints = wordArray[i].totalPoints;
  //       wordArray[i].scrabbleOk = true;
  //     }
  //     else {
  //       currentWordPoints = 0;
  //       wordArray[i].scrabbleOk = false;
  //     }
  //     console.log('currentWordPoints', currentWordPoints);
  //     // players[playerIndex - 1].score += currentWordPoints;
  //     this.players[0].score += currentWordPoints;
  //     console.log('play.score: ', this.players[playerIndex].score);
  //   }

  //   this.render();
  //   //console.log('play.score', player.score);
  //   // this.wordArrayCommitted = wordArray.filter(x => x.scrabbleOk === true);
  //   // console.log('I am in countPlayerScore wordArray committed', this.wordArrayCommitted);
  // }
  async countPlayerScore() {

    console.log('4. --- countPLayerScore() ---')
    console.log('player index: ' + store.currentPlayer)

    let currentWordPoints = 0;
    console.log('I am in countPlayerScore, wordArray: ', this.storeCurrentWords);
    for (let i = 0; i < this.storeCurrentWords.length; i++) {
      currentWordPoints = this.storeCurrentWords[i].points * this.storeCurrentWords[i].multiple;
      console.log("get point for: " + this.storeCurrentWords[i].word)
      this.players[0].score += currentWordPoints;
    }
    console.log('currentWordPoints', currentWordPoints);
    // this.render();

    ////// NEW ADDED this. ///////
    // players[store.currentPlayer].score += currentWordPoints;
    //this.players[0].score += currentWordPoints;
    ////// END //////
  }
  // --- johanna



  // async showWordWithList(wordsInArray) {
  //   console.log('------I am in showWordWithList()-----');
  //   $('.playing-window').append(`< section class= "wordList" > <h3>Ord Listor</h3>
  //    <table><tr><th>Ord</th><th>ok in Scrabble</th><th>poäng</th></tr>
  //    `)
  //   for (let item of wordsInArray) {
  //     if (await SAOLchecker.scrabbleOk(item.word)) {
  //       item.scrabbleOk = true;
  //     }
  //     else {
  //       item.scrabbleOk = false;
  //       item.totalPoints = 0;
  //     }
  //     $(`.wordList`).append(`<span class="word">
  //     <tr><td>${item.word}</td></tr><tr><td>${item.scrabbleOk}</td></tr><tr><td>${item.totalPoints}</td></tr>
  //     `)
  //   }


  // }
}