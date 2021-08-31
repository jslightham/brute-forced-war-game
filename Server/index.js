require('log-timestamp');
const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
const mongoose = require('mongoose');
const postRoutes = require('./post.route');
const mongoSanitize = require('express-mongo-sanitize');
const CronJob = require('cron').CronJob;
let PendingGame = require('./pendingGame.model');

// Handle MongoDB connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/war', { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => {
        console.log('Connected to dabase');
    },
    err => {
        console.error('Could not connect to database: ');
        console.error(err);
    }
);

// Express server
app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// Sanitize data to prevent NoSQL injections
app.use(mongoSanitize());

// Express routes
app.use('/post', postRoutes);

app.listen(8080, () => {
    console.log('Express server running on port:', PORT);
});

// Cron jobs
var purge = new CronJob('*/5 * * * *', () => {
    console.log('Purging data');
    // Remove all pending games older than 1 day
    PendingGame.find({}, (err, arr) => {
        for (let i = 0; i < arr.length; i++) {
            let timeDifference = new Date().getTime() - arr[i].date;
            let dayDifference = timeDifference / (1000 * 3600 * 24);
            if (dayDifference > 1) {
                arr[i].delete().catch(e => {
                    console.log(e);
                });
            }
        }
    });
});
purge.start();