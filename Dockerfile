FROM node:14

RUN mkdir -p /server

WORKDIR /server

ADD ./ /server

RUN npm install yarn; \
    yarn install; \
    yarn add ts-node
    

EXPOSE 3000

CMD [ "yarn", "test"]
