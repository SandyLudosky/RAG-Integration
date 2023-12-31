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
  readFile: async (fileContent, file) => {
    const file_id = file.file_path.file_id;
    const file_name = file.text.split("/").pop();
    try {
      const filePath = path.join(__dirname, "files/" + file_name);
      const file = await openai.files.retrieveContent(file_id);
      // Convert the object to a JSON string
      console.log(file);
      // Save the image to a specific location
      fs.writeFileSync(filePath, file, "utf8");
    } catch (error) {
      console.error(error);
    }
  },
};
