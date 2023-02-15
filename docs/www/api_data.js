define({ "api": [
  {
    "type": "get",
    "url": "api/v1/activities/:id?fields=:fields",
    "title": "Get activity detail",
    "name": "GetActivity",
    "description": "<p>Retrieve details of an activity.</p>",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/activities/org.olpcfrance.Abecedarium\"\n\"/api/v1/activities/org.olpcfrance.Abecedarium?fields=id,index,name,index\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>Activity unique ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "fields",
            "description": "<p>Fields to display <code>e.g. fields=name,index,version</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Activity unique ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Display name of the activity</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>Activity version number</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "directory",
            "description": "<p>Location directory of the activity in Sugarizer</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "icon",
            "description": "<p>Location of the icon in the activity directory</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "favorite",
            "description": "<p>true means that the activity is in the favorite view</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>Reserved for internal use</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "index",
            "description": "<p>Index of the activity in the activity list</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"org.olpcfrance.Abecedarium\",\n  \"name\": \"Abecedarium\",\n  \"version\": \"5\",\n  \"directory\": \"activities/Abecedarium.activity\",\n  \"icon\": \"activity/activity-icon.svg\",\n  \"favorite\": true,\n  \"activityId\": null,\n  \"index\": 11\n}",
          "type": "json"
        },
        {
          "title": "Success-Response-Fields-Limited:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"org.olpcfrance.Abecedarium\",\n  \"name\": \"Abecedarium\",\n  \"version\": \"5\",\n  \"index\": 11\n}",
          "type": "json"
        }
      ]
    },
    "group": "Activities",
    "version": "1.0.0",
    "filename": "api/controller/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "api/v1/activities?name=:name&favorite=:favorite&fields=:fields&sort=:sort",
    "title": "Get all activities",
    "name": "GetAllActivities",
    "description": "<p>Retrieve details of all activities installed on the server.</p>",
    "group": "Activities",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/activities\"\n\"/api/v1/activities?name=gears\"\n\"/api/v1/activities?favorite=false&sort=-version\"\n\"/api/v1/activities?favorite=true&fields=index,name&sort=+name\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>Display name of the activity <code>e.g. name=paint</code></p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "favorite",
            "description": "<p>true means that the activity is in the favorite view <code>e.g. favorite=true</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "fields",
            "description": "<p>Fields to display <code>e.g. fields=name,index,version</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "+index",
            "description": "<p>Order of results <code>e.g. sort=-name or sort=+index</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "activities",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"id\": \"org.sugarlabs.GearsActivity\",\n    \"name\": \"Gears\",\n    \"version\": \"6\",\n    \"directory\": \"activities/Gears.activity\",\n    \"icon\": \"activity/activity-icon.svg\",\n    \"favorite\": true,\n    \"activityId\": null,\n    \"index\": 0\n  },\n  {\n    \"id\": \"org.sugarlabs.MazeWebActivity\",\n    \"name\": \"Maze Web\",\n    \"version\": \"2\",\n    \"directory\": \"activities/MazeWeb.activity\",\n    \"icon\": \"activity/activity-icon.svg\",\n    \"favorite\": true,\n    \"activityId\": null,\n    \"index\": 1\n  },\n  ...\n]",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "api/v1/activities",
    "title": "Update details of activities",
    "name": "UpdateActivities",
    "description": "<p>Update about details of the activities. Only admin can perform this action.</p>",
    "group": "Activities",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "activities",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"id\": \"org.sugarlabs.GearsActivity\",\n    \"name\": \"Gears\",\n    \"version\": \"6\",\n    \"directory\": \"activities/Gears.activity\",\n    \"icon\": \"activity/activity-icon.svg\",\n    \"favorite\": true,\n    \"activityId\": null,\n    \"index\": 0\n  },\n  {\n    \"id\": \"org.sugarlabs.MazeWebActivity\",\n    \"name\": \"Maze Web\",\n    \"version\": \"2\",\n    \"directory\": \"activities/MazeWeb.activity\",\n    \"icon\": \"activity/activity-icon.svg\",\n    \"favorite\": true,\n    \"activityId\": null,\n    \"index\": 1\n  },\n  ...\n]",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "api/v1/assignments",
    "title": "Add assignment",
    "name": "AddAssignment",
    "description": "<p>Add assignment in the database. Returns the inserted assignment.</p>",
    "group": "Assignments",
    "version": "1.5.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique assignment id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Assignment name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "dueDate",
            "description": "<p>Assignment due date.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "assignedWork",
            "description": "<p>Assignment assigned work.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "instructions",
            "description": "<p>Assignment instructions.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "lateTurnIn",
            "description": "<p>Assignment late turn in.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>Assignment created time.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "classrooms",
            "description": "<p>Assignment assigned to classrooms.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "options",
            "description": "<p>Assignment options.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "created_by",
            "description": "<p>Assignment created by.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>Assignment timestamp.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isAssigned",
            "description": "<p>Assignment is assigned.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "journal_id",
            "description": "<p>Assignment journal id.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\n      \"name\": \"DrawAssignment\",\n      \"assignedWork\": \"9bd39613-c6e2-413f-8672-4b85d7f85ce2\",\n      \"instructions\": \"Draw a penguin\",\n      \"lateTurnIn\": false,\n      \"dueDate\": \"1663617458035\",\n      \"options\": {\n          \"sync\": true,\n          \"stats\": true\n      },\n      \"classrooms\": [\n          \"630b469b43225439163b8d42\",\n          \"630b46aa43225439163b8d43\"\n      ],\n      \"created_time\": 1663617458028,\n      \"timestamp\": 1663617458028,\n      \"created_by\": \"630b467143225439163b8d40\",\n      \"journal_id\": \"630b467143225439163b8d3f\",\n      \"isAssigned\": false,\n      \"_id\": \"6328c9b2831c11556edd785e\"\n  }",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "get",
    "url": "api/v1/assignment/:assignmentId",
    "title": "Get assignment details",
    "name": "GetAssignment",
    "description": "<p>Retrieve detail for a specific assignment.</p>",
    "group": "Assignments",
    "version": "1.5.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "assignmentId",
            "description": "<p>Unique id of Assignment to be delete.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique assignment id.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Assignment name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "dueDate",
            "description": "<p>Assignment due date.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "assignedWork",
            "description": "<p>Assignment assigned work.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "instructions",
            "description": "<p>Assignment instructions.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "lateTurnIn",
            "description": "<p>Assignment late turn in.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>Assignment created time.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "classrooms",
            "description": "<p>Assignment assigned to classrooms.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "options",
            "description": "<p>Assignment options.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "created_by",
            "description": "<p>Assignment created by.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>Assignment timestamp.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "isAssigned",
            "description": "<p>Assignment is assigned.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "journal_id",
            "description": "<p>Assignment journal id.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "  HTTP/1.1 200 OK\n {\n    \"_id\": \"63275d05bcb501f024681518\",\n    \"name\": \"Draw Monkey\",\n    \"assignedWork\": {\n        \"metadata\": {\n            \"title\": \"Paint Assignment\",\n            \"title_set_by_user\": \"0\",\n            \"activity\": \"org.olpcfrance.PaintActivity\",\n            \"activity_id\": \"7abd556d-d43a-4e0b-83ec-40f8bf2f13af\",\n            \"creation_time\": 1663272983745,\n            \"timestamp\": 1663273031602,\n            \"file_size\": 0,\n            \"buddy_name\": \"t1\",\n            \"buddy_color\": {\n                \"stroke\": \"#FF8F00\",\n                \"fill\": \"#00A0FF\"\n                },\n            \"textsize\": 12211,\n            \"user_id\": \"630b463f43225439163b8d3e\"\n        },\n        \"text\": \"63238847d625795abbd4b4b6\",\n        \"objectId\": \"8d909712-68d5-482d-8878-2a978726f05c\"\n   },\n  \"instructions\": \"Draw some\",\n  \"dueDate\": 1663547400000,\n \"classrooms\": [\n    {\n        \"_id\": \"630b469b43225439163b8d42\",\n        \"name\": \"JS\",\n        \"students\": [\n            \"630b45f443225439163b8d3a\",\n            \"631153f4f2a064f218544c79\"\n        ],\n        \"color\": {\n            \"stroke\": \"#D1A3FF\",\n            \"fill\": \"#F8E800\"\n        },\n        \"options\": {\n            \"sync\": true,\n            \"stats\": true\n        },\n        \"created_time\": 1661683355253,\n        \"timestamp\": 1662323105024\n    },\n    {\n        \"_id\": \"630b468e43225439163b8d41\",\n        \"name\": \"Physics\",\n        \"students\": [\n            \"630b460e43225439163b8d3c\",\n            \"630b45f443225439163b8d3a\"\n        ],\n        \"color\": {\n            \"stroke\": \"#FF2B34\",\n            \"fill\": \"#AC32FF\"\n        },\n        \"options\": {\n            \"sync\": true,\n            \"stats\": true\n        },\n        \"created_time\": 1661683342983,\n        \"timestamp\": 1661683342983\n    }\n ],\n \"lateTurnIn\": false,\n \"options\": {\n    \"sync\": true,\n    \"stats\": true\n    },\n \"created_time\": 1663524101201,\n \"timestamp\": 1663531297792,\n \"created_by\": \"630b463f43225439163b8d3e\",\n \"journal_id\": \"630b463f43225439163b8d3d\",\n \"isAssigned\": true\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/assignment/:assignmentId\"",
        "type": "json"
      }
    ],
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "get",
    "url": "api/v1/assignments",
    "title": "Get all assignments",
    "name": "GetAssignments",
    "description": "<p>Retrieve all assignment data registered on the server.</p>",
    "group": "Assignments",
    "version": "1.5.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/assignments\"",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "assignments.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n    \"assignments\": [\n        {\n            \"_id\": \"63275d05bcb501f024681518\",\n            \"name\": \"Draw Monkey\",\n            \"assignedWork\": {\n                \"metadata\": {\n                    \"title\": \"Paint Assignment\",\n                    \"title_set_by_user\": \"0\",\n                    \"activity\": \"org.olpcfrance.PaintActivity\",\n                    \"activity_id\": \"7abd556d-d43a-4e0b-83ec-40f8bf2f13af\",\n                    \"creation_time\": 1663272983745,\n                    \"timestamp\": 1663273031602,\n                    \"file_size\": 0,\n                    \"buddy_name\": \"t1\",\n                    \"buddy_color\": {\n                        \"stroke\": \"#FF8F00\",\n                        \"fill\": \"#00A0FF\"\n                    },\n                    \"textsize\": 12211,\n                    \"user_id\": \"630b463f43225439163b8d3e\"\n                },\n                \"text\": \"63238847d625795abbd4b4b6\",\n                \"objectId\": \"8d909712-68d5-482d-8878-2a978726f05c\"\n            },\n            \"instructions\": \"Draw some\",\n            \"dueDate\": 1663547400000,\n            \"classrooms\": [\n                \"630b469b43225439163b8d42\",\n                \"630b468e43225439163b8d41\"\n            ],\n            \"lateTurnIn\": false,\n            \"created_time\": 1663524101201,\n            \"timestamp\": 1663531297792,\n            \"created_by\": \"630b463f43225439163b8d3e\",\n            \"journal_id\": \"630b463f43225439163b8d3d\",\n            \"isAssigned\": true,\n            \"insensitive\": \"draw monkey\"\n        }\n    ],\n    \"offset\": 0,\n    \"limit\": 10,\n    \"total\": 5,\n    \"sort\": \"name(asc)\",\n    \"links\": {\n        \"prev_page\": \"/api/v1/assignments?limit=10&offset=10\",\n \t    \"next_page\": \"/api/v1/assignments?limit=10&offset=30\"\n    }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "get",
    "url": "api/v1/assignments/:id",
    "title": "Get Deliveries",
    "name": "GetDeliveries",
    "group": "Assignments",
    "version": "1.5.0",
    "description": "<p>Get all deliveries for a specific assignment.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "assignmentId",
            "description": "<p>Assignment id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "deliveries",
            "description": "<p>List of deliveries.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Journal id.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "content",
            "description": "<p>Journal Entry.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "content.metadata",
            "description": "<p>Journal Entry metadata.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "content.text",
            "description": "<p>Journal Entry text.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "content.objectId",
            "description": "<p>Journal Entry objectId.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\n    \"deliveries\": [\n        {\n            \"_id\": \"630b460e43225439163b8d3b\",\n            \"content\": [\n                {\n                    \"metadata\": {\n                        \"title\": \"Implode Activity\",\n                        \"title_set_by_user\": \"0\",\n                        \"activity\": \"org.sugarlabs.Implode\",\n                        \"activity_id\": \"5cf070b7-8ba0-4e71-a670-ed9df4a4dfc5\",\n                        \"creation_time\": 1663274452551,\n                        \"timestamp\": 1663584032296,\n                        \"file_size\": 0,\n                        \"buddy_name\": \"Nikhil\",\n                        \"buddy_color\": {\n                            \"stroke\": \"#F8E800\",\n                            \"fill\": \"#008009\"\n                        },\n                        \"textsize\": 2352,\n                        \"user_id\": \"630b460e43225439163b8d3c\",\n                        \"assignmentId\": \"63275962bcb501f02468148f\",\n                        \"submissionDate\": 1663584032294,\n                        \"dueDate\": 1663605000000,\n                        \"instructions\": \"dffdfdf\",\n                        \"lateTurnIn\": true,\n                        \"isSubmitted\": true,\n                        \"status\": null,\n                        \"comment\": \"\"\n                    },\n                    \"text\": \"632848d1781c3ddaa0eb6b9d\",\n                    \"objectId\": \"2b20826f-90c0-4810-83b0-de31cd35b5fe\"\n                }\n            ]\n        },\n        {\n            \"_id\": \"630b45f443225439163b8d39\",\n            \"content\": [\n                {\n                    \"metadata\": {\n                        \"title\": \"Implode Activity\",\n                        \"title_set_by_user\": \"0\",\n                        \"activity\": \"org.sugarlabs.Implode\",\n                        \"activity_id\": \"5cf070b7-8ba0-4e71-a670-ed9df4a4dfc5\",\n                        \"creation_time\": 1663274452551,\n                        \"timestamp\": 1663576160640,\n                        \"file_size\": 0,\n                        \"buddy_name\": \"Rohan\",\n                        \"buddy_color\": {\n                            \"stroke\": \"#8BFF7A\",\n                            \"fill\": \"#AC32FF\"\n                        },\n                        \"textsize\": 2352,\n                        \"user_id\": \"630b45f443225439163b8d3a\",\n                        \"assignmentId\": \"63275962bcb501f02468148f\",\n                        \"submissionDate\": 1663576267006,\n                        \"dueDate\": 1663605000000,\n                        \"instructions\": \"dffdfdf\",\n                        \"lateTurnIn\": true,\n                        \"isSubmitted\": true,\n                        \"status\": \"Delivered\",\n                        \"comment\": \"\"\n                    },\n                    \"text\": \"63282866781c3ddaa0eb6b1c\",\n                    \"objectId\": \"c90cfadf-83ce-4fba-904a-95ea6c33e3ac\"\n                }\n            ]\n        }\n    ],\n    \"offset\": 0,\n    \"limit\": 10,\n    \"total\": 7,\n    \"sort\": \"buddy_name(asc)\",\n    \"links\": {}\n   }",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "get",
    "url": "api/v1/assignments/launch/:assignmentId",
    "title": "Launch an assignment",
    "name": "LaunchAssignment",
    "group": "Assignments",
    "version": "1.5.0",
    "description": "<p>Launches the assignment for the Students.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "assignmentId",
            "description": "<p>Assignment unique id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "count",
            "description": "<p>Number of students to whom the assignment has been assigned.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\n  \"count\": 3\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "delete",
    "url": "api/assignments/:assignmentId",
    "title": "Remove assignment",
    "name": "RemoveAssignment",
    "description": "<p>Remove assignment by assignmentId.</p>",
    "group": "Assignments",
    "version": "1.5.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "assignmentId",
            "description": "<p>Unique id of Assignment to be delete.</p>"
          }
        ]
      }
    },
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "PUT",
    "url": "api/v1/assignments/deliveries/return/:assignmentId",
    "title": "Return Assignment",
    "name": "ReturnAssignment",
    "description": "<p>Return Assignment</p>",
    "group": "Assignments",
    "version": "1.5.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "assignmentId",
            "description": "<p>Assignment id.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "oid",
            "description": "<p>ObjectId.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/assignments/deliveries/return/:assignmentId?oid=5b9b1b0b0f0000b800000000\"",
        "type": "json"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\n\"lastErrorObject\": {\n    \"n\": 1,\n    \"updatedExisting\": true\n},\n\"value\": {\n    \"_id\": \"630b460e43225439163b8d3b\",\n    \"content\": [\n        {\n            \"metadata\": {\n                \"title\": \"Write Activity\",\n                \"title_set_by_user\": \"0\",\n                \"activity\": \"org.sugarlabs.Write\",\n                \"activity_id\": \"06dd648a-9f6a-4251-8f15-0abd6bcc3017\",\n                \"creation_time\": 1663274425907,\n                \"timestamp\": 1663576199678,\n                \"file_size\": 0,\n                \"buddy_name\": \"Nikhil\",\n                \"buddy_color\": {\n                    \"stroke\": \"#F8E800\",\n                    \"fill\": \"#008009\"\n                },\n                \"textsize\": 100553,\n                \"user_id\": \"630b460e43225439163b8d3c\",\n                \"assignmentId\": \"6327099f730d98993ee793ff\",\n                \"submissionDate\": 1663576204212,\n                \"dueDate\": 1663781400000,\n                \"instructions\": \"Write about Elon musk\",\n                \"lateTurnIn\": false,\n                \"isSubmitted\": false,\n                \"status\": \"Delivered\",\n                \"comment\": \"Nice work\"\n            },\n            \"text\": \"63282889781c3ddaa0eb6b25\",\n            \"objectId\": \"fc801777-fdb1-4ce2-8f62-561cccc0c38b\"\n        },\n        ....more objects\n        {\n            \"metadata\": {\n                \"title\": \"Write Activity\",\n                \"title_set_by_user\": \"0\",\n                \"activity\": \"org.sugarlabs.Write\",\n                \"activity_id\": \"06dd648a-9f6a-4251-8f15-0abd6bcc3017\",\n                \"creation_time\": 1663274425907,\n                \"timestamp\": 1663274434078,\n                \"file_size\": 0,\n                \"buddy_name\": \"Nikhil\",\n                \"buddy_color\": {\n                    \"stroke\": \"#00EA11\",\n                    \"fill\": \"#005FE4\"\n                },\n                \"textsize\": 100524,\n                \"user_id\": \"630b460e43225439163b8d3c\",\n                \"assignmentId\": \"63275d05bcb501f024681518\",\n                \"submissionDate\": null,\n                \"dueDate\": \"\",\n                \"instructions\": \"ins\",\n                \"lateTurnIn\": false,\n                \"isSubmitted\": false,\n                \"status\": null,\n                \"comment\": \"paint\"\n            },\n            \"text\": \"632c0475ad098c1a779b05b8\",\n            \"objectId\": \"98406ca6-861d-4e98-836d-eb819ab60e3c\"\n        }\n    ],\n    \"shared\": false\n},\n\"ok\": 1\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "PUT",
    "url": "api/v1/assignments/deliveries/submit/:assignmentId",
    "title": "Submit Assignment",
    "name": "SubmitAssignment",
    "description": "<p>Submit Assignment.</p>",
    "group": "Assignments",
    "version": "1.5.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "assignmentId",
            "description": "<p>Assignment id.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "oid",
            "description": "<p>ObjectId.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/assignments/deliveries/submit/:assignmentId?oid=5b9b1b0b0f0000b800000000\"",
        "type": "json"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\n\"lastErrorObject\": {\n    \"n\": 1,\n    \"updatedExisting\": true\n},\n\"value\": {\n    \"_id\": \"630b460e43225439163b8d3b\",\n    \"content\": [\n        {\n            \"metadata\": {\n                \"title\": \"Write Activity\",\n                \"title_set_by_user\": \"0\",\n                \"activity\": \"org.sugarlabs.Write\",\n                \"activity_id\": \"06dd648a-9f6a-4251-8f15-0abd6bcc3017\",\n                \"creation_time\": 1663274425907,\n                \"timestamp\": 1663576199678,\n                \"file_size\": 0,\n                \"buddy_name\": \"Nikhil\",\n                \"buddy_color\": {\n                    \"stroke\": \"#F8E800\",\n                    \"fill\": \"#008009\"\n                },\n                \"textsize\": 100553,\n                \"user_id\": \"630b460e43225439163b8d3c\",\n                \"assignmentId\": \"6327099f730d98993ee793ff\",\n                \"submissionDate\": 1663576204212,\n                \"dueDate\": 1663781400000,\n                \"instructions\": \"Write about Elon musk\",\n                \"lateTurnIn\": false,\n                \"isSubmitted\": false,\n                \"status\": \"Delivered\",\n                \"comment\": \"Nice work\"\n            },\n            \"text\": \"63282889781c3ddaa0eb6b25\",\n            \"objectId\": \"fc801777-fdb1-4ce2-8f62-561cccc0c38b\"\n        },\n        ....more objects\n        {\n            \"metadata\": {\n                \"title\": \"Write Activity\",\n                \"title_set_by_user\": \"0\",\n                \"activity\": \"org.sugarlabs.Write\",\n                \"activity_id\": \"06dd648a-9f6a-4251-8f15-0abd6bcc3017\",\n                \"creation_time\": 1663274425907,\n                \"timestamp\": 1663274434078,\n                \"file_size\": 0,\n                \"buddy_name\": \"Nikhil\",\n                \"buddy_color\": {\n                    \"stroke\": \"#00EA11\",\n                    \"fill\": \"#005FE4\"\n                },\n                \"textsize\": 100524,\n                \"user_id\": \"630b460e43225439163b8d3c\",\n                \"assignmentId\": \"63275d05bcb501f024681518\",\n                \"submissionDate\": null,\n                \"dueDate\": \"1663741400000\",\n                \"instructions\": \"ins\",\n                \"lateTurnIn\": false,\n                \"isSubmitted\": true,\n                \"status\": \"Delivered\",\n                \"comment\": \"paint\"\n            },\n            \"text\": \"632c0475ad098c1a779b05b8\",\n            \"objectId\": \"98406ca6-861d-4e98-836d-eb819ab60e3c\"\n        }\n    ],\n    \"shared\": false\n},\n\"ok\": 1\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "put",
    "url": "api/assignments/:assignmentId",
    "title": "Update assignment",
    "name": "UpdateAssignment",
    "description": "<p>Update an assignment. Return the assignment updated.</p>",
    "group": "Assignments",
    "version": "1.5.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\n   \"id\": \"6328c9b2831c11556edd785e\",\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "put",
    "url": "api/assignments/:assignmentId/comments/:commentId",
    "title": "Update comment",
    "name": "UpdateComment",
    "description": "<p>Update a comment. Return the comment updated.</p>",
    "group": "Assignments",
    "version": "1.5.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "comment",
            "description": "<p>Comment.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\n   \"comment\": \"Good\"\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/assignments/deliveries/comment/:assignmentId?oid=5b9b1b0b0f0000b800000000\"",
        "type": "json"
      }
    ],
    "filename": "api/controller/assignments.js",
    "groupTitle": "Assignments"
  },
  {
    "type": "post",
    "url": "auth/login/",
    "title": "Login User",
    "name": "Login_User",
    "description": "<p>login a user (Admin or Student) on to the system. Return the user created with access token.</p>",
    "group": "Auth",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Unique token of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "expires",
            "description": "<p>Expiration time of token</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>User object (student or admin)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response(Student):",
          "content": " HTTP/1.1 200 OK\n {\n  \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0OTkxNDM2ODQxNjJ9.4gVrk0o_pyYt_X5z-FfdSEFuGGFxeEsQP8QBjNqI9EA\",\n  \"expires\": 1499143684162,\n  \"user\": {\n   \"name\": \"Tarun\",\n   \"role\": \"student\",\n   \"color\": {\n     \"stroke\": \"#00A0FF\",\n     \"fill\": \"#00B20D\"\n   },\n   \"favorites\": [],\n   \"language\": \"en\",\n   \"password\": \"xxx\",\n   \"private_journal\": \"5569f4b019e0b4c9525b3c96\",\n   \"shared_journal\": \"536d30874326e55f2a22816f\",\n   \"timestamp\": 1423341000747,\n   \"_id\": \"5569f4b019e0b4c9525b3c97\"\n }\n}",
          "type": "json"
        },
        {
          "title": "Success-Response(Admin):",
          "content": "HTTP/1.1 200 OK\n{\n\t\"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0OTkxNDM2ODQxNjJ9.4gVrk0o_pyYt_X5z-FfdSEFuGGFxeEsQP8QBjNqI9EA\",\n \"expires\": 1499143684162,\n \"user\": {\n  \"name\": \"Tarun\",\n  \"role\": \"admin\",\n  \"language\": \"en\",\n  \"password\": \"xxx\",\n  \"timestamp\": 1423341000747,\n  \"_id\": \"5569f4b019e0b4c9525b3c97\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/auth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "auth/signup/",
    "title": "Signup User",
    "name": "Signup_User",
    "description": "<p>Add a new user (Admin or Student). Return the user created. Additionally, before signing up, check if the new name does not already exist.</p> <p>For security reason, call to signup for an Admin is only allowed from the server address.</p>",
    "group": "Auth",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique user id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>User role (student or admin)</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "color",
            "description": "<p>Buddy color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.stroke",
            "description": "<p>Buddy strike color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.fill",
            "description": "<p>Buddy fill color</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "favorites",
            "description": "<p>Ids list of activities in the favorite view</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "language",
            "description": "<p>Language setting of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "private_journal",
            "description": "<p>Id of the private journal on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "shared_journal",
            "description": "<p>Id of the shared journal on the server (the same for all users)</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>when the user was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": true,
            "field": "beforeSignup",
            "description": "<p>Flag to check for name validity</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response(Student):",
          "content": " HTTP/1.1 200 OK\n {\n   \"name\": \"Tarun\",\n   \"role\": \"student\",\n   \"color\": {\n     \"stroke\": \"#00A0FF\",\n     \"fill\": \"#00B20D\"\n   },\n   \"favorites\": [],\n   \"language\": \"en\",\n   \"password\": \"xxx\",\n   \"private_journal\": \"5569f4b019e0b4c9525b3c96\",\n   \"shared_journal\": \"536d30874326e55f2a22816f\",\n   \"timestamp\": 1423341000747,\n   \"_id\": \"5569f4b019e0b4c9525b3c97\"\n}",
          "type": "json"
        },
        {
          "title": "Success-Response(Before signup):",
          "content": " HTTP/1.1 200 OK\n {\n   \"exists\": false\n}",
          "type": "json"
        },
        {
          "title": "Success-Response(Admin):",
          "content": " HTTP/1.1 200 OK\n {\n   \"name\": \"Tarun\",\n   \"role\": \"admin\",\n   \"language\": \"en\",\n   \"password\": \"xxx\",\n   \"timestamp\": 1423341000747,\n   \"_id\": \"5569f4b019e0b4c9525b3c97\"\n}*",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/auth.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "api/v1/charts",
    "title": "Add chart",
    "name": "Addchart",
    "description": "<p>Add chart in the database. Returns the inserted chart.</p>",
    "group": "Charts",
    "version": "1.2.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique chart id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Chart title or name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Key that identifies the chart features</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Type of the chart (timeline, bar, pie, table)</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "hidden",
            "description": "<p>Will the chart be rendered in statistics view</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>When the chart was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>When the chart last edited on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user_id",
            "description": "<p>Unique id of the user who created the chart</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"_id\": '5d4f2375e1043a5743275a7f',\n  \"title\": 'SugarizerChart1_1565467508677',\n  \"key\": 'how-often-user-change-settings',\n  \"type\": 'bar',\n  \"hidden\": true,\n  \"created_time\": 1565467509661,\n  \"timestamp\": 1565467509661,\n  \"user_id\": '5d4f2375e1043a5743275a7c'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/charts.js",
    "groupTitle": "Charts"
  },
  {
    "type": "get",
    "url": "api/v1/charts/",
    "title": "Get all charts",
    "name": "GetAllcharts",
    "description": "<p>Retrieve all charts registered on the server for a user.</p>",
    "group": "Charts",
    "version": "1.2.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/charts\"",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "charts",
            "description": "<p>List of charts</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"charts\": [\n    {\n      \"_id\": '5d4f1f0380b17154007ac04f',\n      \"title\": 'SugarizerChart1_1565466370822',\n      \"key\": 'how-often-user-change-settings',\n      \"type\": 'bar',\n      \"hidden\": true,\n      \"created_time\": 1565466371781,\n      \"timestamp\": 1565466371781,\n      \"user_id\": '5d4f1f0380b17154007ac04c'\n    },\n    {\n      \"_id\": '5d4f1f0380b17154007ac050',\n      \"title\": 'SugarizerChart2_1565466370822',\n      \"key\": 'how-users-are-active',\n      \"type\": 'pie',\n      \"hidden\": false,\n      \"created_time\": 1565466371796,\n      \"timestamp\": 1565466371796,\n      \"user_id\": '5d4f1f0380b17154007ac04c'\n    }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/charts.js",
    "groupTitle": "Charts"
  },
  {
    "type": "get",
    "url": "api/v1/charts/:id",
    "title": "Get chart detail",
    "name": "GetChart",
    "description": "<p>Retrieve detail for a specific chart.</p>",
    "group": "Charts",
    "version": "1.2.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique chart id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Chart title or name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Key that identifies the chart features</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Type of the chart (timeline, bar, pie, table)</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "hidden",
            "description": "<p>Will the chart be rendered in statistics view</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>When the chart was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>When the chart last edited on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user_id",
            "description": "<p>Unique id of the user who created the chart</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"_id\": '5d4f1f0380b17154007ac04f',\n  \"title\": 'SugarizerChart1_1565466370822',\n  \"key\": 'how-often-user-change-settings',\n  \"type\": 'bar',\n  \"hidden\": true,\n  \"created_time\": 1565466371781,\n  \"timestamp\": 1565466371781,\n  \"user_id\": '5d4f1f0380b17154007ac04c'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/charts.js",
    "groupTitle": "Charts"
  },
  {
    "type": "delete",
    "url": "api/v1/charts/:id",
    "title": "Remove chart",
    "name": "RemoveChart",
    "description": "<p>Remove the chart by id.</p>",
    "group": "Charts",
    "version": "1.2.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique id of the chart to delete</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"5d4f2375e1043a5743275a7f\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/charts.js",
    "groupTitle": "Charts"
  },
  {
    "type": "put",
    "url": "api/v1/charts/reorder",
    "title": "Reorder Charts",
    "name": "ReorderCharts",
    "description": "<p>Update the order in which the charts are displayed.</p>",
    "group": "Charts",
    "version": "1.2.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "charts",
            "description": "<p>List of charts ids</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"charts\": [\n\t  '5d4f2375e1043a5743275a80',\n\t  '5d4f2375e1043a5743275a7f'\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/charts.js",
    "groupTitle": "Charts"
  },
  {
    "type": "put",
    "url": "api/v1/charts/:id",
    "title": "Update chart",
    "name": "UpdateChart",
    "description": "<p>Update an chart. Return the chart updated.</p>",
    "group": "Charts",
    "version": "1.2.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique chart id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Chart title or name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>Key that identifies the chart features</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Type of the chart (timeline, bar, pie, table)</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "hidden",
            "description": "<p>Will the chart be rendered in statistics view</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>When the chart was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>When the chart last edited on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user_id",
            "description": "<p>Unique id of the user who created the chart</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"_id\": '5d4f2375e1043a5743275a80',\n  \"title\": 'SugarizerChart2_new_1565467508677',\n  \"key\": 'how-users-are-active',\n  \"type\": 'pie',\n  \"hidden\": false,\n  \"created_time\": 1565467509677,\n  \"timestamp\": 1565467509724,\n  \"user_id\": '5d4f2375e1043a5743275a7c'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/charts.js",
    "groupTitle": "Charts"
  },
  {
    "type": "post",
    "url": "api/v1/classrooms",
    "title": "Add classroom",
    "name": "Addclassroom",
    "description": "<p>Add classroom in the database. Returns the inserted classroom.</p>",
    "group": "Classrooms",
    "version": "1.1.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique classroom id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>classroom name</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "color",
            "description": "<p>classroom color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.stroke",
            "description": "<p>classroom strike color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.fill",
            "description": "<p>classroom fill color</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "students",
            "description": "<p>List of students</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>when the classroom was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>when the classroom last accessed the server</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n[\n  {\n   \"_id\"         : \"592d4445cc8be9187abb284f\",\n   \"name\"        : \"Group A\",\n   \"color\": {\n     \"stroke\"\t   : \"#00A0FF\",\n     \"fill\"      : \"#00B20D\"\n   },\n   \"students\"     : [592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f,...],\n   \"created_time\"    : 6712213121,\n   \"timestamp\"       : 6712375127,\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/classrooms.js",
    "groupTitle": "Classrooms"
  },
  {
    "type": "get",
    "url": "api/v1/classrooms/",
    "title": "Get all classrooms",
    "name": "GetAllclassrooms",
    "description": "<p>Retrieve all classrooms data registered on the server.</p>",
    "group": "Classrooms",
    "version": "1.1.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/classrooms\"",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "classrooms",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\n \"classrooms\":[\n  {\n   \"_id\"         : \"592d4445cc8be9187abb284f\",\n   \"name\"        : \"Group A\",\n   \"color\": {\n     \"stroke\"\t   : \"#00A0FF\",\n     \"fill\"      : \"#00B20D\"\n   },\n   \"students\"     : [592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f, ...],\n   \"created_time\"    : 6712213121,\n   \"timestamp\"       : 6712375127,\n  },\n  ...\n ],\n \"limit\": 10,\n \"offset\": 20,\n \"total\": 200,\n \"sort\": \"+name\",\n \"links\": {\n \t\"prev_page\": \"/api/v1/classrooms?limit=10&offset=10\",\n \t\"next_page\": \"/api/v1/classrooms?limit=10&offset=30\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/classrooms.js",
    "groupTitle": "Classrooms"
  },
  {
    "type": "get",
    "url": "api/v1/classrooms/:id",
    "title": "Get classroom detail",
    "name": "GetClassroom",
    "description": "<p>Retrieve detail for a specific classroom.</p>",
    "group": "Classrooms",
    "version": "1.1.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique classroom id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>classroom name</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "color",
            "description": "<p>classroom color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.stroke",
            "description": "<p>classroom strike color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.fill",
            "description": "<p>classroom fill color</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "students",
            "description": "<p>List of students</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>when the classroom was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>when the classroom last accessed the server</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n     {\n      \"_id\"         : \"592d4445cc8be9187abb284f\",\n      \"name\"        : \"Group A\",\n      \"color\": {\n        \"stroke\"\t   : \"#00A0FF\",\n        \"fill\"      : \"#00B20D\"\n      },\n      \"students\"     : [\n    \t\t{\n      \t\t\"name\": \"Tarun\",\n      \t\t\"role\": \"student\",\n      \t\t\"color\": {\n      \t\t  \"stroke\": \"#00A0FF\",\n      \t\t  \"fill\": \"#00B20D\"\n      \t\t},\n      \t\t\"favorites\": [\n        \t\t \t\"org.olpcfrance.Abecedarium\",\n        \t\t \t\"org.sugarlabs.ChatPrototype\",\n        \t\t \t\"org.sugarlabs.Clock\",\n        \t\t \t\"org.olpcfrance.FoodChain\",\n        \t\t \t\"org.sugarlabs.GearsActivity\",\n        \t\t \t\"org.sugarlabs.GTDActivity\",\n        \t\t \t\"org.olpcfrance.Gridpaint\",\n         \t\t\"org.olpc-france.LOLActivity\",\n         \t\t\"org.sugarlabs.Markdown\",\n         \t\t\"org.sugarlabs.MazeWebActivity\",\n         \t\t\"org.sugarlabs.PaintActivity\"\n      \t\t],\n      \t\t\"language\": \"en\",\n      \t\t\"password\": \"xxx\",\n      \t\t\"private_journal\": \"5569f4b019e0b4c9525b3c96\",\n      \t\t\"shared_journal\": \"536d30874326e55f2a22816f\",\n      \t\t\"created_time\": 1423341000747,\n      \t\t\"timestamp\": 1423341001747,\n      \t\t\"_id\": \"5569f4b019e0b4c9525b3c97\"\n   \t\t},\n\t\t\t...\n\t\t],\n      \"created_time\"    : 6712213121,\n      \"timestamp\"       : 6712375127,\n     }",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/classrooms.js",
    "groupTitle": "Classrooms"
  },
  {
    "type": "delete",
    "url": "api/v1/classrooms/:id",
    "title": "Remove classroom",
    "name": "RemoveClassroom",
    "description": "<p>Remove the classroom by id.</p>",
    "group": "Classrooms",
    "version": "1.1.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique id of the classroom to delete</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"5569f4b019e0b4c9525b3c97\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/classrooms.js",
    "groupTitle": "Classrooms"
  },
  {
    "type": "put",
    "url": "api/v1/classrooms/:id",
    "title": "Update classroom",
    "name": "UpdateClassroom",
    "description": "<p>Update an classroom. Return the classroom updated.</p>",
    "group": "Classrooms",
    "version": "1.1.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique classroom id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>classroom name</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "color",
            "description": "<p>classroom color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.stroke",
            "description": "<p>classroom strike color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.fill",
            "description": "<p>classroom fill color</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "students",
            "description": "<p>List of students</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>when the classroom was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>when the classroom last accessed the server</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n     {\n      \"_id\"         : \"592d4445cc8be9187abb284f\",\n      \"name\"        : \"Group A\",\n      \"color\": {\n        \"stroke\"\t   : \"#00A0FF\",\n        \"fill\"      : \"#00B20D\"\n      },\n      \"students\"     : [\n    \t\t{\n      \t\t\"name\": \"Tarun\",\n      \t\t\"role\": \"student\",\n      \t\t\"color\": {\n      \t\t  \"stroke\": \"#00A0FF\",\n      \t\t  \"fill\": \"#00B20D\"\n      \t\t},\n      \t\t\"favorites\": [\n        \t\t \t\"org.olpcfrance.Abecedarium\",\n        \t\t \t\"org.sugarlabs.ChatPrototype\",\n        \t\t \t\"org.sugarlabs.Clock\",\n        \t\t \t\"org.olpcfrance.FoodChain\",\n        \t\t \t\"org.sugarlabs.GearsActivity\",\n        \t\t \t\"org.sugarlabs.GTDActivity\",\n        \t\t \t\"org.olpcfrance.Gridpaint\",\n         \t\t\"org.olpc-france.LOLActivity\",\n         \t\t\"org.sugarlabs.Markdown\",\n         \t\t\"org.sugarlabs.MazeWebActivity\",\n         \t\t\"org.sugarlabs.PaintActivity\"\n      \t\t],\n      \t\t\"language\": \"en\",\n      \t\t\"password\": \"xxx\",\n      \t\t\"private_journal\": \"5569f4b019e0b4c9525b3c96\",\n      \t\t\"shared_journal\": \"536d30874326e55f2a22816f\",\n      \t\t\"created_time\": 1423341000747,\n      \t\t\"timestamp\": 1423341001747,\n      \t\t\"_id\": \"5569f4b019e0b4c9525b3c97\"\n   \t\t},\n\t\t\t...\n\t\t],\n      \"created_time\"    : 6712213121,\n      \"timestamp\"       : 6712375127,\n     }",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/classrooms.js",
    "groupTitle": "Classrooms"
  },
  {
    "type": "get",
    "url": "api/",
    "title": "Get server settings",
    "name": "GetAPIInfo",
    "description": "<p>Retrieve server settings.</p>",
    "group": "Information",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "settings",
            "description": "<p>Settings object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "settings.name",
            "description": "<p>Server name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "settings.description",
            "description": "<p>Server description</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "settings.web",
            "description": "<p>Server web port</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "settings.presence",
            "description": "<p>Server presence port</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "settings.secure",
            "description": "<p>Server is secured using SSL</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "settings.version",
            "description": "<p>Server version</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "settings.options",
            "description": "<p>Server options</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "settings.options.min-password-size",
            "description": "<p>Minimum size for password</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "settings.options.statistics",
            "description": "<p>Statistics active or not</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "settings.options.cookie-age",
            "description": "<p>Expiration time for authentication token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"name\": \"Sugarizer Server\",\n  \"description\": \"Your Sugarizer Server\",\n  \"web\": \"8080\",\n  \"presence\": \"8039\",\n  \"secure\": false,\n  \"version\": \"1.2.0\",\n  \"options\":\n  {\n    \"min-password-size\": \"4\",\n    \"statistics\": true,\n    \"cookie-age\": \"172800000\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "dashboard/helper/common.js",
    "groupTitle": "Information"
  },
  {
    "type": "post",
    "url": "api/v1/journal/:jid",
    "title": "Add entry",
    "name": "AddEntry",
    "description": "<p>Add an entry in a journal. Return the entry created. If the entry already exist, update it instead. Admin has access to all journals but student can modify his/her journal only.</p>",
    "group": "Journal",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/journal/5569f4b019e0b4c9525b3c96\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "jid",
            "description": "<p>Unique id of the journal where the entry will be created</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "objectId",
            "description": "<p>Unique id of the entry in the journal</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "metadata",
            "description": "<p>Metadata of the entries, i.e. characteristics of the entry</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.title",
            "description": "<p>Title of the entry</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.title_set_by_user",
            "description": "<p>0 is the title has been changed by user, 1 if it's the original one (usually activity name)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.activity",
            "description": "<p>Activity unique ID used</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.activity_id",
            "description": "<p>ID of the activity instance</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "metadata.creation_time",
            "description": "<p>Timestamp, creation time of the entry</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "metadata.timestamp",
            "description": "<p>Timestamp, last time the instance was updated</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "metadata.file_size",
            "description": "<p>Here for Sugar compatibility, always set to 0</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.user_id",
            "description": "<p>User id of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.name",
            "description": "<p>User name of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "metadata.color",
            "description": "<p>Buddy color of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.color.stroke",
            "description": "<p>Buddy strike color of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.color.fill",
            "description": "<p>Buddy fill color of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Text of the entries, i.e. storage value of the entry. It depends of the entry type</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   \"metadata\": {\n     \"title\": \"Read me !\",\n     \"title_set_by_user\": \"0\",\n     \"activity\": \"org.sugarlabs.Markdown\",\n     \"activity_id\": \"caa97e48-d33c-470a-99e9-495ff02afe01\",\n     \"creation_time\": 1423341000747,\n     \"timestamp\": 1423341000747,\n     \"file_size\": 0,\n     \"user_id\": \"5569f4b019e0b4c9525b3c97\",\n     \"buddy_name\": \"Lionel\",\n     \"buddy_color\": {\n       \"stroke\": \"#005FE4\",\n       \"fill\": \"#FF2B34\"\n     }\n   },\n   \"text\": \"\\\"# Hello World !\\\\n\\\"\",\n   \"objectId\": \"4837240f-bf78-4d22-b936-3db96880f0a0\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/journal.js",
    "groupTitle": "Journal"
  },
  {
    "type": "get",
    "url": "api/v1/aggregate",
    "title": "Get all journals with entries",
    "name": "GetAllJournalEntries",
    "description": "<p>It will get all the journals with their entries present in the database. Private and shared can be filtered using the &quot;type&quot; query param. If the param is not specified, it will get all the journals.</p>",
    "group": "Journal",
    "version": "1.2.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/aggregate\"\n\"/api/v1/aggregate?type=shared\"\n\"/api/v1/aggregate?type=private\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "type",
            "description": "<p>Type of the journal (shared or private)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique id of the journal</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "content",
            "description": "<p>Array containing data of the entries</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "content[i]",
            "description": "<p>.metadata Metadata of the entries, i.e. characteristics of the entry</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n {\n  \"_id\": \"5946d4fc9f0e36686c50a548\",\n  \"content\": [\n   {\n    \"metadata\": {\n     \"title\": \"Read me !\",\n     \"title_set_by_user\": \"0\",\n     \"activity\": \"org.sugarlabs.Markdown\",\n     \"activity_id\": \"caa97e48-d33c-470a-99e9-495ff02afe01\",\n     \"creation_time\": 1423341000747,\n     \"timestamp\": 1423341066909,\n     \"file_size\": 0,\n     \"user_id\": \"5569f4b019e0b4c9525b3c97\",\n     \"buddy_name\": \"Sugarizer server\",\n     \"buddy_color\": {\n      \"stroke\": \"#005FE4\",\n      \"fill\": \"#FF2B34\"\n     }\n    },\n    \"objectId\": \"4837240f-bf78-4d22-b936-3db96880f0a0\",\n    \"text\" : \"\"\n   },\n   {\n    \"metadata\": {\n     \"title\": \"Physics JS Activity\",\n     \"title_set_by_user\": \"0\",\n     \"activity\": \"org.olpg-france.physicsjs\",\n     \"activity_id\": \"43708a15-f48e-49b1-85ef-da4c1419b364\",\n     \"creation_time\": 1436003632237,\n     \"timestamp\": 1436025389565,\n     \"file_size\": 0,\n     \"user_id\": \"5569f4b019e0b4c9525b3c97\",\n     \"buddy_name\": \"Lionel\",\n     \"buddy_color\": {\n      \"stroke\": \"#00A0FF\",\n      \"fill\": \"#F8E800\"\n     }\n    },\n    \"objectId\": \"2acbcd69-aa14-4273-8a9f-47642b41ad9d\",\n    \"text\" : \"\"\n   },\n   ...\n  ],\n  \"shared\": true\n },\n {\n  \"_id\": \"5954089e088a9fd957734e46\",\n  \"content\": [\n   {\n    \"metadata\" : {\n     \"title\" : \"Paint Activity\",\n     \"title_set_by_user\" : \"0\",\n     \"activity\" : \"org.olpcfrance.PaintActivity\",\n     \"activity_id\" : \"c3863442-f524-4d17-868a-9eed8fb467e5\",\n     \"creation_time\" : 1522441628767,\n     \"timestamp\" : 1522441631568,\n     \"file_size\" : 0,\n     \"buddy_name\" : \"Local\",\n     \"buddy_color\" : {\n      \"stroke\" : \"#00B20D\",\n      \"fill\" : \"#00EA11\"\n      },\n      \"textsize\" : 28687,\n      \"user_id\" : \"5a9d84682feba60e001ee997\"\n    },\n    \"objectId\" : \"e02da731-690b-4347-8ae2-e8e88a692999\",\n    \"text\" : \"\"\n   }\n  ],\n  \"shared\": false\n }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/journal.js",
    "groupTitle": "Journal"
  },
  {
    "type": "get",
    "url": "api/v1/journal",
    "title": "Get all journals",
    "name": "GetAllJournals",
    "description": "<p>It will get all the journals present in the database. Private and shared can be filtered using the &quot;type&quot; query param. Admin can access all journals but student can access only shared and his/her private journal.</p>",
    "group": "Journal",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/journal\"\n\"/api/v1/journal?type=shared\"\n\"/api/v1/journal?type=private\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "type",
            "description": "<p>Type of the journal (shared or private)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique id of the journal</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "type",
            "description": "<p>Type of the journal</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n {\n  \"_id\": \"5946d4fc9f0e36686c50a548\",\n  \"shared\": true\n },\n {\n  \"_id\": \"5954089e088a9fd957734e46\",\n  \"shared\": false\n }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/journal.js",
    "groupTitle": "Journal"
  },
  {
    "type": "get",
    "url": "api/v1/journal/:jid",
    "title": "Get journal entries",
    "name": "GetJournalContent",
    "description": "<p>Retrieve full content of a journal. Result include both metadata and text. Admin has access to all journals but student can access entries of his/her journal only.</p>",
    "group": "Journal",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/journal/5569f4b019e0b4c9525b3c96\"\n\"/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown\"\n\"/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&uid=5569f4b019e0b4c9525b3c97\"\n\"/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&sort=-timestamp\"\n\"/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&sort=-timestamp&offset=15&limit=10\"\n\"/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&sort=-timestamp&fields=text,metadata\"\n\"/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&stime=712786812367\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "jid",
            "description": "<p>Unique id of the journal to retrieve</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "aid",
            "description": "<p>filter on activity id <code>e.g. aid=org.sugarlabs.Markdown</code></p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "oid",
            "description": "<p>filter on object id of the activity <code>e.g. oid=4837240f-bf78-4d22-b936-3db96880f0a0</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "uid",
            "description": "<p>filter on user id <code>e.g. uid=5569f4b019e0b4c9525b3c97</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "fields",
            "defaultValue": "metadata",
            "description": "<p>field limiting <code>e.g. fields=text,metadata </code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "+timestamp",
            "description": "<p>Order of results <code>e.g. sort=-timestamp or sort=-creation_time</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "title",
            "description": "<p>entry title contains the text (case insensitive) <code>e.g. title=cTIviTy</code></p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "stime",
            "description": "<p>results starting from stime in ms <code>e.g. stime=712786812367</code></p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "favorite",
            "description": "<p>filter on favorite field <code>e.g. favorite=true or favorite=false</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "offset",
            "defaultValue": "0",
            "description": "<p>Offset in results <code>e.g. offset=15</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "limit",
            "defaultValue": "10",
            "description": "<p>Limit results <code>e.g. limit=5</code>*</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "entries",
            "description": "<p>List of all entries in the journal.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Offset in journal entries</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "limit",
            "description": "<p>Limit on number of results</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>total number of results</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "link",
            "description": "<p>pagination links</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>sugarizer version</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n  \"entries\" : [\n   {\n     \"metadata\": {\n       \"title\": \"Read me !\",\n       \"title_set_by_user\": \"0\",\n       \"activity\": \"org.sugarlabs.Markdown\",\n       \"activity_id\": \"caa97e48-d33c-470a-99e9-495ff02afe01\",\n       \"creation_time\": 1423341000747,\n       \"timestamp\": 1423341066909,\n       \"file_size\": 0,\n       \"user_id\": \"5569f4b019e0b4c9525b3c97\",\n       \"buddy_name\": \"Sugarizer server\",\n       \"buddy_color\": {\n         \"stroke\": \"#005FE4\",\n         \"fill\": \"#FF2B34\"\n       }\n     },\n     \"objectId\": \"4837240f-bf78-4d22-b936-3db96880f0a0\",\n     \"journalId\": \"596bfc2e16d5147938518284\"\n   },\n   {\n     \"metadata\": {\n       \"title\": \"Physics JS Activity\",\n       \"title_set_by_user\": \"0\",\n       \"activity\": \"org.olpg-france.physicsjs\",\n       \"activity_id\": \"43708a15-f48e-49b1-85ef-da4c1419b364\",\n       \"creation_time\": 1436003632237,\n       \"timestamp\": 1436025389565,\n       \"file_size\": 0,\n       \"user_id\": \"5569f4b019e0b4c9525b3c97\",\n       \"buddy_name\": \"Lionel\",\n       \"buddy_color\": {\n         \"stroke\": \"#00A0FF\",\n         \"fill\": \"#F8E800\"\n       }\n     },\n     \"objectId\": \"2acbcd69-aa14-4273-8a9f-47642b41ad9d\",\n     \"journalId\": \"596bfc2e16d5147938518284\"\n   },\n   ...\n ],\n \"limit\": 10,\n \"offset\": 20,\n \"total\": 200,\n \"links\": {\n \t\"prev_page\": \"/api/v1/journal/5569f4b019e0b4c9525b3c96?limit=10&offset=10\",\n \t\"next_page\": \"/api/v1/journal/5569f4b019e0b4c9525b3c96?limit=10&offset=30\"\n },\n \"version\": 1.2.0-alpha\n}",
          "type": "Json"
        }
      ]
    },
    "filename": "api/controller/journal.js",
    "groupTitle": "Journal"
  },
  {
    "type": "delete",
    "url": "api/v1/journal/:jid",
    "title": "Remove entry/journal",
    "name": "RemoveEntryJournal",
    "description": "<p>Remove an entry in a journal or the complete journal. Return the id of the entry or journal. Admin has access to all journals but student can modify his/her journal only.</p>",
    "group": "Journal",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/journal?type=full\"\n\"/api/v1/journal?type=partial&oid=d3c7cfc2-8a02-4ce8-9306-073814a2024e\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "jid",
            "description": "<p>Unique id of the journal to delete</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "oid",
            "description": "<p>Unique id of the entry to delete when type is set to partial</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "type",
            "defaultValue": "partial",
            "description": "<p><code>type=full</code> when to delete the entire journal else <code>type=partial</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "objectId",
            "description": "<p>Unique id of the entry removed</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "jid",
            "description": "<p>Unique id of the journal removed</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response-Journal:",
          "content": "HTTP/1.1 200 OK\n{\n \"jid\": \"5569f4b019e0b4c9525b3c97\"\n}",
          "type": "json"
        },
        {
          "title": "Success-Response-Entry:",
          "content": "HTTP/1.1 200 OK\n{\n \"objectId\": \"d3c7cfc2-8a02-4ce8-9306-073814a2024e\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/journal.js",
    "groupTitle": "Journal"
  },
  {
    "type": "put",
    "url": "api/v1/journal/:jid?oid=:oid",
    "title": "Update entry",
    "name": "UpdateEntry",
    "description": "<p>Update an entry in a journal. Return the entry updated. If the entry don't exist, create a new one instead. Admin has access to all journals but student can modify his/her journal only.</p>",
    "group": "Journal",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/journal/5569f4b019e0b4c9525b3c96?oid=d3c7cfc2-8a02-4ce8-9306-073814a2024e\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "jid",
            "description": "<p>Unique id of the journal to update</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "oid",
            "description": "<p>Unique id of the entry to update</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "objectId",
            "description": "<p>Unique id of the entry in the journal</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "metadata",
            "description": "<p>Metadata of the entries, i.e. characteristics of the entry</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.title",
            "description": "<p>Title of the entry</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.title_set_by_user",
            "description": "<p>0 is the title has been changed by user, 1 if it's the original one (usually activity name)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.activity",
            "description": "<p>Activity unique ID used</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.activity_id",
            "description": "<p>ID of the activity instance</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "metadata.creation_time",
            "description": "<p>Timestamp, creation time of the entry</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "metadata.timestamp",
            "description": "<p>Timestamp, last time the instance was updated</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "metadata.file_size",
            "description": "<p>Here for Sugar compatibility, always set to 0</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.user_id",
            "description": "<p>User id of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.name",
            "description": "<p>User name of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "metadata.color",
            "description": "<p>Buddy color of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.color.stroke",
            "description": "<p>Buddy strike color of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "metadata.color.fill",
            "description": "<p>Buddy fill color of the entry creator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Text of the entries, i.e. storage value of the entry. It depends of the entry type</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   \"metadata\": {\n     \"title\": \"Read me now !\",\n     \"title_set_by_user\": \"0\",\n     \"activity\": \"org.sugarlabs.Markdown\",\n     \"activity_id\": \"caa97e48-d33c-470a-99e9-495ff02afe01\",\n     \"creation_time\": 1423341000747,\n     \"timestamp\": 1423341066120,\n     \"file_size\": 0,\n     \"user_id\": \"5569f4b019e0b4c9525b3c97\",\n     \"buddy_name\": \"Lionel\",\n     \"buddy_color\": {\n       \"stroke\": \"#005FE4\",\n       \"fill\": \"#FF2B34\"\n     }\n   },\n   \"text\": \"\\\"# Hello Sugarizer user !\\\\n\\\\nWelcome to the Sugarizer server cloud storage. You could put everything that you need to share.\\\\n\\\\n\\\"\",\n   \"objectId\": \"4837240f-bf78-4d22-b936-3db96880f0a0\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/journal.js",
    "groupTitle": "Journal"
  },
  {
    "type": "post",
    "url": "api/v1/stats",
    "title": "Add Stats",
    "name": "AddStats",
    "description": "<p>Add stats in the database. Returns all the inserted stats.</p>",
    "group": "Stats",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique user id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user_agent",
            "description": "<p>User agent</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user_ip",
            "description": "<p>User ip</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "client_type",
            "description": "<p>Type of client (Mobile/Web)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>where the action is being performed</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "event_object",
            "description": "<p>where the action is being performed</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "event_action",
            "description": "<p>type of action</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "event_label",
            "description": "<p>label of the event</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "event_value",
            "description": "<p>value of the event</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>when the stats was created by the user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n[\n  {\n   \"user_id\"         : \"592d4445cc8be9187abb284f\",\n   \"user_agent\"      : \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36\",\n   \"user_ip\"         : \"122.34.42.165\",\n   \"client_type\"     : \"mobile\",\n   \"event_source\"    : \"sugarizer\",\n   \"event_object\"    : \"home_view\",\n   \"event_action\"    : \"search\",\n   \"event_label\"     : \"q=stopwatch\",\n   \"event_value\"     : null,\n   \"timestamp\"       : 6712375127,\n   \"_id\"             : \"59541db5a297accf5b9003da\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "get",
    "url": "api/v1/stats/",
    "title": "Get all stats",
    "name": "GetAllStats",
    "description": "<p>Retrieve all stats data registered on the server.</p>",
    "group": "Stats",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>Users unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Users access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "uid",
            "description": "<p>ID of the user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "event_source",
            "description": "<p>Name of the Event Source</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "event_object",
            "description": "<p>Name of the Event Object</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "event_action",
            "description": "<p>Name of the Event Action</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "client_type",
            "description": "<p>Client type <code>e.g. client_type=App or client_type=Web App</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "+timestamp",
            "description": "<p>Order of results <code>e.g. sort=-action or sort=+timestamp</code></p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/stats\"\n\"/api/v1/stats?user_id=592d4445cc8be9187abb284f\"\n\"/api/v1/stats?event_object=home_view\"\n\"/api/v1/stats?user_id=592d4445cc8be9187abb284f&sort=-timestamp\"",
        "type": "json"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "stats",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n {\n  \"user_id\"         : \"592d4445cc8be9187abb284f\",\n  \"user_agent\"      : \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36\",\n  \"user_ip\"         : \"122.34.42.165\",\n  \"client_type\"     : \"App\",\n  \"event_source\"    : \"sugarizer\",\n  \"event_object\"    : \"home_view\",\n  \"event_action\"    : \"search\",\n  \"event_label\"     : \"q=stopwatch\",\n  \"event_value\"     : null,\n  \"timestamp\"       : 6712375127,\n  \"_id\"             : \"59541db5a297accf5b9003da\"\n }\n ...\n]",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "delete",
    "url": "api/v1/stats",
    "title": "Remove stats",
    "name": "RemoveStats",
    "description": "<p>Remove all the stats for a particular user.</p>",
    "group": "Stats",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "uid",
            "description": "<p>Unique id of the user to delete stats</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"user_id\": \"5569f4b019e0b4c9525b3c97\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/stats.js",
    "groupTitle": "Stats"
  },
  {
    "type": "post",
    "url": "api/v1/users/",
    "title": "Add user",
    "name": "AddUser",
    "description": "<p>Add a new user. Return the user created. Only admin can add another admin, student or teacher.</p>",
    "group": "Users",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique user id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Unique user name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>User role (admin, student or teacher)</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "color",
            "description": "<p>Buddy color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.stroke",
            "description": "<p>Buddy strike color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.fill",
            "description": "<p>Buddy fill color</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "favorites",
            "description": "<p>Ids list of activities in the favorite view</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "language",
            "description": "<p>Language setting of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "private_journal",
            "description": "<p>Id of the private journal on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "shared_journal",
            "description": "<p>Id of the shared journal on the server (the same for all users)</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>when the user was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>when the user last accessed the server</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   \"name\": \"Tarun\",\n   \"role\": \"student\",\n   \"color\": {\n     \"stroke\": \"#00A0FF\",\n     \"fill\": \"#00B20D\"\n   },\n   \"favorites\": [\n      \"org.olpcfrance.Abecedarium\",\n      \"org.sugarlabs.ChatPrototype\",\n      \"org.sugarlabs.Clock\",\n      \"org.olpcfrance.FoodChain\",\n      \"org.sugarlabs.GearsActivity\",\n      \"org.sugarlabs.GTDActivity\",\n      \"org.olpcfrance.Gridpaint\",\n      \"org.olpc-france.LOLActivity\",\n      \"org.sugarlabs.Markdown\",\n      \"org.sugarlabs.MazeWebActivity\",\n      \"org.sugarlabs.PaintActivity\"\n   ],\n   \"language\": \"en\",\n   \"password\": \"xxx\",\n   \"private_journal\": \"5569f4b019e0b4c9525b3c96\",\n   \"shared_journal\": \"536d30874326e55f2a22816f\",\n   \"created_time\": 1423341000747,\n   \"timestamp\": 1423341000747,\n   \"_id\": \"5569f4b019e0b4c9525b3c97\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "get",
    "url": "api/v1/users/",
    "title": "Get all users",
    "name": "GetAllUsers",
    "description": "<p>Retrieve all users registered on the server. Query params can be mixed and match to achieve suitable results.</p>",
    "group": "Users",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "\"/api/v1/users\"\n\"/api/v1/users?name=tarun\"\n\"/api/v1/users?language=fr&sort=+name\"\n\"/api/v1/users?sort=+name&limit=5&offset=20\"",
        "type": "json"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>Display name of the activity <code>e.g. name=paint</code></p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "language",
            "description": "<p>To get users of specific language <code>e.g. language=fr</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "role",
            "defaultValue": "student",
            "description": "<p>To filter users based on role <code>e.g. role=admin or role= student</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "q",
            "description": "<p>Fuzzy Search <code>e.g. q=tar</code> to search user with name &quot;Tarun&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "stime",
            "description": "<p>results starting from stime in ms <code>e.g. stime=712786812367</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sort",
            "defaultValue": "+name",
            "description": "<p>Order of results <code>e.g. sort=-name or sort=+role</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "offset",
            "defaultValue": "0",
            "description": "<p>Offset in results <code>e.g. offset=15</code></p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "limit",
            "defaultValue": "10",
            "description": "<p>Limit results <code>e.g. limit=5</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "users",
            "description": "<p>List of users</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "offset",
            "description": "<p>Offset in users list</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "limit",
            "description": "<p>Limit on number of results</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "total",
            "description": "<p>total number of results</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "sort",
            "description": "<p>information about sorting used in the results</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "link",
            "description": "<p>pagination links</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n \"users\":[\n   {\n     \"name\": \"Tarun Singhal\",\n     \"role\": \"student\",\n     \"color\": {\n       \"stroke\": \"#005FE4\",\n       \"fill\": \"#FF2B34\"\n     },\n     \"favorites\": [\n       \"org.sugarlabs.GearsActivity\",\n       \"org.sugarlabs.MazeWebActivity\",\n     ],\n     \"language\": \"en\",\n     \"password\": \"xxx\",\n     \"private_journal\": \"5569f4b019e0b4c9525b3c96\",\n     \"shared_journal\": \"536d30874326e55f2a22816f\",\n     \"created_time\": 1423341000747,\n     \"timestamp\": 1423341000747,\n     \"_id\": \"536dd30aadcd557f2a9d648b\"\n  },\n  ...\n ],\n \"limit\": 10,\n \"offset\": 20,\n \"total\": 200,\n \"sort\": \"+name\",\n \"links\": {\n \t\"prev_page\": \"/api/v1/users?limit=10&offset=10\",\n \t\"next_page\": \"/api/v1/users?limit=10&offset=30\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "get",
    "url": "api/v1/users/:id",
    "title": "Get user detail",
    "name": "GetUser",
    "description": "<p>Retrieve detail for a specific user.</p>",
    "group": "Users",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique user id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Unique user name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>User role (student or admin)</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "color",
            "description": "<p>Buddy color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.stroke",
            "description": "<p>Buddy strike color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.fill",
            "description": "<p>Buddy fill color</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "favorites",
            "description": "<p>Ids list of activities in the favorite view</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "language",
            "description": "<p>Language setting of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "private_journal",
            "description": "<p>Id of the private journal on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "shared_journal",
            "description": "<p>Id of the shared journal on the server (the same for all users)</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>when the user was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>when the user last accessed the server</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   \"name\": \"Tarun\",\n   \"role\": \"student\",\n   \"color\": {\n     \"stroke\": \"#00A0FF\",\n     \"fill\": \"#00B20D\"\n   },\n   \"favorites\": [\n      \"org.olpcfrance.Abecedarium\",\n      \"org.sugarlabs.ChatPrototype\",\n      \"org.sugarlabs.Clock\",\n      \"org.olpcfrance.FoodChain\",\n      \"org.sugarlabs.GearsActivity\",\n      \"org.sugarlabs.GTDActivity\",\n      \"org.olpcfrance.Gridpaint\",\n      \"org.olpc-france.LOLActivity\",\n      \"org.sugarlabs.Markdown\",\n      \"org.sugarlabs.MazeWebActivity\",\n      \"org.sugarlabs.PaintActivity\"\n   ],\n   \"language\": \"en\",\n   \"password\": \"xxx\",\n   \"private_journal\": \"5569f4b019e0b4c9525b3c96\",\n   \"shared_journal\": \"536d30874326e55f2a22816f\",\n   \"created_time\": 1423341000747,\n   \"timestamp\": 1423341000747,\n   \"_id\": \"5569f4b019e0b4c9525b3c97\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "delete",
    "url": "api/v1/users/:uid",
    "title": "Remove user",
    "name": "RemoveUser",
    "description": "<p>Remove an user from the database. Only admin can remove other users. Self removal can also be done.</p>",
    "group": "Users",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "uid",
            "description": "<p>Unique id of the user to delete</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"user_id\": \"5569f4b019e0b4c9525b3c97\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/users.js",
    "groupTitle": "Users"
  },
  {
    "type": "put",
    "url": "api/v1/users/",
    "title": "Update user",
    "name": "UpdateUser",
    "description": "<p>Update an user. Return the user updated. Student or teacher can update only his/her details but admin can update anyone.</p>",
    "group": "Users",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-key",
            "description": "<p>User unique id.</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>User access token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Unique user id</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Unique user name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>User role (admin, student or teacher)</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "color",
            "description": "<p>Buddy color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.stroke",
            "description": "<p>Buddy strike color</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "color.fill",
            "description": "<p>Buddy fill color</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "favorites",
            "description": "<p>Ids list of activities in the favorite view</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "language",
            "description": "<p>Language setting of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "private_journal",
            "description": "<p>Id of the private journal on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "shared_journal",
            "description": "<p>Id of the shared journal on the server (the same for all users)</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "created_time",
            "description": "<p>when the user was created on the server</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>when the user last accessed the server</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n {\n   \"name\": \"Tarun\",\n   \"role\": \"student\",\n   \"color\": {\n     \"stroke\": \"#00A0FF\",\n     \"fill\": \"#00B20D\"\n   },\n   \"favorites\": [\n      \"org.olpcfrance.Abecedarium\",\n      \"org.sugarlabs.ChatPrototype\",\n      \"org.sugarlabs.Clock\",\n      \"org.olpcfrance.FoodChain\",\n      \"org.sugarlabs.GearsActivity\",\n      \"org.sugarlabs.GTDActivity\",\n      \"org.olpcfrance.Gridpaint\",\n      \"org.olpc-france.LOLActivity\",\n      \"org.sugarlabs.Markdown\",\n      \"org.sugarlabs.MazeWebActivity\",\n      \"org.sugarlabs.PaintActivity\"\n   ],\n   \"language\": \"en\",\n   \"password\": \"xxx\",\n   \"private_journal\": \"5569f4b019e0b4c9525b3c96\",\n   \"shared_journal\": \"536d30874326e55f2a22816f\",\n   \"created_time\": 1423341000747,\n   \"timestamp\": 1423341001747,\n   \"_id\": \"5569f4b019e0b4c9525b3c97\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "api/controller/users.js",
    "groupTitle": "Users"
  }
] });
