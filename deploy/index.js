const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3003

// server.js
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('../db.json')

options = { "static": "../out" } 

const middlewares = jsonServer.defaults(options)

server.use(middlewares)
server.use(router)

// server.use('/api', router)
// server.use(express.static('../.next'))

server.listen(PORT, () => {
    console.log('JSON Server is running')
})
