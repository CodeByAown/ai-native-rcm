#FROM python:3.12.10-alpine
FROM python:3.12.10-slim

ENV PIP_ROOT_USER_ACTION=ignore
ENV NETRC=/run/secrets/netrc


# Install system dependencies (tesseract + libraries)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

RUN mkdir -p /code/

WORKDIR /code

COPY requirements.txt /code/requirements.txt

RUN --mount=type=secret,id=netrc pip install -r requirements.txt

COPY . /code

ENV PYTHONPATH="${PYTHONPATH}:/code"

CMD ["python", "/code/api.py"]