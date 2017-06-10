// uses "switch" as intent

var https = require("https");

var garageID = "Your Photon ID Here";
var studioID = "Your Photon ID Here";
var insideStudioID = "Your Photon ID Here";
var backDeckID = "Your Photon ID Here";
var frontDeckID = "Your Photon ID Here";
var frontDoorID = "Your Photon ID Here";
var barnFrontID = "Your Photon ID Here";
var barnBackID = "Your Photon ID Here";
var barnInteriorID = "Your Photon ID Here";
var sconcesID = "Your Photon ID Here";
var patioID = "Your Photon ID Here";

var accessToken = "Your Particle Access Token Here";


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

    //     *** Uncomment next if statement and populate with your skill's application ID to
    //     *** prevent someone else from configuring a skill that sends requests to this function.

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};


//Called when the session starts.
 function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}


//Called when the user invokes the skill without specifying what they want.
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback);
}

//Called when the user specifies an intent for this skill.
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if ("switch" == intentName) {
        handleSwitchIntent(intent, session, callback);
    } else {
         throw "Invalid intent";
    }
}

//Called when the user ends the session. Is not called when the skill returns shouldEndSession=true.
function onSessionEnded(sessionEndedRequest, session) {
    // add any session ended logic here
}


// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "What lights do you want me to turn on or turn off?";

    var reprompt = "Do you want me to turn on or turn off lights?";

    var header = "Switch lights";

    var shouldEndSession = false;

    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    };

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));

}


function handleSwitchIntent(intent, session, callback) {
    var cardTitle = intent.name;
    var sessionAttributes = {};
    var speechOutput = "I will switch the garage";
    var repromptText = "Do you want to switch another light?";
    var header = "garage";
    var shouldEndSession = false;
    var particleDevice = intent.slots.location.value;

switch(particleDevice) {
    case "garage":
        photonID = garageID;
        break;
    case "studio":
        photonID = studioID;
        break;
    case "inside studio":
        photonID = insideStudioID;
        break;
    case "back deck":
        photonID = backDeckID;
        break;
    case "front deck":
        photonID = frontDeckID;
        break;
    case "front door":
        photonID = frontDoorID;
        break;
    case "barn front":
        photonID = barnFrontID;
        break;
    case "barn back":
        photonID = barnBackID;
        break;
    case "barn interior":
        photonID = barnInteriorID;
        break;
    case "sconces":
        photonID = sconcesID;
        break;
    case "patio":
        photonID = patioID;
        break;
    default:
        photonID = patioID;
    }

    if (intent.slots.state.value == "on") setOnOff = 1;
    else if (intent.slots.state.value == "off") setOnOff = 0;

    doParticlePOST(photonID, setOnOff, function(resp) {
        var json = JSON.parse(resp);
        var result = json.return_value;
        speechOutput = result;
        callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
    });
}


// For future use to request status
function handleStatusIntent(intent, session, callback) {
   doParticleGET(photonID, function(resp) {
        var json = JSON.parse(resp);
        var result = json.result;
        if (result === 1) speechOutput = "That light is On";
        else speechOutput = "That light is Off";
        callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
    });
}


// ------- Helper functions to build responses for Alexa -------
// ------- These are copied directly from Amazon examples ------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}



// ------- Particle Cloud POST and GET functions -------

// Particle POST function
// ---------------------
function doParticlePOST(photonID, setOnOff, callback) {
    // Set up Particle HTTPS request parameters
    var options = {
        hostname: "api.particle.io",
        port: 443,
        path: "/v1/devices/" + photonID + "/switchLight/",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*.*'
        }
    };

    var postData = "access_token=" + accessToken "&params=" + setOnOff;

    // Set up HTTPS POST to particle Cloud, and handle returned data, returning 
    // that data back to calling function
    var postRequest = https.request(options, function(res) {
        
        var body = "";
        
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            
            body += chunk;
        });
        
        res.on('end', function () {
            callback(body);
        });
    });

    postRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // Do the HTTPS POST
    postRequest.write(postData);
    postRequest.end();
}


// Particle GET function
// --------------------
function doParticleGET(photonID, callback) {
    // Set up Particle HTTPS request parameters
    var options = {
        hostname: "api.particle.io",
        port: 443,
        path: "/v1/devices/" + photonID + "/lightState?access_token=" + accessToken,
        method: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*.*'
        }
    };

    // Set up HTTPS POST to particle Cloud, and handle returned data, returning 
    // that data back to calling function
        var getRequest = https.request(options, function(res) {
        var body = "";
        console.log(res);
        
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body += chunk;
        });
        
        res.on('end', function () {
            callback(body);
        });
    });

    getRequest.end();
    getRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // Do the HTTPS GET
    getRequest.write();

}