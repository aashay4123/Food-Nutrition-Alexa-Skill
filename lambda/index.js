/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Welcome, you can say describe followed by the name of food item. Which would you like to try?";

    const repromptText =
      "you can say tell me about followed by the name of food item.";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

function searchFood(fDb, foodName) {
  foodName = foodName.toLowerCase();
  foodName = foodName.replace(/,/g, "");
  var foodWords = foodName.split(/\s+/);
  var regExps = [];
  var searchResult = [];

  foodWords.forEach(function (sWord) {
    regExps.push(new RegExp(`^${sWord}(es|s)?\\b`));
    regExps.push(new RegExp(`^${sWord}`));
  });

  fDb.forEach(function (item) {
    var match = 1;
    var fullName = item[0];
    var cmpWeight = 0;

    foodWords.forEach(function (sWord) {
      if (!fullName.match(sWord)) {
        match = 0;
      }
    });

    if (match == 0) {
      return;
    }

    regExps.forEach(function (rExp) {
      if (fullName.match(rExp)) {
        cmpWeight += 10;
      }
    });

    if (fullName.split(/\s+/).length == foodWords.length) {
      cmpWeight += 10;
    }

    searchResult.push([item, cmpWeight]);
  });

  var finalResult = searchResult.filter(function (x) {
    return x[1] >= 10;
  });
  if (finalResult.length == 0) {
    finalResult = searchResult;
  } else {
    finalResult.sort(function (a, b) {
      return b[1] - a[1];
    });
  }

  finalResult = finalResult.map(function (x) {
    return x[0];
  });

  return finalResult;
}

const GetNutritionIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GetNutritionIntent"
    );
  },
  handle(handlerInput) {
    var MAX_RESPONSES = 3;
    var MAX_FOOD_ITEMS = 10;
    const FoodItem =
      handlerInput.requestEnvelope.request.intent.slots.FoodItem.value;
    let speakOutput = "Hello World!";
    let cardContent = "";
    let cardTitle = `Nutrition Lookup results for: ${slots.FoodItem}`;
    if (FoodItem === undefined) {
      speakOutput =
        "Looks like you forgot to mention food name. Which food calorie information you would like to know? ";
      let repromptText =
        "For example, you can say, how many calories are in butter salted. ";

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptText)
        .getResponse();
    }

    const foodDb = require("./food_db.json");
    const results = searchFood(foodDb, FoodItem);

    if (results.length == 0) {
      speakOutput = `Could not find any food item for ${FoodItem}. Please try different food item. `;
      cardContent += speakOutput;
    } else {
      results.slice(0, MAX_RESPONSES).forEach(function (item) {
        speakOutput += `100 grams of ${item[0]} contains ${item[1]} calories. `;
        cardContent += `100 grams of '${item[0]}' contains '${item[1]}' Calories (kcal)\n`;
      });

      if (results.length > MAX_RESPONSES) {
        speakOutput += `There are more foods matched your search. You can say more information for more information. Or say stop to stop the skill. `;
        cardContent += `There are more foods matched your search. You can say more information for more information. Or say stop to stop the skill. `;
        repromptText = `You can say more information or stop.`;
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        attributes.lastResult = speakOutput;
        attributes.resultLength = results.length;
        attributes.FoodItem = FoodItem;
        attributes.results = results.slice(MAX_RESPONSES, MAX_FOOD_ITEMS);
        handlerInput.attributesManager.setSessionAttributes(attributes);
      }
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withStandardCard(
          cardTitle,
          cardContent,
          "https://upload.wikimedia.org/wikipedia/commons/5/5b/Hello_smile.png"
        )
        .reprompt(repromptText)
        .getResponse();
    }
  },
};

const GetMoreNutritionIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "GetMoreNutritionIntent"
    );
  },
  handle(handlerInput) {
    let speakOutput = "Hello World!";
    let cardTitle, cardContent;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    if (attributes.results) {
      cardTitle = `Nutrition Lookup more information for: ${attributes.FoodItem}`;

      speakOutput = `Your search resulted in ${attributes.resultLength} food items. Here are the few food items from search. Please add more keywords from this list for better results.`;
      cardContent = `${speakOutput}\n`;

      attributes.results.forEach(function (item) {
        speakOutput += `${item[0]}. `;
        cardContent += `'${item[0]}'\n`;
      });
    } else {
      speakOutput = `Wrong invocation of this intent. `;
    }
    attributes.lastResult = speakOutput;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const GetQuizIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GetQuizIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Hello World!";

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const QuizAnswerIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "QuizAnswerIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Hello World!";

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const DontKnowIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "DontKnowIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Hello World!";

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "You can say hello to me! How can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Sorry, I don't know about that. Please try again.";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput =
      "Sorry, I had trouble doing what you asked. Please try again.";
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNutritionIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
    GetMoreNutritionIntentHandler,
    GetQuizIntentHandler,
    QuizAnswerIntentHandler,
    DontKnowIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent("sample/hello-world/v1.2")
  .lambda();
