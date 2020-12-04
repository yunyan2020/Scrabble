// This is our main-file called game
import Game from './js/game.js';
import Board from './js/board.js';
import Network from './js/network.js';

//
//!!!! Kalla new Board().start(); där ni vill ha brädet! 
//
import Player from "./js/player.js";
import Bag from './js/bag.js';

// export const players = [];

// let that;


export default class Start {

  // Start button
  constructor() {
    $('.start-screen').fadeOut(1700);
    $('.game-screen').fadeIn(1350);
    // let player = new Player();
    // player.choosePlayers();
    this.clickFunction();
  }

  async clickFunction() {



    // let bag = new Bag();
    // create all tiles in bag.js and returns and stores them in this.tiles,
    // and therefore stored in global variable "that".
    // this.tiles = await bag.tilesFromFile();

    let network = new Network();

    // let game = new Game(this.tiles);

    // let that = this;

    $('.game-menu').append(
      `<input type="text" id="playerName" class="newPlayerInput" placeholder="Namn" />`
    );

    $('.get-key').on('click', async function () {
      // If there isn't a name, ask the player to first type in a name
      let name = $('.newPlayerInput').val();
      if (!name) {
        // Should be a warning label from div instead
        alert('Type in a name first');
        return;
      }
      // Fade out the 'start-side' and replace it with waiting for other players
      $('.game-menu').fadeOut(1700);

      let networkKey = await network.getLocalKey();
      console.log('network key is ' + networkKey);
      $('.playersName').append(`<div class="waiting-for-players"><div class="waiting-box">Väntar på spelare...</div>
      <button class="start-new-game">Starta</button>
      <div type="key-input" class="key-input"><span class="key">${networkKey}</span></div>
      </div>`);

      // that is all the tiles from the bag. Which has been created in clickFunctions
      // let tilesFromBag = that.tiles.splice(0, 7);
      // console.log(name);
      // console.log(tilesFromBag);
      // console.log(game);
      // newPlayer.setPlayerNames(name, tilesFromBag, game);
      // players.push(new Player(name, tilesFromBag));
      // console.log(players);
      // console.log(that);
      network.connectToStore(networkKey, name);

    });


    $('.set-key').on('click', function () {
      // If there isn't a name, ask the player to first type in a name
      let name = $('.newPlayerInput').val();
      console.log('my name is' + name);
      if (!name) {
        // Should be a warning label from div instead
        alert('Type in a name first');
        return;
      }

      // Fade out the 'start-side' and replace it with waiting for other players
      $('.game-menu').fadeOut(1700);

      // let networkKey = await network.getLocalKey();
      $('.playersName').append(`<div>
      <button class="join">Gå med</button>
      <input type="key-input" class="key-input"><span class="key" placeholder="Skriv nyckel här"></span></input>
      </div>`);

      $('.join').on('click', function () {
        console.log('im clicking the join button');
        //that is all the tiles from the bag. Which has been created in clickFunctions
        // let tilesFromBag = that.tiles.splice(0, 7);
        // console.log(name);
        // console.log(tilesFromBag);
        // newPlayer.setPlayerNames(name, tilesFromBag, game);
        let insertedNetworkKey = $('.key-input').val();
        if (!insertedNetworkKey) {
          alert('type in a insert key');
        } else {
          console.log(insertedNetworkKey);
          // players.push(new Player(name, tilesFromBag));
          // console.log(players);
          network.connectToStore(insertedNetworkKey, name);
        }
        $('.playersName').fadeOut(200);
        $('.game-screen').fadeOut(200);
        $('.game-menu').fadeOut(200);
        $('.scrabble').fadeOut(200);
      });
    });
  }
}


$('.game-screen').fadeOut(1700);
$('.game-menu').fadeOut(1700);
$('.scrabble').fadeOut(1700);
$('#candy').hide();

setTimeout(() => {
  new Board().start(that.tiles);
}, 1700);

$('.scrabble').fadeOut(2000);
  // $('.scrabble').animate({ top: '12px' }, 'slow');
  //$('.scrabble').animate({ fontSize: '40px' }, 'slow');
  // console.log("new Game().playerTurn - called")
  //new Game(that.tiles);
  // new Game().countScore();
  // new Game().playerTurn();
});


// rules open-close 

$(document).ready(function () {

  // Play animations in that order: 

  // 1 - Candy: -> play it first
  // Then show:
  // 2 - game-menu and players 

  $('.game-menu').hide(0).delay(6000).show(0);
  $('.newPlayerInput').hide(0).delay(6000).show(0);
  //$('#candy-loader').hide();



  $('.rules').click(function () {
    $('.game-menu').hide();
    $('.game-screen').hide();
    $('.add-rules').animate({
      height: 'toggle'
    });
  });
  $('.close').click(function () {
    $('.add-rules').hide();
    $('.game-menu').fadeIn(850);
    $('.game-screen').fadeIn(850);
  });

});









