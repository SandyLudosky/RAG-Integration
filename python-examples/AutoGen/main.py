import os
from dotenv import load_dotenv
import openai
import autogen

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")


# autogen config : https://colab.research.google.com/drive/1Q-6ZhGBgbR9C7SI89tVbH6jA_o4sXiK6?usp=sharing&source=post_page-----add448ae48c7--------------------------------#scrollTo=76bJjF4qicF2

config_list = autogen.config_list_from_json(
    "OAI_CONFIG_LIST",
    filter_dict={
        "model": ["gpt-3.5-turbo"],
    },
)

assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={
        "seed": 42,  # seed for caching and reproducibility
        "config_list": config_list,  # a list of OpenAI API configurations
        "temperature": 0,  # temperature for sampling
    },  # configuration for autogen's enhanced inference API which is compatible with OpenAI API
)

# create a UserProxyAgent instance named "user_proxy"
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False,  # set to True or image name like "python:3" to use docker
    },
)


user_proxy.initiate_chat(
    assistant,
    message="So I want a code that browss the internet and gives me to news in ai."
)