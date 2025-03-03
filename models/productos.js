const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {type : String, required: true},
  descripcion:  {type: String},
  precio: {type: Number, required: true},
  categoria: {type: String, required: true},
  imagenUrl: {type: String}
}, {timestamps: true});

const Producto = mongoose.model('Producto', productSchema);

module.exports = Producto;