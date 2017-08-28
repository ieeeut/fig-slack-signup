const express = require('express');
const exphbs  = require('express-handlebars');
const request = require('request');

const slacktoken = 'secret';

const app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

// routes for twilio
app.post('/adduser', function(req, res, next) {
    let body = req.body.body;
    //get all info on the new user and add them to the channel
});

app.get('/', function(req, res) {
    res.render('index', {}, function(err, html) {
        if (err) {
            console.log(err);
        }

        res.send(html);
    });
});

app.get('/:figname', function(req, exRes) {
    let figName = req.params.figname;
    let channelListUrl = 'https://slack.com/api/channels.list?token=' + slacktoken; 
    request(channelListUrl, function(err, res, body) {
        let bodyJson = JSON.parse(body);
        let channelCreated = false;
        let channelId = null;

        if (bodyJson.ok) {
            bodyJson.channels.forEach(function(elem) {
                if (elem.name == figName) {
                    channelCreated = true;
                    channelId = elem.id;
                    console.log('channel already exists');
                }
            }, this);

            if (!channelCreated) {
                let channelCreationUrl = 'https://slack.com/api/channels.join?token=' + slacktoken + '&name=' + figName;
                request(channelCreationUrl, function(err, res, bodyChanCreated) {
                    let bodyChanJson = JSON.parse(bodyChanCreated);
                    console.log(bodyChanCreated);
                    //console.log(bodyChanJson.channel.id);
                    //channelId = bodyChanJson.channel.id;

                    console.log('channel created, rendering');
                    exRes.render('figsignup', {figname: figName}, function(err, html) {
                        if (err) {
                            console.log(err);
                        }
                
                        exRes.send(html);
                    });
                });
            } else {
                console.log('channel exists, rendering page');
                exRes.render('figsignup', {figname: figName}, function(err, html) {
                    if (err) {
                        console.log(err);
                    }
            
                    exRes.send(html);
                });
            }

        } else {
            console.log(err);
            exRes.send('There was a problem');
        }
    });

    
});

app.listen(3172, function() {
    console.log('Starting express server');
});
