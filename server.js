require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const MOVIEDEX = require('./moviedex.json')

const app = express()
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN 
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(400).json( {error: 'Unauthorized request'} )
    }

    next()
})

function handleGetMovies(req, res){
    const { genre, country, avg_vote } = req.query
    let response = MOVIEDEX

    if (genre){
        response = response.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()))
    }
    if (country){
        response = response.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()))
    }
    if (avg_vote){
        const rating = parseFloat(avg_vote)
        if (Number.isNaN(rating) || rating > 10 || rating < 0){
            res.status(400).send('Please supply a numeric value between 0 and 10 for the rating')
        }
        response = response.filter(movie => movie.avg_vote >= rating)
    }
    
    res.send(response)
}

app.get('/movies', handleGetMovies)
app.listen(8000, () => {
    console.log('Server is listening on PORT 8000...')
})

