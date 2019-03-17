// classrooms handling

var mongo = require("mongodb"),
  users = require("./users");

var db;

var classroomsCollection;

// Init database
exports.init = function(settings, callback) {
  classroomsCollection = settings.collections.classrooms;
  var client = new mongo.MongoClient(
	  'mongodb://'+settings.database.server+':'+settings.database.port+'/'+settings.database.name,
	  {auto_reconnect: false, w:1, useNewUrlParser: true});

  // Open the db
  client.connect(function(err, client) {
	  db = client.db(settings.database.name);
    if (err) {
    }
    if (callback) callback();
  });
};

/**
 * @api {post} api/v1/classrooms Add classroom
 * @apiName Addclassroom
 * @apiDescription Add classroom in the database. Returns the inserted classroom.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique classroom id
 * @apiSuccess {String} name classroom name
 * @apiSuccess {Object} color classroom color
 * @apiSuccess {String} color.stroke classroom strike color
 * @apiSuccess {String} color.fill classroom fill color
 * @apiSuccess {Array} students List of students
 * @apiSuccess {Number} created_time when the classroom was created on the server
 * @apiSuccess {Number} timestamp when the classroom last accessed the server
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
 *      {
 *       "_id"         : "592d4445cc8be9187abb284f",
 *       "name"        : "Group A",
 *       "color": {
 *         "stroke"	   : "#00A0FF",
 *         "fill"      : "#00B20D"
 *       },
 *       "students"     : [592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f,...],
 *       "created_time"    : 6712213121,
 *       "timestamp"       : 6712375127,
 *      }
 *    ]
 *
 **/
exports.addClassroom = function(req, res) {
  //validate
  if (!req.body.classroom) {
    res.status(401).send({
      error: "Classroom object not defined!",
      code: 22
    });
    return;
  }

  //parse user details
  var classroom = JSON.parse(req.body.classroom);

  //add timestamp & language
  classroom.created_time = +new Date();
  classroom.timestamp = +new Date();

  // store
  db.collection(classroomsCollection, function(err, collection) {
    collection.insertOne(
      classroom,
      {
        safe: true
      },
      function(err, result) {
        if (err) {
          res.status(500).send({
            error: "An error has occurred",
            code: 10
          });
        } else {
          res.send(result.ops[0]);
        }
      }
    );
  });
};

/**
 * @api {delete} api/v1/classrooms Remove classroom
 * @apiName RemoveClassroom
 * @apiDescription Remove the classroom by id.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} classid Unique id of the classroom to delete Classroom
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "5569f4b019e0b4c9525b3c97"
 *     }
 **/
exports.removeClassroom = function(req, res) {
  //validate
  if (!mongo.ObjectID.isValid(req.params.classid)) {
    res.status(401).send({
      error: "Invalid classroom id",
      code: 23
    });
    return;
  }

  db.collection(classroomsCollection, function(err, collection) {
    collection.deleteOne(
      {
        _id: new mongo.ObjectID(req.params.classid)
      },
      function(err, result) {
        if (err) {
          res.status(500).send({
            error: "An error has occurred",
            code: 10
          });
        } else {
          if (result && result.result && result.result.n == 1) {
            res.send({
              id: req.params.classid
            });
          } else {
            res.status(401).send({
              error: "Inexisting classroom id",
              code: 23
            });
          }
        }
      }
    );
  });
};

/**
 * @api {get} api/v1/classrooms/ Get all classrooms
 * @apiName GetAllclassrooms
 * @apiDescription Retrieve all classrooms data registered on the server.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiExample Example usage:
 *     "/api/v1/classrooms"
 *
 * @apiSuccess {Object[]} classrooms
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     "classrooms":[
 *      {
 *       "_id"         : "592d4445cc8be9187abb284f",
 *       "name"        : "Group A",
 *       "color": {
 *         "stroke"	   : "#00A0FF",
 *         "fill"      : "#00B20D"
 *       },
 *       "students"     : [592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f, ...],
 *       "created_time"    : 6712213121,
 *       "timestamp"       : 6712375127,
 *      },
 *      ...
 *     ],
 *     "limit": 10,
 *     "offset": 20,
 *     "total": 200,
 *     "sort": "+name",
 *     "links": {
 *     	"prev_page": "/api/v1/classrooms?limit=10&offset=10",
 *     	"next_page": "/api/v1/classrooms?limit=10&offset=30"
 *     }
 *    }
 **/
exports.findAll = function(req, res) {
  //prepare condition
  var query = {};
  query = addQuery("q", req.query, query);

  // add filter and pagination
  db.collection(classroomsCollection, function(err, collection) {
    //count data
    collection.countDocuments(query, function(err, count) {
      //define var
      var params = JSON.parse(JSON.stringify(req.query));
      var route = req.route.path;
      var options = getOptions(req, count, "+name");

      //get data
      collection.find(query, options).toArray(function(err, classrooms) {
        //add pagination
        var data = {
          classrooms: classrooms,
          offset: options.skip,
          limit: options.limit,
          total: options.total,
          sort: options.sort[0][0] + "(" + options.sort[0][1] + ")",
          links: {
            prev_page:
              options.skip - options.limit >= 0
                ? formPaginatedUrl(
                    route,
                    params,
                    options.skip - options.limit,
                    options.limit
                  )
                : undefined,
            next_page:
              options.skip + options.limit < options.total
                ? formPaginatedUrl(
                    route,
                    params,
                    options.skip + options.limit,
                    options.limit
                  )
                : undefined
          }
        };

        // Return
        res.send(data);
      });
    });
  });
};

/**
 * @api {get} api/v1/classrooms/:id Get classroom detail
 * @apiName GetClassroom
 * @apiDescription Retrieve detail for a specific classroom.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique classroom id
 * @apiSuccess {String} name classroom name
 * @apiSuccess {Object} color classroom color
 * @apiSuccess {String} color.stroke classroom strike color
 * @apiSuccess {String} color.fill classroom fill color
 * @apiSuccess {Array} students List of students
 * @apiSuccess {Number} created_time when the classroom was created on the server
 * @apiSuccess {Number} timestamp when the classroom last accessed the server
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *       "_id"         : "592d4445cc8be9187abb284f",
 *       "name"        : "Group A",
 *       "color": {
 *         "stroke"	   : "#00A0FF",
 *         "fill"      : "#00B20D"
 *       },
 *       "students"     : [
 *     		{
 *       		"name": "Tarun",
 *       		"role": "student",
 *       		"color": {
 *       		  "stroke": "#00A0FF",
 *       		  "fill": "#00B20D"
 *       		},
 *       		"favorites": [
 *         		 	"org.olpcfrance.Abecedarium",
 *         		 	"org.sugarlabs.ChatPrototype",
 *         		 	"org.sugarlabs.Clock",
 *         		 	"org.olpcfrance.FoodChain",
 *         		 	"org.sugarlabs.GearsActivity",
 *         		 	"org.sugarlabs.GTDActivity",
 *         		 	"org.olpcfrance.Gridpaint",
 *          		"org.olpc-france.LOLActivity",
 *          		"org.sugarlabs.Markdown",
 *          		"org.sugarlabs.MazeWebActivity",
 *          		"org.sugarlabs.PaintActivity"
 *       		],
 *       		"language": "en",
 *       		"password": "xxx",
 *       		"private_journal": "5569f4b019e0b4c9525b3c96",
 *       		"shared_journal": "536d30874326e55f2a22816f",
 *       		"created_time": 1423341000747,
 *       		"timestamp": 1423341001747,
 *       		"_id": "5569f4b019e0b4c9525b3c97"
 *    		},
 * 			...
 * 		],
 *       "created_time"    : 6712213121,
 *       "timestamp"       : 6712375127,
 *      }
 **/
exports.findById = function(req, res) {
  if (!mongo.ObjectID.isValid(req.params.classid)) {
    res.status(401).send({
      error: "Invalid classroom id",
      code: 23
    });
    return;
  }
  db.collection(classroomsCollection, function(err, collection) {
    collection.findOne(
      {
        _id: new mongo.ObjectID(req.params.classid)
      },
      function(err, classroom) {
        if (!classroom) {
          res.status(401).send({});
          return;
        }

        // get student mappings
        users.getAllUsers({
          role: 'student'
        }, {}, function(users) {
            // append all students with selected flag
            var studentList = classroom.students;
            classroom.students = users.map(function(student){
              student.is_member = false;
              if(studentList.indexOf(student._id.toString()) > -1){
                student.is_member = true;
              }
              return student;
            });
            // return
            res.send(classroom);
          }
        );
      }
    );
  });
};

/**
 * @api {put} api/v1/classrooms/:id Update classroom
 * @apiName UpdateClassroom
 * @apiDescription Update an classroom. Return the classroom updated.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique classroom id
 * @apiSuccess {String} name classroom name
 * @apiSuccess {Object} color classroom color
 * @apiSuccess {String} color.stroke classroom strike color
 * @apiSuccess {String} color.fill classroom fill color
 * @apiSuccess {Array} students List of students
 * @apiSuccess {Number} created_time when the classroom was created on the server
 * @apiSuccess {Number} timestamp when the classroom last accessed the server
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *       "_id"         : "592d4445cc8be9187abb284f",
 *       "name"        : "Group A",
 *       "color": {
 *         "stroke"	   : "#00A0FF",
 *         "fill"      : "#00B20D"
 *       },
 *       "students"     : [
 *     		{
 *       		"name": "Tarun",
 *       		"role": "student",
 *       		"color": {
 *       		  "stroke": "#00A0FF",
 *       		  "fill": "#00B20D"
 *       		},
 *       		"favorites": [
 *         		 	"org.olpcfrance.Abecedarium",
 *         		 	"org.sugarlabs.ChatPrototype",
 *         		 	"org.sugarlabs.Clock",
 *         		 	"org.olpcfrance.FoodChain",
 *         		 	"org.sugarlabs.GearsActivity",
 *         		 	"org.sugarlabs.GTDActivity",
 *         		 	"org.olpcfrance.Gridpaint",
 *          		"org.olpc-france.LOLActivity",
 *          		"org.sugarlabs.Markdown",
 *          		"org.sugarlabs.MazeWebActivity",
 *          		"org.sugarlabs.PaintActivity"
 *       		],
 *       		"language": "en",
 *       		"password": "xxx",
 *       		"private_journal": "5569f4b019e0b4c9525b3c96",
 *       		"shared_journal": "536d30874326e55f2a22816f",
 *       		"created_time": 1423341000747,
 *       		"timestamp": 1423341001747,
 *       		"_id": "5569f4b019e0b4c9525b3c97"
 *    		},
 * 			...
 * 		],
 *       "created_time"    : 6712213121,
 *       "timestamp"       : 6712375127,
 *      }
 **/
exports.updateClassroom = function(req, res) {
  if (!mongo.ObjectID.isValid(req.params.classid)) {
    res.status(401).send({
      error: "Invalid classroom id",
      code: 23
    });
    return;
  }

  //validate
  if (!req.body.classroom) {
    res.status(401).send({
      error: "Classroom object not defined!",
      code: 22
    });
    return;
  }

  var classid = req.params.classid;
  var classroom = JSON.parse(req.body.classroom);

  //add timestamp & language
  classroom.timestamp = +new Date();

  //update the classroom
  db.collection(classroomsCollection, function(err, collection) {
    collection.updateOne(
      {
        _id: new mongo.ObjectID(classid)
      },
      {
        $set: classroom
      },
      {
        safe: true
      },
      function(err, result) {
        if (err) {
          res.status(500).send({
            error: "An error has occurred",
            code: 10
          });
        } else {
          if (result && result.result && result.result.n == 1) {
            collection.findOne(
              {
                _id: new mongo.ObjectID(classid)
              },
              function(err, classroomResponse) {
                // get student mappings
                users.getAllUsers(
                  {
                    _id: {
                      $in: classroomResponse.students.map(
                        id => new mongo.ObjectID(id)
                      )
                    }
                  },
                  {},
                  function(users) {
                    // append students
                    classroomResponse.students = users;

                    // return
                    res.send(classroomResponse);
                  }
                );
              }
            );
          } else {
            res.status(401).send({
              error: "Inexisting classroom id",
              code: 23
            });
          }
        }
      }
    );
  });
};

//private function for filtering and sorting
function getOptions(req, count, def_sort) {
  //prepare options
  var sort_val = typeof req.query.sort === "string" ? req.query.sort : def_sort;
  var sort_type = sort_val.indexOf("-") == 0 ? "desc" : "asc";
  var options = {
    sort: [[sort_val.substring(1), sort_type]],
    skip: req.query.offset || 0,
    total: count,
    limit: req.query.limit || 10
  };

  //cast to int
  options.skip = parseInt(options.skip);
  options.limit = parseInt(options.limit);

  //return
  return options;
}

function addQuery(filter, params, query, default_val) {
  //check default case
  query = query || {};

  //validate
  if (
    typeof params[filter] != "undefined" &&
    typeof params[filter] === "string"
  ) {
    if (filter == "q") {
      query["name"] = {
        $regex: new RegExp(params[filter], "i")
      };
    } else {
      query[filter] = {
        $regex: new RegExp("^" + params[filter] + "$", "i")
      };
    }
  } else {
    //default case
    if (typeof default_val != "undefined") {
      query[filter] = default_val;
    }
  }

  //return
  return query;
}

//form query params
function formPaginatedUrl(route, params, offset, limit) {
  //set params
  params.offset = offset;
  params.limit = limit;
  var str = [];
  for (var p in params)
    if (params.hasOwnProperty(p)) {
      str.push(p + "=" + params[p]);
    }
  return "?" + str.join("&");
}
