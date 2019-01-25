FROM node:9.11.1-slim

ADD ./README.md /
ADD ./package.json /
ADD ./index.js /

RUN npm install

CMD ["/usr/local/bin/nodejs", "index.js"]