const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

morgan.token('requestBody', function getRequestBody(req) {
    return JSON.stringify(req.body)
})

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))


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
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

app.post('/api/persons/', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    if (persons.find(p => p.name === body.name)) {
        return res.status(400).json({
            error: 'name already in phonebook'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})