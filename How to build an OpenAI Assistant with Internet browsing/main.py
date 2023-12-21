import streamlit as st
import openai
from dotenv import load_dotenv
from assistant import generate_chat_completion

load_dotenv()

client = openai.OpenAI()
MODEL_ENGINE = "gpt-3.5-turbo"

# https://github.com/assafelovic/tavily-python
st.title("🤓 Q&A Assistant ")
st.divider()
chat_placeholder = st.empty()


def init_chat_history():
    if "messages" not in st.session_state:
        st.session_state["messages"] = []
        st.session_state.messages = [
            {"role": "system", "content": "You are a helpful assistant."}
        ]


def start_chat():
    # Display chat messages from history on app rerun
    with chat_placeholder.container():
        for message in st.session_state.messages:
            if message["role"] != "system":
                with st.chat_message(message["role"]):
                    st.markdown(message["content"])

    # Accept user input
    if prompt := st.chat_input("Ask your question?"):
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})

        # Display user message in chat message container
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.spinner("Thinking..."):
            # Generate response from Chat models
            messages = generate_chat_completion(prompt)
            filtered_msg = [message for message in messages if message.role != "user"]

            # message_placeholder.markdown(response)
            with st.chat_message("assistant"):
                for msg in filtered_msg:
                    message = msg.content[0].text.value
                    st.markdown(message)


if __name__ == "__main__":
    init_chat_history()
    start_chat()
