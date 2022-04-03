require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const personService = require('./services/personService')

morgan.token('data', function (req) { return JSON.stringify(req.body) })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/info', (request, response) => {
  personService
    .count()
    .then(count => {
      response.send(
        `<div>Phonebook has info for ${count} people</div>
              <div>${Date().toString()}</div>`
      )
    })
})

app.get('/api/persons', (request, response) => {
  personService
    .find({}).then(persons => {
      response.json(persons)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: !body.name ? 'name missing' : 'number missing'
    })
  }

  personService
    .findOne({ 'name': body.name })
    .then(person => {
      if(person !== null) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }
      personService
        .create({
          name: body.name,
          number: body.number
        })
        .then(person => response.json(person))
        .catch(error => next(error))
        .then(person => response.json(person))
        .catch(error => next(error))
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  personService
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: !body.name ? 'name missing' : 'number missing'
    })
  }
  const person = {
    name: body.name,
    number: body.number,
  }
  personService
    .update(request.params.id, person)
    .then(updatedPerson => {
      if(updatedPerson !== null) {
        response.json(updatedPerson)
      } else {
        return response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  personService
    .delete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})