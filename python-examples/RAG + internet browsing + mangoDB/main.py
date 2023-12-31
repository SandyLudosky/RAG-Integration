import os
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import (
    CharacterTextSplitter,
)
from langchain.prompts.chat import (
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import MongoDBAtlasVectorSearch
from langchain.vectorstores import Chroma
from colorama import Fore
from get_dataset import scrape
from pymongo import MongoClient
from langchain.document_loaders import PyPDFLoader


load_dotenv()

# https://python.langchain.com/docs/modules/data_connection/vectorstores/

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LANGUAGE_MODEL = "gpt-3.5-turbo-instruct"
MONGODB_ATLAS_CLUSTER_URI = os.getenv("MONGODB_ATLAS_CLUSTER_URI")
DB_NAME = "langchain_db"
COLLECTION_NAME = "test"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "index_name"

print(MONGODB_ATLAS_CLUSTER_URI)

client = MongoClient("mongodb+srv://sandra:yBe3fxLkCYuyO889@cluster0.e0jjm3t.mongodb.net/?retryWrites=true&w=majority")

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]



# Load the PDF
loader = PyPDFLoader("docs/faq.pdf")
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=150, chunk_overlap=150)
docs = text_splitter.split_documents(data)

# insert the documents in MongoDB Atlas with their embedding
vector_search = MongoDBAtlasVectorSearch.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=MONGODB_COLLECTION,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)

# Perform a similarity search between the embedding of the query and the embeddings of the documents
query = "Do you ship to Europe?"
results = vector_search.similarity_search(query)

print(results[0].page_content)

results = vector_search.similarity_search_with_score(
    query=query, k=5, pre_filter={"page": {"$eq": 1}}
)

# Display results
for result in results:
    print(result)