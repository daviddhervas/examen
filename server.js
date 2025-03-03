const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const multer = require('multer');
const express = require('express');
const methodOverride = require('method-override');
const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

// Define PORT from environment variables
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));



// Reseña Schema
const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  profilePic: {
    type: String
  }
});

const User = mongoose.model('User', userSchema);

// Activity Schema
const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastLogin: Date,
  failedAttempts: {
    type: Number,
    default: 0
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});

const Activity = mongoose.model('Activity', activitySchema);

// Product Schema
const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  categoria: { type: String, required: true },
  imagenUrl: { type: String }
}, { timestamps: true });

const Product = mongoose.model('Producto', productSchema);  

// Express Configuration
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vistas'));

// PayPal Configuration
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const PaypalClient = new paypal.core.PayPalHttpClient(environment);

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use(methodOverride('method'));
app.use(session({
  secret: require('crypto').randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 1000 * 60 * 30 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Passport Configuration
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      let activity = await Activity.findOne({ userId: user._id });
      if (activity) {
        activity.failedAttempts += 1;
        await activity.save();
      } else {
        await Activity.create({
          userId: user.id,
          lastLogin: null,
          failedAttempts: 1,
          isLoggedIn: false
        });
      }
      return done(null, false, { message: 'Contraseña incorrecta' });
    }

    await Activity.updateMany({}, { isLoggedIn: false });
    await Activity.findOneAndUpdate(
      { userId: user._id },
      { 
        lastLogin: Date.now(),
        isLoggedIn: true,
        failedAttempts: 0
      },
      { upsert: true }
    );

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware de actividad
const updateActivity = async (req, res, next) => {
  if (req.session.userId) {
    try {
      let activity = await Activity.findOne({ userId: req.session.userId });
      if (activity) {
        activity.lastLogin = Date.now();
        activity.isLoggedIn = true;
        await activity.save();
      } else {
        const newActivity = await Activity.create({
          userId: req.session.userId,
          lastLogin: Date.now(),
          isLoggedIn: true
        });
      }
    } catch (err) {
      console.error('Error al actualizar actividad:', err);
    }
  }
  next();
};

// Middleware para logging de solicitudes
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('dev', { stream: accessLogStream }));

// Middleware para servir archivos estáticos
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Rutas
app.get('/', (req, res) => {
  res.render('main', {
    user: req.user,
    title: 'Bienvenido a la plataforma'
  });
});

// Ruta de Sign-Up
app.get('/sign-up', (req, res) => {
  res.render('sign-up', { title: 'Crear cuenta', user: req.user });
});

// Ruta para manejar el registro
app.post('/sign-up', upload.single('profilePic'), async (req, res) => {
  try {
    const { email, password, name, surname, dob, gender } = req.body;

    if (!password) {
      return res.status(400).send('La contraseña es requerida');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      surname,
      dob,
      gender,
      profilePic: req.file ? `/uploads/${req.file.filename}` : null
    });

    await Activity.create({
      userId: newUser._id,
      lastLogin: Date.now(),
      failedAttempts: 0,
      isLoggedIn: false
    });

    res.redirect('/login');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al crear el usuario');
  }
});

// Ruta para mostrar las reseñas de un producto
app.get('/productos/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const producto = await Product.findById(productId);
    const reviews = await Review.find({ productId }).populate('userId', 'name email');
    
    res.render('reseñas', {
      title: `Reseñas de ${producto.nombre}`,
      product: producto,
      reviews,
      user: req.user
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).send('Error al obtener las reseñas');
  }
});

// Ruta para eliminar una reseña
// Update this route
app.delete('/reviews/:id/delete', ensureAuthenticated, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).send('Reseña no encontrada');
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).send('No tienes permiso para eliminar esta reseña');
    }

    // Change review.remove() to Review.findByIdAndDelete()
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).send('Reseña eliminada');
  } catch (error) {
    console.error('Error al eliminar la reseña:', error);
    res.status(500).send('Error al eliminar la reseña');
  }
});

// Ruta para agregar una reseña
app.post('/productos/:id/reviews', ensureAuthenticated, async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, reviewText } = req.body;

    if (!rating || !reviewText) {
      return res.status(400).send('La calificación y el texto de la reseña son requeridos');
    }

    const newReview = await Review.create({
      productId,
      userId: req.user.id,
      rating,
      reviewText
    });

    res.redirect(`/productos/${productId}/reviews`);
  } catch (error) {
    console.error('Error al crear la reseña:', error);
    res.status(500).send('Error al crear la reseña');
  }
});

// Ruta de Login
app.get('/login', (req, res) => {
  const messages = req.flash('error');
  res.render('login', { title: 'Iniciar sesión', user: req.user, messages });
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), async (req, res) => {
  req.session.userId = req.user.id;
  await updateActivity(req, res, () => {});
  res.redirect('/basededatos');
});

// Ruta de /basededatos
app.get('/basededatos', ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.find();
    const activities = await Activity.find().populate('userId');
    res.render('basededatos', {
      title: 'Base de Datos de Usuarios',
      user: req.user,
      users,
      activities
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al cargar los usuarios');
  }
});

// Middleware para garantizar que el usuario está autenticado
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Ruta para cargar el formulario de edición de usuario
app.get('/editar-usuario/:id', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
    if (req.user.id !== user.id) {
      return res.status(403).send('No tienes permiso para editar este usuario');
    }
    res.render('editar-usuario', {
      title: 'Editar Usuario',
      user: req.user,
      editUser: user
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al cargar la página de edición');
  }
});

// Ruta para manejar la actualización de datos del usuario
app.post('/editar-usuario/:id', ensureAuthenticated, upload.single('profilePic'), async (req, res) => {
  try {
    const { email, name, surname, dob, gender } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    if (req.user.id !== user.id) {
      return res.status(403).send('No tienes permiso para editar este usuario');
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('El correo electrónico ya está en uso');
      }
    }

    await User.findByIdAndUpdate(req.params.id, {
      email,
      name,
      surname,
      dob,
      gender,
      profilePic: req.file ? `/uploads/${req.file.filename}` : user.profilePic
    });

    res.redirect('/basededatos');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al actualizar el usuario');
  }
});

// Product routes
app.get('/productos', async (req, res) => {
  try {
    const productos = await Product.find().sort({ createdAt: -1 });
    res.render('productos', {
      title: 'Catálogo de Productos',
      user: req.user,
      productos
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al cargar los productos');
  }
});

// Cart and Payment routes
app.get('/carrito', ensureAuthenticated, (req, res) => {
    try {
        res.render('carrito', {
            title: 'Carrito de Compra',
            user: req.user,
            paypalClientId: process.env.PAYPAL_CLIENT_ID
        });
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        res.status(500).send('Error al cargar el carrito');
    }
});

app.post('/process-payment', ensureAuthenticated, async (req, res) => {
  try {
    const { orderID } = req.body;
    res.json({ success: true });
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    res.status(500).json({ success: false, error: 'Error al procesar el pago' });
  }
});

app.get('/compra-realizada', ensureAuthenticated, (req, res) => {
  try {
    res.render('compra-realizada', {
      title: 'Compra Realizada',
      user: req.user
    });
  } catch (error) {
    console.error('Error al mostrar la página de compra realizada:', error);
    res.status(500).send('Error al procesar la compra');
  }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.logout((error) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/');
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});