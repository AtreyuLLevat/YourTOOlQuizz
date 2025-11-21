# wsgi.py
from app import create_app
from extensions import socketio

app = create_app()

if __name__ == "__main__":
    # Cambia el host / puerto según lo necesites
    socketio.run(app, async_mode='gevent', host="0.0.0.0", port=int(os.getenv("PORT", 8080)), debug=True)
