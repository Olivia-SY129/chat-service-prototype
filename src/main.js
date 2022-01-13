const Koa = require('koa')
const path = require('path')
const Pug = require('koa-pug')
const route = require('koa-route')
const websockify = require('koa-websocket')
const serve = require('koa-static')
const mount = require('koa-mount')
const mongoClient = require('./mongo')

/**
 * @typedef Messages
 * @property {string} nickname
 * @property {string} message
 */

const app = websockify(new Koa())

/* eslint-disable-next-line no-new */
new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app,
})

app.use(mount('/public', serve('src/public')))

app.use(async (ctx) => {
  await ctx.render('main')
})

/* eslint-disable-next-line no-underscore-dangle */
const _client = mongoClient.connect()

async function getChatsCollection() {
  const client = await _client
  return client.db('myChat').collection('chat')
}

// Using routes
app.ws.use(
  route.all('/ws', async (ctx) => {
    const chatsCollection = await getChatsCollection()
    const chatsCursor = chatsCollection.find(
      {},
      {
        sort: {
          createdAt: 1,
        },
      }
    )

    const chats = await chatsCursor.toArray()

    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        payload: {
          chats,
        },
      })
    )

    ctx.websocket.on('message', async (data) => {
      if (typeof data !== 'string') return

      /** @type {Chats} */

      const chat = JSON.parse(data)

      chatsCollection.insertOne({
        ...chat,
        createdAt: new Date(),
      })

      const { message, nickname } = chat

      const { server } = app.ws

      if (!server) return

      server.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            payload: {
              message,
              nickname,
            },
          })
        )
      })

      // ctx.websocket.send(
      //   JSON.stringify({
      //     message,
      //     nickname,
      //   })
      // )
    })
  })
)

app.listen(3000)

app.listen(5000)
