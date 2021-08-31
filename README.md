# Brute Forced War Card Game
Software that can crowdsource the computer power to brute force all possible games of the card game War assuming that cards are not shuffled after being picked up.

The server is written in NodeJS, and clients are written in Java. The clients query the server to get a hand to process, and when the client is done, the client will send an HTTP post request to the server with the outcome. Only the outcome of the game is stored since computing one desired game of War is not compute intensive.

Data for ~130, 000 games can be found in data.txt. The format for the data is [Deck] | Winner

##Data
###Deck
All cards are stored in the deck. The first half of the deck is player one's starting hand, and the second half of the deck is player two's starting hand. 

###Card
In this implementation aces are assumed to be low. 
A card consists of a suit and a color. The suit is meaningless in the game of war. The suit is the first letter of the card, and can be either D, H, C, S. The number following the suit is the number value of the card. 1 for ace, 2 for 2, ..., 11 for jack, 12 for queen, 13 for king. 

###Winner
-1: Game is impossible to be completed
0: Game is a draw (both players given the same sequence of cards)
1: Player one wins
2: Player two wins

