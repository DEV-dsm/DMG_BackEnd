# build stage
# 사용하는 node 버전
FROM node:18-alpine AS install
# RUN,CMD의 명령이 실행될 디렉토리 경로
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --force


FROM node:18-alpine AS build
WORKDIR /usr/src/app

COPY --chown=node:node --from=install /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production --force && npm cache clean --force


# prod stage
FROM node:18-alpine AS deploy
WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node ./.production.env /usr/src/app/.production.env

EXPOSE 8080
CMD ["node", "dist/main.js"]