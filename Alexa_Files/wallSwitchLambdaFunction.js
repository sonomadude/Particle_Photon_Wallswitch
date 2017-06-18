// Somehow enables Amazon syntax checker to work properly (did not without this)
"use strict";


// Required for HTTPS to work
var https = require("https");


// Variables
var garageID = "Your Photon ID here";
var studioID = "Your Photon ID here";
var insideStudioID = "Your Photon ID here";
var backDeckID = "Your Photon ID here";
var frontDeckID = "Your Photon ID here";
var frontDoorID = "Your Photon ID here";
var barnFrontID = "Your Photon ID here";
var barnBackID = "Your Photon ID here";
var barnInteriorID = "Your Photon ID here";
var sconcesID = "Your Photon ID here";
var patioID = "Your Photon ID here";
var accessToken = "Your Particle Access Token here";
var gateID = "Your Photon ID here";
var photonID = "";
var header = "Initial Value";


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
// This is copied unchanged from Amazon examples

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


// Decode which handler to call based on intent
    if ("turn" == intentName) {
        handleTurnIntent(intent, session, callback);
    } else if ("gate" == intentName) {
        handleGateIntent(intent, session, callback);
    } else if ("done" == intentName) {
        handleExitIntent(intent, session, callback);
    } else if ("AMAZON.CancelIntent" == intentName) {
        handleExitIntent(intent, session, callback);
    } else if ("AMAZON.HelpIntent" == intentName) {
        handleHelpIntent(intent, session, callback);
    } else if ("AMAZON.StopIntent" == intentName) {
        handleExitIntent(intent, session, callback);
    } else {
         throw "Invalid intent";
    }
}


//Called when the user ends the session. Is not called when the skill returns shouldEndSession=true.
function onSessionEnded(sessionEndedRequest, session) {
    // add any session ended logic here
}


// ------- Skill specific logic -------


// Handler if speaker just says "Alexa Ranch"
function getWelcomeResponse(callback) {
    var speechOutput = "Welcome, I can turn on or turn off lights in certain locations, and open, close of keep open the gate, say alexa ranch help for more information."; 
    var reprompt = "Do you want me to turn on or turn off lights? Close, open or keep open the gate?";
    var header = "Welcome Message";
    var shouldEndSession = false;
    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    };
   callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
}


// Handler for fetching help
function handleHelpIntent(intent, session, callback) {
        var cardTitle = intent.name;
        var sessionAttributes = {};
        var repromptText = "";
        var header = "Help";
        var speechOutput = "You can ask Ranch to turn on or off a switch location. You can ask Ranch for gate to be opened, closed, or kept open. . ." +
        " The lights I control include the garage, studio, inside studio, back deck, front deck, front door, barn back, barn interior, sconces" +
        " and patio. . .  You can say, alexa, ask ranch to turn on the location, or, alexa, ask ranch for the gate to be opened";
        var shouldEndSession = "false";
        callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
}


// Handler for ending session
function handleExitIntent(intent, session, callback) {
    var cardTitle = intent.name;
    var sessionAttributes = {};
    var repromptText = "";
    var header = "cancel_stop";
    var reprompt = "";
    var speechOutput = "Okay!";
    var shouldEndSession = "true";
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
}


// Handler for a request for lights to be turned on or off
function handleGateIntent(intent, session, callback) {
        var cardTitle = intent.name;
        var sessionAttributes = {};
        var repromptText = "Do you want to control the gate?";
        header = "gate";
        var speechOutput = "gate speech output setup";
        var openClose = "0";
        var value = intent.slots.openclose.value;

        if ("opened" == value) {
            openClose = "2";
        } else if ("closed" == value) {
            openClose = "1";
        } else if ("kept open" == value) {
            openClose = "3";
        } else {
            speechOutput = "I did not understand what you wanted me to do"; 
        }    
    
        var device = "gate";
        photonID - gateID;

// Do the Particle POST, and reply. Pass ID, parameters to be sent, and which device - switch or gate
    doParticlePOST(photonID, openClose, device, function(resp) {
        var json = JSON.parse(resp);
        var result = json.return_value;
        if (result == "20" || result == "21") speechOutput = "The " + header + " will be open for 30 seconds";
        else if (result == "10") speechOutput = "The " + header + " is closing or already closed";
        else if (result == "31") speechOutput = "The " + header + " will be kept open";
        else speechOutput = "There was a communication error with the gate";        
        var shouldEndSession = true;
        callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
    });
}


// Handler for a request for lights to be turned on or off
function handleTurnIntent(intent, session, callback) {
    var cardTitle = intent.name;
    var sessionAttributes = {};
    var speechOutput = "I will switch the garage";
    var repromptText = "Do you want to switch another light?";
    var shouldEndSession = false;
    var particleDevice = intent.slots.location.value;
    var setOnOff = "0";

// Determine which switch location to turn on or off 
        switch(particleDevice) {
        case 'garage':
            photonID = garageID;
            header = "Garage";
        break;
        case 'studio':
            photonID = studioID;
            header = "Studio";
            break;
        case "inside studio":
            photonID = insideStudioID;
            header = "Inside Studio";
            break;
        case "back deck":
            photonID = backDeckID;
            header = "Back Deck";
            break;
        case "front deck":
            photonID = frontDeckID;
            header = "front deck";
            break;
        case "front door":
            photonID = frontDoorID;
            header = "front door";
            break;
        case "barn front":
            photonID = barnFrontID;
            header = "barn front";
            break;
        case "barn back":
            photonID = barnBackID;
            header = "barn back";
            break;
        case "barn interior":
            photonID = barnInteriorID;
            header = "barn interior";
            break;
        case "sconces":
            photonID = sconcesID;
            header = "sconces";
            break;
        case 'patio':
            photonID = patioID;
            header = "patio";
            break;
        default:
            speechOutput = "I do not know that light switch location";
            callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
        }
        var device = "switch";

// Set value for parameters of POST or detect error
        if (intent.slots.state.value == "on" || intent.slots.state.value == "off" ) {
            if (intent.slots.state.value == "on") setOnOff = "1";
            else if (intent.slots.state.value == "off") setOnOff = "0";
        } else {
            speechOutput = "I do not understand what you want me to do";
            callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
        }

// Do the Particle POST, send speech back to ALexa. Pass ID, parameters to be sent, and which device - switch or gate
        doParticlePOST(photonID, setOnOff, device, function(resp) {
            var json = JSON.parse(resp);
            var result = json.return_value;
            if (result == "1") speechOutput = "The " + header + " light is on";
            else if (result == "0") speechOutput = "The  " + header + " light is off";
            else speechOutput = "There was a communication error with that device";        
            callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
    });
}


// For future use to request status via HTTPS GET
function handleStatusIntent(intent, session, callback) {
   doParticleGET(photonID, function(resp) {
        var json = JSON.parse(resp);
        var result = json.result;
        var repromptText = "";
        var speechOutput = "";
        if (result === 1) speechOutput = "That light is On";
        else speechOutput = "That light is Off";
        var shouldEndSession = "false";
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
function doParticlePOST(photonID, parameters, device, callback) {
    var particleFunction ="";
    if (device == "gate") particleFunction = "/gateAction/";
    else particleFunction = "/switchLight/";

// Set up Particle HTTPS request parameters
    var options = {
        hostname: "api.particle.io",
        port: 443,
        path: "/v1/devices/" + photonID + particleFunction,
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*.*'
        }
    };
    var postData = "access_token=" + accessToken + "&params=" + parameters;

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


// Particle GET function (not used yet)
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
