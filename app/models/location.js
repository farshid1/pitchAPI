var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase( 'http://pitchDB:c02R29XV94ZZb2VqaEWx@pitchdb.sb02.stations.graphenedb.com:24789');

// // private constructor:

var Location = module.exports = function Location(_node) {

    this._node = _node;
}

// public instance properties:

Object.defineProperty(Location.prototype, 'id', {
    get: function () { return this._node.id; }
});

Object.defineProperty(Location.prototype, 'city', {
    get: function () {
        return this._node.data['city'];
    },
    set: function (city) {
        this._node.data['city'] = city;
    }
});

// public instance methods:

Location.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

// Location.prototype.del = function (callback) {
//     // use a Cypher query to delete both this Location and his/her following
//     // relationships in one transaction and one network request:
//     // (note that this'll still fail if there are any relationships attached
//     // of any other types, which is good because we don't expect any.)
//     var query = [
//         'MATCH (l:Location)',
//         'WHERE ID(l) = {locationId}',
//         'DELETE Location',
//         'WITH Location',
//         'MATCH (Location) -[rel:follows]- (other)',
//         'DELETE rel',
//     ].join('\n')

//     var params = {
//         locationId: this.id
//     };

//     db.query(query, params, function (err) {
//         callback(err);
//     });
// };







// static methods:

Location.get = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new Location(node));
    });
};

Location.getByPitchId = function(pid, callback) {
    var query = [
        'MATCH (p:Pitch)-[:LOCATED_IN]->(l:Location)',
        'WHERE ID(p) = {pitchId}',
        'RETURN l',
    ].join('\n');

    var params = {
        pitchId: pid
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        console.log("from location model",results[0]['l']);
        var location = new Location(results[0]['l']);
        callback(null, location);
    });
};

// Location.updateLocation = function (id, callback) {
//     db.getNodeById(id, function (err, node) {
//         if (err) return callback(err);
//         callback(null, new Location(node));
//     });
// };

// // creates the Location and persists (saves) it to the db, incl. indexing it:
// Location.create = function (data, callback) {
//     // construct a new instance of our class with the data, so it can
//     // validate and extend it, etc., if we choose to do that in the future:
//     var LocationNode = db.createNode(data.Location);
//     var p = new Location(LocationNode);
//     var locationNode = db.createNode(data.location);
//     var l = new Location(locationNode);


//     // but we do the actual persisting with a Cypher query, so we can also
//     // apply a label at the same time. (the save() method doesn't support
//     // that, since it uses Neo4j's REST API, which doesn't support that.)
//     var query = [
//         'MATCH (u:Location {email: "'+data.LocationEmail+'"})',
//         'CREATE (p:Location {Location})',
//         'CREATE (l:Location {location})',
//         'WITH p, l, u, timestamp() as ts',
//         'CREATE (p)-[:LOCATED_IN]->(l)',
//         'CREATE (u)-[:CREATED {time: ts}]->(p)',
//         'RETURN p',
//     ].join('\n');

//     var params = {
//         Location: data.Location,
//         location: data.location
//     };

//     db.query(query, params, function (err, results) {
//         if (err) return callback(err);
//         console.log(results);
//         var Location = new Location(results[0]['p']['data']);
//         callback(null, Location);
//     });
// };

// // //Edit Location
// // Location.edit