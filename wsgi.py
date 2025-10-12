
from app import create_app

app = create_app()

# opcional: solo para debug local, Gunicorn no usará esto
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

from app import create_app



