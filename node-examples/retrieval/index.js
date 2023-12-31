const OpenAI = require("openai");
var readlineSync = require("readline-sync");
const fs = require("fs");
const path = require("path");
const { readFile } = require("./handlers");
require("dotenv").config();

const openai = new OpenAI();

const LANGUAGE_MODEL = "gpt-3.5-turbo-1106";
const ASSISTANT_NAME = "Math Tutor";
const ASSISTANT_DEFAULT_INSTRUCTIONS =
  "You are a personal math tutor. Write and run code to answer math questions.";

async function uploadToOpenAI(filepath) {
  try {
    // Upload a file with an "assistants" purpose
    const file = await openai.files.create({
      file: fs.createReadStream(filepath),
      purpose: "assistants",
    });
    console.log(file);
    console.log(file.id);
    return file.id;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

// Step 1: Create an Assistant
const createAssistant = async (file_id) => {
  return await openai.beta.assistants.create({
    name: ASSISTANT_NAME,
    instructions: ASSISTANT_DEFAULT_INSTRUCTIONS,
    tools: [{ type: "retrieval" }],
    model: LANGUAGE_MODEL,
    file_ids: [file_id],
  });
};

// Step 2: Create a Thread
const createThread = async () => {
  return await openai.beta.threads.create();
};

// Step 3: Add a Message to a Thread
const addMessageToThread = async (thread, input) => {
  try {
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: input,
    });
    return message;
  } catch (error) {
    console;
  }
};

// Step 4: Run the Assistant
const runThread = async (assistant, thread) => {
  try {
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      instructions: "Please address the user as Rok Benko.",
    });
    console.log("This is the run object: ", run, "\n");

    return run;
  } catch (error) {
    console.error(error);
  }
};

// Step 5: Check the Run Status
const checkRunStatus = async (run, thread) => {
  try {
    keepRetrievingRun = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    console.log("This is the run status: ", run.status, "\n");
  } catch (error) {
    console.error(error);
  }
};

// Step 6: Retrieve and display the Messages
const retrieveMessages = async (run, thread, message, assistant) => {
  if (run.status === "completed") {
    console.log("This is the run status: ", run.status, "\n");
    const messages = await openai.beta.threads.messages.list(thread.id);

    // display messages
    console.log(
      "user: ",
      message.content[message.content.length - 1].text.value
    );

    console.log(messages.data[0].content[0]);
    if (messages.data[0].content[0].text) {
      console.log("assistant 🤖: ", messages.data[0].content[0].text.value);
    }
  }
};

function getInput(promptMessage) {
  return readlineSync.question(promptMessage, {
    hideEchoBack: false, // The typed characters won't be displayed if set to true
  });
}

async function main() {
  console.log("\n\n----------------------------------");
  console.log("           🤖 AI ASSISTANT           ");
  console.log("---------------------------------- \n ");
  console.log("to exit Chat type 'X'");

  // Step 0: Create a File
  const file_id = await uploadToOpenAI("files/faq_abc.txt");

  // Step 1: Create an Assistant
  const assistant = await createAssistant(file_id);
  // Step 2: Create a Thread
  const thread = await createThread();

  while (true) {
    // Step 3: Add a Message to a Thread
    const userMessage = getInput("You: ");
    if (userMessage.toUpperCase() === "X") {
      console.log("Goodbye!");
      process.exit();
    }
    if (!!userMessage) {
      const message = await addMessageToThread(thread, userMessage);

      // print user message
      console.log(
        "user: ",
        message.content[message.content.length - 1].text.value
      );

      // Step 4: Run the Assistant
      let run = await runThread(assistant, thread);

      // Step 5: Check the Run Status
      while (run.status !== "completed") {
        await checkRunStatus(run, thread);
        // Re-fetch the run status inside the loop
        run = await openai.beta.threads.runs.retrieve(thread.id, run.id);

        if (run.status === "failed" || run.status === "expired") {
          console.log("Chat terminated.");
          // process.exit();
        }
      }

      // Step 6: Retrieve and display the Messages
      await retrieveMessages(run, thread, message, assistant);
    }
  }
}

main();
