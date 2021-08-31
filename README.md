# Brute Forced War Card Game
Software that can crowdsource the computer power to bruteforce all possible games of the card game War assuming that cards are not shuffled after being picked up.

The server is written in NodeJS, and clients are written in Java. The clients query the server to get a hand to process, and when the client is done, the client will send an HTTP post request to the server with the outcome. Only the outcome of the game is stored since computing one desired game of War is not compute intensive.
