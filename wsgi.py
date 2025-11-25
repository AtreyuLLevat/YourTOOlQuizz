
import os
from app import create_app
from extensions import socketio, db

# Crear la aplicación solo 1 vez
app = create_app()

# Probar DB (solo logs para DigitalOcean)
try:
    with db.engine.connect() as conn:
        print("Conexión a la base de datos exitosa!")
except Exception as e:
    print(f"Error de conexión: {e}")

# Modo local
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
