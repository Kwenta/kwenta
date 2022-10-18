# syntax=docker/dockerfile:1
FROM synthetixio/docker-e2e:16.17-ubuntu as base

RUN mkdir /app
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

FROM base as test
RUN npm install --frozen-lockfile --prefer-offline --no-audit --legacy-peer-deps
COPY . .