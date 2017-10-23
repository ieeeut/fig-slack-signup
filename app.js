const express = require('express');
const exphbs  = require('express-handlebars');
const request = require('request');
const bodyParser = require('body-parser');

const figNames = [
    'bits-and-bytes',
    'the-comm-nets',
    'digital-impact',
    'electromagnets',
    'circuit-breakers',
    'resistance',
    'transformers',
    'power-up',
    'integrated-circuits',
    'designers',
    'short-circuits',
    'achievers',
    'uab'
];

const slacktoken = 'secret';

const app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 

// routes for twilio
app.post('/adduser', function(req, res, next) {
    console.log(req.body.email);
    if (req.body.fig) {
        console.log('fig name: ' + req.body.fig);
        console.log('channelId: ' + req.body.chan);

        let inviteUrl = 'https://slack.com/api/users.admin.invite?token=' + slacktoken + '&email=' + req.body.email + '&channels=' + req.body.chan;

        request(inviteUrl, function(err, res, body) {
            console.log(body);
        });
    } else {
        console.log('User joined from main page');

        let inviteUrl = 'https://slack.com/api/users.admin.invite?token=' + slacktoken + '&email=' + req.body.email;
        
        request(inviteUrl, function(err, res, body) {
            console.log(body);
        });
    }
    //get all info on the new user and add them to the channel
    res.redirect('/submitted');
});

app.get('/', function(req, res) {
    res.render('index', {}, function(err, html) {

        res.send(html);
    });
});

app.get('/submitted', function(req, res) {
    res.render('submitted', {}, function(err, html) {
        if (err) {
            console.log(err);
        }

        res.send(html);
    });
});

app.get('/notfound', function(req, res) {
    res.render('notfound', {}, function(err, html) {
        if (err) {
            console.log(err);
        }

        res.send(html);
    });
});

app.get('/favicon.ico', function(req, res) {
    res.status(404).send({
        msg: 'Not Found'
    });
});

app.get('/:figname', function(req, exRes) {
    let figName = req.params.figname;

    if (figNames.indexOf(figName) > -1) {
        console.log('found fig');

        console.log('creating ' + figName);
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
                        let channelId = 'test';
                        console.log(bodyChanCreated);
                        console.log(bodyChanJson.channel.id);
                        channelId = bodyChanJson.channel.id;
    
                        console.log('channel created, rendering');
                        exRes.render('figsignup', {figname: figName, chan: channelId}, function(err, html) {
                            if (err) {
                                console.log(err);
                            }
                    
                            exRes.send(html);
                        });
                    });
                } else {
                    console.log('channel exists, rendering page');

                    exRes.render('figsignup', {figname: figName, chan: channelId}, function(err, html) {
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

    } else {
        console.log('fig not found');
        exRes.redirect('/notfound');
    }

    
});

app.listen(3172, function() {
    console.log('Starting express server');
});
