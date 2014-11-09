
//create (p:Pitch {title:"birthday", description:"descr", date:"09/19/1986",time:"8:30 pm"})
//create (l:Location {latitude: 33.8779140, longitude: -117.8900750}) return l
//match (l:Location),(p:Pitch) where id(l) = 9 and id(p) = 1 create (p)-[:LOCATED_IN]->(l)

//with timestamp() as ts match (u:Pitch),(p:Pitch) where id(u) = 7 and id(p) = 0 create (u)-[:CREATED {time: ts}]->(p)
//with timestamp() as ts match (u:Pitch),(p:Pitch) where id(u) = 8    and id(p) = 1 create (u)-[:WATCHES {time: ts}]->(p)
//with timestamp() as ts match (u:Pitch),(p:Pitch) where id(u) = 8    and id(p) = 0 create (u)-[:ATTENDS {time: ts}]->(p)

//match (l:Location) where l.latitude = 33.877914 set l.address="800 N State College Blvd, Fullerton, CA 92831" return l
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase( 'http://10.67.16.86/:7474');

// // private constructor:

var Pitch = module.exports = function Pitch(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
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

// // public instance methods:

Pitch.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

Pitch.prototype.del = function (callback) {
    // use a Cypher query to delete both this Pitch and his/her following
    // relationships in one transaction and one network request:
    // (note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
    var query = [
        'MATCH (pitch:Pitch)',
        'WHERE ID(pitch) = {pitchId}',
        'DELETE pitch',
        'WITH pitch',
        'MATCH (pitch) -[rel:follows]- (other)',
        'DELETE rel',
    ].join('\n')

    var params = {
        pitchId: this.id
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

// Pitch.prototype.follow = function (other, callback) {
//     this._node.createRelationshipTo(other._node, 'follows', {}, function (err, rel) {
//         callback(err);
//     });
// };

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


    // but we do the actual persisting with a Cypher query, so we can also
    // apply a label at the same time. (the save() method doesn't support
    // that, since it uses Neo4j's REST API, which doesn't support that.)
    var query = [
        'MATCH (u:Pitch {email: "'+data.PitchEmail+'"})',
        'CREATE (p:Pitch {pitch})',
        'CREATE (l:Location {location})',
        'WITH p, l, u, timestamp() as ts',
        'CREATE (p)-[:LOCATED_IN]->(l)',
        'CREATE (u)-[:CREATED {time: ts}]->(p)',
        'RETURN p',
    ].join('\n');

    var params = {
        pitch: data.pitch,
        location: data.location
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        console.log(results);
        var pitch = new Pitch(results[0]['p']['data']);
        callback(null, pitch);
    });
};

// //Edit Pitch
// Pitch.edit