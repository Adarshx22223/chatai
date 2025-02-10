from flask import Flask, render_template, request, jsonify
import os
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "a secret key")

# DeepSeek API configuration
DEEPSEEK_API_URL = "https://api.deepseek.ai/v1/chat/completions"  # Updated endpoint
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")

@app.route('/')
def home():
    return render_template('chat.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    if not DEEPSEEK_API_KEY:
        logger.error("DeepSeek API key not found in environment variables")
        return jsonify({'error': 'API configuration error'}), 500

    try:
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
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
                'Content-Type': 'application/json'
            }
        )
        response.raise_for_status()
        logger.debug(f"Received response from DeepSeek API: {response.json()}")

        # Extract the assistant's message from the response
        assistant_message = response.json()['choices'][0]['message']['content']
        return jsonify({'reply': assistant_message})

    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling DeepSeek API: {str(e)}")
        return jsonify({'error': f'Error communicating with AI service: {str(e)}'}), 500
    except KeyError as e:
        logger.error(f"Unexpected API response format: {str(e)}")
        return jsonify({'error': 'Unexpected response format from AI service'}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)