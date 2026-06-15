FROM python:3.12.10-alpine

ENV PIP_ROOT_USER_ACTION=ignore
ENV NETRC=/run/secrets/netrc

RUN pip install --upgrade pip

RUN mkdir -p /code/

WORKDIR /code

COPY requirements.txt /code/requirements.txt

RUN --mount=type=secret,id=netrc pip install -r requirements.txt

COPY . /code

ENV PYTHONPATH="${PYTHONPATH}:/code"

CMD ["python", "/code/api.py"]