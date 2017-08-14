const express = require('express');
const app = express();

// routes for twilio
app.post('/api/twilmsg', function(req, res, next) {
    var body = req.body.body;
    //parse the group the texter is joining
})

app.get('/', function(req, res) {
    res.send('Test test 123');
});
