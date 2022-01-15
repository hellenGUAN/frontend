FROM node:alpine

ARG WORKPLACE=/pvs-frontend
ARG PORT=3000

ENV NODE_OPTIONS=--openssl-legacy-provider

COPY ./ $WORKPLACE

WORKDIR $WORKPLACE

RUN npm i -g pnpm && \
    pnpm i -g serve &&  \
    pnpm i --frozen-lockfile &&  \
    rm .eslintrc.js &&  \
    pnpm build

RUN mkdir ../to_rm && \
    mv ./* ../to_rm && \
    mv ../to_rm/dist ./ && \
    rm -rf ../to_rm

ENV NODE_ENV=production
EXPOSE $PORT
CMD ["serve", "-s", "dist", "-C"]
