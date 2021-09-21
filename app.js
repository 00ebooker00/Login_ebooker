//Invocamos express
    const express = require('express');
    const app = express();

//Seteamos url encoded para capturar datos del formulario
    app.use(express.urlencoded({extended:false}));
    app.use(express.json());

//Invocamos dotenv
    const dotenv = require('dotenv');
    dotenv.config({path:'./env/.env'});

//Seteamos el directorio public
    app.use('/resources', express.static('public'));
    app.use('resources', express.static(__dirname + '/public'));

//Establecemos motor de plantillas
    app.set('view engine', 'ejs');

//Invocamos a bryptjs
    const bcryptjs = require('bcryptjs');

//Configuramos las variable de session
    const session = require('express-session')
    app.use(session({
        secret:'secret',
        resave:true,
        saveUninitialized:true
    }));

//Invocamos al modulo de conexion de la BD
    const connection = require('./database/db');

//Estableciendo las rutas
    app.get('/login', (req, res)=>{
        res.render('login');
    });

    app.get('/register', (req, res)=>{
        res.render('register');
    });
//Registración
//Capturamos user-name-password
app.post('/register', async (req, res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const pass = req.body.pass;
    let passwordHash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO login_ebooker SET ?', {user:user, name:name, pass:passwordHaash}, async(error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register', {
                alert:true,
                alertTitle: "Registration",
                alertMessage: "¡Successful Registration!",
                alertIcon:'success',
                showConfirmButton:false,
                timer:1500,
                ruta:""
            })
        }
    });
});     
//Autenticación 
app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if(user && pass){
        connection.query('SELECT * FROM login_ebooker WHERE user = ?', [user], async (error, results)=>{
            if(results.lenght == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render( 'login' ,{
                    alert:true,
                    alertTitle:"Error",
                    alertMessage:"Usuario y/o password son incorrectas",
                    alertIcon:"error",
                    showConfirmButton:true,
                    timer:false,
                    ruta:'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].name
                res.render( 'login' ,{
                    alert:true,
                    alertTitle:"Conecxion exitosa",
                    alertMessage:"¡LOGIN CORRECTO!",
                    alertIcon:"sucess",
                    showConfirmButton:false,
                    timer:1500,
                    ruta:''
                });
            }
        });
    }else{
                res.render( 'login' ,{
                    alert:true,
                    alertTitle:"Advertencia",
                    alertMessage:"¡Por favor ingrese un usuario y/o password!",
                    alertIcon:"warning",
                    showConfirmButton:true,
                    timer:false,
                    ruta:'login'
                });
    }
});

//Auth pages
app.get('/', (req, res)=>{
    if (req.session.loggedin){
        res.render('index', {
            login:true,
            name:req.session.name
        });        
    }else{
        res.render('index', {
            login:false,
            name: 'Debe iniciar sesión'
        })
    }
})
//Logout
app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    })
});

app.listen(3000, (req , res)=>{
    console.log('SERVER RUNNIG IN http://localhost:3000');
});