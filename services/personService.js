let Person = require('../models/person')


let create = (obj) => {
  return new Person({
    name: obj.name,
    number: obj.number
  }).save()
}
let find = (query) => {
  return Person.find(query)
}
let findOne = (query) => {
  return Person.findOne(query)
}
let findById = (query) => {
  return Person.findById(query)
}
let update = (id, person) => {
  return Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
}
let deleteOne = (id) => {
  return Person.findByIdAndRemove(id)
}
let count = () => {
  return Person.estimatedDocumentCount()
}

module.exports = { create: create, find: find, findOne: findOne, findById: findById, update: update, delete: deleteOne, count: count }
