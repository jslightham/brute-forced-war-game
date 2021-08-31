const express = require('express');
const postRoutes = express.Router();
const fs = require('fs');

let Game = require('./game.model');
let PendingGame = require('./pendingGame.model');
let Contributor = require('./contributors.model');
let Stat = require('./stats.model');


postRoutes.route('/get-deck').get((req, res) => {
    if (!req.body) {
        res.status(401).send("Missing body");
        return;
    }

    console.log("Assigning New Deck");
    
    let deck = shuffle(arr);
    let p = new PendingGame();
    p.deck = deck;
    p.time = Date.now();
    p.save();
    res.status(200).send(deck);
});

postRoutes.route('/submit-game').post((req, res) => {
    if (!req.body) {
        res.status(401).send("Missing body");
        return;
    }

    console.log("Saving Processed Deck");

    let game = new Game();
    let d = [];
    let s = req.body.deck.substring(1, req.body.deck.length - 1);
    s.split(',').forEach(function(item) {
        d.push(item.substring(1, item.length - 1));
    });

    game.deck = d;
    game.winner = req.body.winner;
    game.save();

    PendingGame.deleteOne({deck: d}, (err) => {
      if (err) {
        console.log(err);
      }
    });

    Contributor.findOne({ip: req.connection.remoteAddress}, (err, contributor) => {
        if (err) {
            console.log(err);
        }
        if (contributor) {
            contributor.count++;
            contributor.save();
        } else {
            let c = new Contributor();
            c.ip = req.connection.remoteAddress;
            c.count = 1;
            c.save();
        }
    });

    Stat.findOne({}, (err, stat) => {
        if (err) {
            console.log(err);
        }
        if (stat) {
            stat.count++;
            if (req.body.winner == -1) {
                stat.noEndCount++;
            } else if (req.body.winner == 0) {
                stat.drawCount++;
            } else if (req.body.winner == 1) {
                stat.player1Count++;
            } else if (req.body.winner == 2) {
                stat.player2Count++;
            }
            stat.save();
        } else {
            let s = new Stat();
            s.count = 1;
            if (req.body.winner == -1) {
              s.noEndCount = 1;
              s.drawCount = 0;
              s.player1Count = 0;
              s.player2Count = 0;
          } else if (req.body.winner == 0) {
              s.drawCount = 1;
              s.noEndCount = 0;
              s.player1Count = 0;
              s.player2Count = 0;
          } else if (req.body.winner == 1) {
              s.player1Count = 1;
              s.noEndCount = 0;
              s.drawCount = 0;
              s.player2Count = 0;
          } else if (req.body.winner == 2) {
              s.player2Count = 1;
              s.noEndCount = 0;
              s.drawCount = 0;
              s.player1Count = 0;
          }
            s.save();
        }
    });


    res.status(200).send("Game saved");
});

postRoutes.route('/get-stats').get((req, res) => {
    if (!req.body) {
        res.status(401).send("Missing body");
        return;
    }

    Stat.findOne({}, (err, stat) => {
        if (err) {
            console.log(err);
        }

        let tableString = "<table><tr><th>IP</th><th>Count</th></tr>"

        if (stat) {
          Contributor.find({}, (err, contributor) => {

              contributor.forEach(function(item) {
                  tableString += "<tr><td>" + item.ip + "</td><td>" + item.count + "</td></tr>";
              });

              tableString += "</table>";

              res.send("<body><center><h1>War Game Stats</h1> <h2>Server Time: " + Date() + "</h2> <br> <h3>" + stat.count + " Total Games</h3> <h3>" + stat.noEndCount + " Impossible Games</h3> <h3>" + stat.drawCount + " Draws</h3> <h3>" + stat.player1Count + " P1 Win Games</h3> <h3>" + stat.player2Count + " P2 Win Games</h3> <br> " + tableString +"  </center> </body>");
            });
              

          
        } else {
          res.send("<body><center><h1>War Game Stats</h1> <h2>Server Time: " + Date() + "</h2> <br> <h3>" + 0 + " Total Games</h3> <h3>" + 0 + " Impossible Games</h3> <h3>" + 0 + " Draws</h3> <h3>" + 0 + " P1 Win Games</h3> <h3>" + 0 + " P2 Win Games</h3>  </center></body>");
        }
    });
    console.log(" ");
  });

  postRoutes.route('/export-data').get((req, res) => {
    var stream = fs.createWriteStream("data.txt", {flags:'a'});
    console.log(new Date().toISOString());
      Game.find({}, (err, games) => {
          if (err) {
              console.log(err);
          }
          games.forEach(function(item) {
              stream.write(item.deck + " | "  + item.winner + "\n");
              console.log(item.deck + "," + item.winner);
          });
          console.log(new Date().toISOString());
          stream.end();
      });
     
  });


module.exports = postRoutes;

function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    while (currentIndex != 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    Game.find({deck: array}, (err, games) => {
      if (games.length > 0) {
        PendingGame.find({deck: array}, (err, games) => {
          if (games.length > 0) {
            return shuffle(array);
          }
        });
      }
    });
    
    return array;
  }
  
  // Array of an unshuffled deck
  var arr = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "H1", "h3", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11", "H12", "H13", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13"];