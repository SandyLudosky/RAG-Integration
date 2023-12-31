const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  // reading images and files from code interpreter
  // https://platform.openai.com/docs/assistants/tools/code-interpreter
  readFile: async (file) => {
    const file_id = file.file_path.file_id;
    const file_name = file.text.split("/").pop();
    try {
      return await openai.files.retrieveContent(file_id);
    } catch (error) {
      console.error(error);
    }
  },
};
