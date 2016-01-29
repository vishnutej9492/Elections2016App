/*
 * GET home page.
 */
var pollData = {
    participation: {
            yes: 0,
            no: 0
        },
        candidates: [
            {
                party: 'Democrats',
                name: 'Bernie Sanders',
                votes: 0
            },
            {
                party: 'Democrats',
                name: 'Hillary Clinton',
                votes: 0
            },
            {
                party: 'Republicans',
                name: 'Donald Trump',
                votes: 0
            },
            {
                party: 'Republicans',
                name: 'Ben Carson',
                votes: 0
            }
        ]
};

var nationalPoll = {
    'Democrats': 0,
    'Republicans': 0
};


exports.index = function (req, res) {
    res.render('index', {
        title: 'Elections Poll'
    });
};

exports.vote = function (req, res) {
    var voting = req.body.voting;

    var candidates = pollData['candidates'];

    console.log('User is voting? ' + voting);

    pollData['participation'][voting] += 1;
    console.log(JSON.stringify(pollData));

    // fork - are they voting or not?
    // YES -> poll form
    // NO -> results page
    if (voting === 'yes') {

        // setup candidates array for voting form

        console.log(candidates.length + ' candidates');

        res.render('poll', {
            title: 'Elections Poll',
            candidates: candidates
        });

    } else {
        res.render('results', {
            title: 'Election Poll Results',
            candidates: candidates,
            nationalPoll: nationalPoll,
            nationalChartData: processNationalData(nationalPoll)
        });
    }
};

exports.results = function (req, res) {
    var vote = req.body.vote;

    console.log('User is voting for ' + vote + '.');

    // tally vote in data store
    var candidates = pollData['candidates'];

    for (var i = 0; i < candidates.length; i += 1) {
        if (candidates[i].name === vote) {
            var party = candidates[i].party;

            pollData['candidates'][i].votes += 1;
            nationalPoll[party] += 1;
            break;
        }
    }

    console.log(JSON.stringify(pollData));
    console.log(JSON.stringify(nationalPoll));

    res.render('results', {
        title: 'Election Poll Results',
        candidates: candidates,
        nationalPoll: nationalPoll,
        nationalChartData: processNationalData(nationalPoll)
    });
};

// exports.chat = function(req, res){
//     io.on('connection', function(socket){
//         socket.on('chat message', function(msg){
//             io.emit('chat message', msg);
//         });
//     });
// };

var partyColours = {
    Democrats: "#ff4444",
    Republicans: "#ffbb33",
};


var processNationalData = function (nationalPollData) {
    console.log("processNationalData: " + JSON.stringify(nationalPollData));

    var chartData = [];
    for (key in nationalPollData) {
        var temp = {};
        if (nationalPollData[key] !== 0) {
            temp.value = nationalPollData[key];
            temp.color = partyColours[key];
            chartData.push(temp);
        }
    }

    console.log(JSON.stringify(chartData));

    return chartData;
};

