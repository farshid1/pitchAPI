var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://pitchDB:8ectJEibffM5lK0wM5OZ@pitchdb.sb02.stations.graphenedb.com:24789');
var extend = require('extend');
var Pitch = require('./pitch.js');
var Location = require('./location.js');
// private constructor:

var User = module.exports = function User(_node) {
    this._node = _node;
}

/****** public instance properties: ******/

Object.defineProperty(User.prototype, 'id', {
    get: function () { return this._node.id; }
});

Object.defineProperty(User.prototype, 'name', {
    get: function () {
        return this._node.data['name'];
    },
    set: function (name) {
        this._node.data['name'] = name;
    }
});

/****** public instance methods: ******/

User.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

User.prototype.del = function (callback) {

    var query = [
        'MATCH (user:User)',
        'WHERE ID(user) = {userId}',
        'DELETE user',
        'WITH user',
        'MATCH (user) -[rel:follows]- (other)',
        'DELETE rel',
    ].join('\n');

    var params = {
        userId: this.id
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

// calls callback w/ (err, following, others) where following is an array of
// users this user follows, and others is all other users minus him/herself.
// User.prototype.getFollowingAndOthers = function (callback) {
//     // query all users and whether we follow each one or not:
//     var query = [
//         'MATCH (user:User), (other:User)',
//         'OPTIONAL MATCH (user) -[rel:follows]-> (other)',
//         'WHERE ID(user) = {userId}',
//         'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
//     ].join('\n')

//     var params = {
//         userId: this.id,
//     };

//     var user = this;
//     db.query(query, params, function (err, results) {
//         if (err) return callback(err);

//         var following = [];
//         var others = [];

//         for (var i = 0; i < results.length; i++) {
//             var other = new User(results[i]['other']);
//             var follows = results[i]['COUNT(rel)'];

//             if (user.id === other.id) {
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
//User.prototype.isAttending = function(pitch){
//    var userAttending = {};
//    var pitchAttending = {};
//
//    this._node.outgoing("ATTENDS", function(err, results){
//        if (err) throw (err);
//
//        if (results.length > 0) {
//            userAttending = results
//        }
//    });
//
//    pitch._node.incoming("ATTENDS", function(err, rs){
//        if (err) throw (err);
//
//        if (rs.length > 0) {
//            pitchAttending = rs;
//        }
//    });
//
//    for (var i=0; i<userAttending.length; i++) {
//        for (var j=0; j<pitchAttending.length; j++) {
//            if (userAttending[i] == pitchAttending[j]) {
//                return true;
//            }
//        }
//    }
//    return false;
//
//
//
//};

User.prototype.attend = function (pitch, callback) {

    var query = [
        'MATCH (u:User)-[a:ATTENDS]->(p:Pitch)',
        'WHERE ID(u) = {userId} and ID(p) = {pitchId}',
        'return a',
    ].join('\n');

    var params = {
        userId: this.id,
        pitchId: pitch.id
    };

    var node = this._node;

    db.query(query, params, function(err, results) {
       if (err) return callback(err);

        console.log(results);
        if (results.length > 0) {
            return callback(null, "duplicate");
        }
        else {
            var attend = {
                time: new Date().getTime()
            };
            node.createRelationshipTo(pitch._node, 'ATTENDS', attend, function (err, rel) {
                if (err) return callback(err);
                return callback(null, "success");
            });
        }
    });


};

User.prototype.unattend = function (pitchId, callback) {

    var query = [
        'MATCH (u:User)-[a:ATTENDS]->(p:Pitch)',
        'WHERE ID(u) = {userId} and ID(p) = {pitchId}',
        'DELETE  a',
    ].join('\n');

    var params = {
        userId: this.id,
        pitchId: pitchId
    };

    db.query(query, params, function(err) {
        if (err) return callback(err);
        return callback(null, "success");
    })
};

User.prototype.comment = function (pitch, commentText, callback) {
    console.log(commentText);
    var comment = {
        commentText: commentText,
        time: new Date().getTime()
    };
    this._node.createRelationshipTo(pitch._node, 'COMMENTS', comment, function (err, rel) {
        if (err) return callback(err);
        return callback(null, comment);
    }); 
};

User.prototype.getAttendingPitches = function (callback) {

    var query = [
        'MATCH (u:User)-[a:ATTENDS]->(p:Pitch)-[:LOCATED_IN]->(l:Location)',
        'WHERE ID(u) = {userId}',
        'WITH a, u, p, l',
        'MATCH (creator:User)-[c:CREATED]->(p)',
        'RETURN a, p, l, creator, c',
        'ORDER BY a.joinTime' 
    ].join('\n')

    var params = {
        userId: this.id,
    };

    db.query(query, params, function(err, results) {
        if (err) return callback(err);
        //console.log(results);
        //console.log(results.length);
        
        if (results.length > 0) {

            var pitches = [];
            for (var i = 0; i < results.length; i++) {
                var pitch = extend(null, results[i]['a']._data.data, 
                            results[i]['p']._data.data,
                            results[i]['l']._data.data,
                            {creator:results[i]['creator']._data.data.username},
                            {id: results[i]['p'].id });
                pitches.push(pitch);

            };

            return callback(null, pitches);
            
        }
        return callback("not found");
    });
    
};

User.prototype.getPiches = function (callback) {

    var query = [
        'MATCH (u:User)-[c:CREATED]->(p:Pitch)-[:LOCATED_IN]->(l:Location)',
        'WHERE ID(u) = {userId}',
        'RETURN p, c, l',
        'ORDER BY c.time' 
    ].join('\n')

    var params = {
        userId: this.id,
    };

    db.query(query, params, function(err, results) {
        if (err) return callback(err);
        if (results.length > 0) {
            console.log(results);
            var pitches = [];
            for (var i = 0; i < results.length; i++) {
                console.log(results[i].t);
                var pitch = extend(null, results[i]['c']._data.data,
                            results[i]['p']._data.data,
                            results[i]['l']._data.data,
                            {id: results[i]['p'].id }); 
                pitches.push(pitch);

            };
            return callback(null, pitches);
        }
        return callback("not found");
    });

};

User.prototype.getNotification = function (callback) {

    var query = [
        'MATCH (u:User)-[c:CREATED|ATTENDS]->(p:Pitch)<-[a:ATTENDS|COMMENTS]-(attendee)',
        'WHERE ID(u) = {userId}',
        'RETURN p, a, type(a) as t, attendee',
        'ORDER BY a.time DESC',
    ].join('\n');

    var params = {
        userId: this.id
    };

    db.query(query, params, function(err, results) {
        if (err) return callback(err);
        if (results.length > 0) {
            //console.log(results);
            var notifications = [];
            for (var i = 0; i < results.length; i++) {
                //TODO Change all the time names to time...
                console.log(results[i]['attendee']._data.data.displayName);
                var notification = extend(null, {pitch: results[i]['p']._data.data.title},
                            {time: results[i]['a']._data.data.time},
                            {user: results[i]['attendee']._data.data.displayName},
                            {image: results[i]['p']._data.data.image},
                            {type: results[i].t});
                notifications.push(notification);

            };
            return callback(null, notifications);
        }
        return callback(null, "success");
    })
};

/****** static methods: ******/

User.get = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new User(node));
    });
};

User.getAll = function (callback) {
    var query = [
        'MATCH (user:User)',
        'RETURN user',
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err) return callback(err);
        var users = results.map(function (result) {
            return new User(result['user']);
        });
        callback(null, users);
    });
};

User.login = function (data, callback) {
    var query = [
        'MATCH (user:User)',
        'WHERE user.username ="'+ data.username + '" and user.password = "' + data.password + '"',
        'RETURN user',
    ].join('\n');

    db.query(query, function (err, results) {
        if (err) return callback(err);
        if (results.length > 0) {
            var user = new User(results[0]['user']);
            return callback(null, user);
        }
        callback("Incorrect password");
        
    });
};

User.getUserByUsername = function (username, callback) {
    
    var query = [
        'MATCH (user:User)',
        'WHERE user.username ="'+ username + '"',
        'RETURN user',
    ].join('\n');

    db.query(query, function (err, results) {
        if (err) return callback(err);
        if (results.length > 0) {
            var user = new User(results[0]['user']);
            return callback(null, user);
        }
        callback("user not found by username");
    });
}

//Create user
User.create = function(data, callback) {
    console.log(data);
    var query = [
        'CREATE (user:User {user})',
        'RETURN user',
    ].join('\n');

    // var userNode = db.createNode(data);
    // var u = new User(userNode);

    var params = {
        user: data
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        //console.log(results);
        var user = new User(results[0]['user']);
        callback(null, user);
    });
};
//Edit user
User.edit = function(data, callback) {

};



