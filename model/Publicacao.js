const { Int32 } = require('mongodb')
const mongoose = require('mongoose')

const Publicacao = mongoose.model('Publicacao', {
  title: String,
  year: Number,
  rating: Number,
  resenha: String,
})

module.exports = Publicacao