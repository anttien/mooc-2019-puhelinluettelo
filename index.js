require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('requestBody', function getRequestBody(req) {
    return JSON.stringify(req.body)
})

const app = express()
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestBody', {
    skip: function (req, res) { return req.method != 'POST' }
}))
app.use(morgan('tiny', {
    skip: function (req, res) { return req.method == 'POST' }
}))

function generateId() {
    return Math.floor(Math.random() * 10000)
}

let persons = [
    {
        name: "Antti",
        number: "666",
        id: 1
    },
    {
        name: "Anna",
        number: "777",
        id: 2
    }
]

app.get('/info', (req, res) => {
    res.send(`Phonebook has info for ${persons.length} people<br></br>${new Date().toISOString()}`)
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people.map(p => p.toJSON()))
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            res.json(person.toJSON())
        } else {
            res.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()

        }).catch(error => next(error))
})

app.post('/api/persons/', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    // if (persons.find(p => p.name === body.name)) {
    //     return res.status(400).json({
    //         error: 'name already in phonebook'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId()
    })

    person.save().then(savedPerson => {
        res.json(savedPerson.toJSON())
    })
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

// virheellisten pyyntöjen käsittely
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})