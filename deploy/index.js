const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3003

// server.js
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')

options = { "static": "public" } 

const middlewares = jsonServer.defaults(options)

const publicDirPath = "public"

// Routes working without ".html" extension
server.use(express.static(publicDirPath, {extensions: ['html']}))

server.use(middlewares)
server.use(router)

// server.use('/api', router)
// server.use(express.static('../.next'))

server.listen(PORT, () => {
    console.log(`JSON Server is running. Open: http://localhost:${PORT} in a browser.`)
})
