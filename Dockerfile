FROM node:latest

COPY . /src

WORKDIR /src

RUN npm install --only=production

EXPOSE 3000

CMD npm start