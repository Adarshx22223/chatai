from flask import Flask, render_template, request, jsonify, session
import os
import requests
import logging
import openai
from openai import OpenAI
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "a secret key")

# AI Provider configurations
DEEPSEEK_API_URL = "https://api.deepseek.ai/v1/chat/completions"

def get_api_key(provider):
    """Get API key from session for the specified provider"""
    return session.get(f'{provider}_api_key')

@app.route('/')
def home():
    return render_template('chat.html')

@app.route('/set-api-key', methods=['POST'])
def set_api_key():
    data = request.json
    provider = data.get('provider')
    api_key = data.get('api_key')

    if not provider or not api_key:
        return jsonify({'error': 'Provider and API key are required'}), 400

    # Store API key in session
    session[f'{provider}_api_key'] = api_key
    return jsonify({'message': f'{provider} API key set successfully'})

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data received'}), 400
            
        user_message = data.get('message')
        provider = data.get('provider', 'gpt-3.5')  # Default to GPT-3.5

    if provider == 'gemini':
        api_key = get_api_key(provider)
        if not api_key:
            return jsonify({'error': 'Please set your Gemini API key first'}), 401
            
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(user_message)
            assistant_message = response.text
            return jsonify({'reply': assistant_message})
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            return jsonify({'error': f'Error communicating with Gemini: {str(e)}'}), 500

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    api_key = get_api_key(provider)
    if not api_key:
        return jsonify({'error': f'Please set your {provider} API key first'}), 401

    try:
        if provider == 'openai':
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": user_message}]
            )
            assistant_message = response.choices[0].message.content

        elif provider == 'deepseek':
            logger.debug(f"Sending request to DeepSeek API with message: {user_message}")
            response = requests.post(
                DEEPSEEK_API_URL,
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "user", "content": user_message}
                    ]
                },
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                }
            )
            response.raise_for_status()
            logger.debug(f"Received response from DeepSeek API: {response.json()}")
            assistant_message = response.json()['choices'][0]['message']['content']

        else:
            return jsonify({'error': 'Invalid AI provider selected'}), 400

        return jsonify({'reply': assistant_message})

    except (requests.exceptions.RequestException, openai.APIError) as e:
        logger.error(f"Error calling {provider} API: {str(e)}")
        return jsonify({'error': f'Error communicating with AI service: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/active-providers', methods=['GET'])
def get_active_providers():
    active = []
    for provider in ['deepseek', 'openai']:
        if session.get(f'{provider}_api_key'):
            active.append(provider)
    return jsonify({'active_providers': active})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)