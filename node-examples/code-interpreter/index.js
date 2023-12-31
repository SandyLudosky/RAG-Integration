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

// Step 7: Create a File object - retrieve the files attached to an assistant
const createFileAssistant = async (assistant, file) => {
  const file_id = file.file_path.file_id;
  const assistantFile = await openai.beta.assistants.files.create(
    assistant.id,
    {
      file_id,
    }
  );
  // console.log(assistantFile);
};

const retrieveAssistantFile = async (assistant, file) => {
  const file_id = file.file_path.file_id;
  const assistantFile = await openai.beta.assistants.files.retrieve(
    assistant.id,
    file_id
  );
  // console.log(assistantFile);
  // downloadFile(myAssistantFile);
};

const retrieveFileContent = async (file) => {
  const file_id = file.file_path.file_id;
  try {
    return await openai.files.retrieveContent(file_id);
  } catch (error) {
    console.error(error);
  }
};

// Step 1: Create an Assistant
const createAssistant = async () => {
  return await openai.beta.assistants.create({
    name: ASSISTANT_NAME,
    instructions: ASSISTANT_DEFAULT_INSTRUCTIONS,
    tools: [{ type: "code_interpreter" }],
    model: LANGUAGE_MODEL,
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

    // check if there are any files attached to the assistant
    if (messages.data[0].content[0].text.annotations?.length > 0) {
      console.log(
        "annotations: ",
        messages.data[0].content[0].text.annotations
      );

      const file = messages.data[0].content[0].text.annotations[0];

      // create assistant file object
      await createFileAssistant(assistant, file);

      // retrieve assistant file object
      await retrieveAssistantFile(assistant, file);

      // retrieve file content
      const fileContent = await retrieveFileContent(file);
      // save text file
      await readFile(fileContent, file);
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

  // Step 1: Create an Assistant
  const assistant = await createAssistant();
  // Step 2: Create a Thread
  const thread = await createThread();

  while (true) {
    // Step 3: Add a Message to a Thread
    let userMessage = getInput("You: ");
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
