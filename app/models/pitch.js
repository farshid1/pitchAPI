var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase( 'http://pitchDB:c02R29XV94ZZb2VqaEWx@pitchdb.sb02.stations.graphenedb.com:24789');
var User = require('./user.js');

// private constructor:

var Pitch = module.exports = function Pitch(_node) {
    console.log("here we are in constructor");
    this._node = _node;
}

// public instance properties:

Object.defineProperty(Pitch.prototype, 'id', {
    get: function () { return this._node.id; }
});

Object.defineProperty(Pitch.prototype, 'title', {
    get: function () {
        return this._node.data['title'];
    },
    set: function (title) {
        this._node.data['title'] = title;
    }
});

// public instance methods:

Pitch.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

Pitch.prototype.del = function (callback) {

    var query = [
        'MATCH (p:Pitch)',
        'WHERE ID(p) = {pitchId}',
        'OPTIONAL MATCH (p)-[r]-()',
        'DELETE p,r',
    ].join('\n');

    var params = {
        pitchId: this.id
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

Pitch.prototype.getComments = function (callback) {


    var query = [
        'MATCH (u:User)-[c:COMMENTS]->(p:Pitch)',
        'WHERE ID(p) = {pitchId}',
        'RETURN u.username, c.time, c.commentTime, c.commentText',
        'ORDER BY c.time',
    ].join('\n');

    var params = {
        pitchId: this.id
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var comments = [];
        if (results.length > 0) {
            //console.log(results[0]['user']);
            
            for (var i = 0; i < results.length; i++) {
                var comment = {
                    user: results[i]['u.username'],
                    comment: results[i]['c.commentText'],
                    time: results[i]['c.commentTime']
                };
                comments.push(comment);
            }
            return callback(null, comments);
        }
        return callback("No comment");

    });
};    

// Pitch.prototype.unfollow = function (other, callback) {
//     var query = [
//         'MATCH (Pitch:Pitch) -[rel:follows]-> (other:Pitch)',
//         'WHERE ID(Pitch) = {PitchId} AND ID(other) = {otherId}',
//         'DELETE rel',
//     ].join('\n')

//     var params = {
//         PitchId: this.id,
//         otherId: other.id,
//     };

//     db.query(query, params, function (err) {
//         callback(err);
//     });
// };

// // calls callback w/ (err, following, others) where following is an array of
// // Pitchs this Pitch follows, and others is all other Pitchs minus him/herself.
// Pitch.prototype.getFollowingAndOthers = function (callback) {
//     // query all Pitchs and whether we follow each one or not:
//     var query = [
//         'MATCH (Pitch:Pitch), (other:Pitch)',
//         'OPTIONAL MATCH (Pitch) -[rel:follows]-> (other)',
//         'WHERE ID(Pitch) = {PitchId}',
//         'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
//     ].join('\n')

//     var params = {
//         PitchId: this.id,
//     };

//     var Pitch = this;
//     db.query(query, params, function (err, results) {
//         if (err) return callback(err);

//         var following = [];
//         var others = [];

//         for (var i = 0; i < results.length; i++) {
//             var other = new Pitch(results[i]['other']);
//             var follows = results[i]['COUNT(rel)'];

//             if (Pitch.id === other.id) {
//                 continue;
//             } else if (follows) {
//                 following.push(other);
//             } else {
//                 others.push(other);
//             }
//         }

//         callback(null, following, others);
//     });
// };

// static methods:

Pitch.get = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new Pitch(node));
    });
};

Pitch.getAll = function (callback) {
    var query = [
        'MATCH (pitch:Pitch)',
        'RETURN pitch',
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err) return callback(err);
        var pitches = results.map(function (result) {
            return new Pitch(result['pitch']);
        });
        callback(null, pitches);
    });
};

Pitch.updatePitch = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new Pitch(node));
    });
};

// creates the Pitch and persists (saves) it to the db, incl. indexing it:
Pitch.create = function (data, callback) {
    // construct a new instance of our class with the data, so it can
    // validate and extend it, etc., if we choose to do that in the future:
    var pitchNode = db.createNode(data.pitch);
    var p = new Pitch(pitchNode);
    var locationNode = db.createNode(data.location);
    var l = new Pitch(locationNode);

    var params = {
        pitch: data.pitch,
        location: data.location
    };
    var query = [
        'MATCH (u:User {email: "'+data.userEmail+'"})',
        'CREATE (p:Pitch {pitch})',
        'CREATE (l:Location {location})',
        'WITH p, l, u, timestamp() as ts',
        'CREATE (p)-[:LOCATED_IN]->(l)',
        'CREATE (u)-[:CREATED {time: ts}]->(p)',
        'RETURN p'
    ].join('\n');

    

    db.query(query, params, function (err, results) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        console.log(results);
        if (results.length > 0) {
           var pitch = new Pitch(results[0]['p']['data']);
           return callback(null, pitch); 
        }
        return callback("was it made?");
            
    });
};
