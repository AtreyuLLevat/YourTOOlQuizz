# Imagen base oficial de Python
FROM python:3.10-slim

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar requirements.txt y luego instalar dependencias para aprovechar caché de Docker
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la app
COPY . .

# Puerto que exponemos
EXPOSE 8080

# Variables de entorno para que Flask sepa dónde está la app
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8080

# Comando para ejecutar la app con Gunicorn (más robusto para producción)
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
