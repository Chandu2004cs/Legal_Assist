import os
import logging
from uuid import uuid4
from flask import Flask, request, jsonify
from flask_cors import CORS
from bson.objectid import ObjectId
from pymongo import MongoClient
import requests
from dotenv import load_dotenv

# === Load environment variables ===
load_dotenv()

# === Flask & Logging Setup ===
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# === Environment Variables ===
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama3-8b-8192"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

# === MongoDB Setup ===
client = MongoClient(MONGO_URI)
db = client["ai-chat-bot"]
collection = db["users"]

# === Core Functions ===

def generate_chat_title(query, response):
    prompt = (
        "You are an AI assistant that generates short and meaningful chat titles. "
        "Given a user's query and an assistant's response, return a concise, 4–8 word title summarizing the topic. "
        "Do not include quotes, punctuation, or emojis—just the title.\n\n"
        f"User's Query: {query}\n"
        f"Assistant's Response: {response}\n\n"
        "Title:"
    )

    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You generate chat titles."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5,
        "max_tokens": 20,
    }

    try:
        res = requests.post(GROQ_API_URL, headers=HEADERS, json=body)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logging.error(f"Error generating title: {e}")
        return None

def get_user_chat_history(user_id, chat_id):
    user = collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return []
    for chat in user.get("chats", []):
        if chat.get("id") == chat_id:
            return chat.get("messages", [])
    return []

def generate_gpt_response(history, query):
    conversation_text = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history])

    prompt = (
        f"You are a helpful legal assistant. Use the user's past conversation to respond thoughtfully. "
        f"Do not mention you have access to prior history, but integrate it naturally.\n\n"
        f"Conversation history:\n{conversation_text}\n\n"
        f"User's Latest Query:\n{query}\n\n"
        f"Your response:"
    )

    messages = [
        {"role": "system", "content": "You are a compassionate legal assistant."},
        {"role": "user", "content": prompt}
    ]

    body = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 800
    }

    try:
        response = requests.post(GROQ_API_URL, headers=HEADERS, json=body)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content'].strip()
    except Exception as e:
        logging.error(f"Groq API Error: {e}")
        return f"[Error from Groq: {e}]"

def answer_query(user_id, user_input, chat_id):
    history = get_user_chat_history(user_id, chat_id)
    assistant_response = generate_gpt_response(history, user_input)

    user = collection.find_one({"_id": ObjectId(user_id)})
    if user:
        for chat in user.get("chats", []):
            if chat.get("id") == chat_id and chat.get("title", "").lower() == "new chat":
                title = generate_chat_title(user_input, assistant_response)
                if title:
                    collection.update_one(
                        {"_id": ObjectId(user_id), "chats.id": chat_id},
                        {"$set": {"chats.$.title": title}}
                    )
                break

    return assistant_response

# === API Endpoint ===

@app.route("/api/legal-query", methods=["POST"])
def handle_query():
    try:
        data = request.json
        user_id = data.get("userId")
        chat_id = data.get("chatId")
        query = data.get("query")

        if not user_id or not chat_id or not query:
            return jsonify({"error": "Missing userId, chatId, or query"}), 400

        answer = answer_query(user_id, query, chat_id)
        return jsonify({"response": answer})

    except Exception as e:
        logging.exception("Error in /api/legal-query")
        return jsonify({"error": str(e)}), 500

# === Run Server ===

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    logging.info(f"✅ Flask server starting on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)
