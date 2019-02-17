var express = require('express');
var bodyParser = require('body-parser');
var sql = require('mssql/msnodesqlv8');
var morgan = require('morgan');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan('tiny'));


var config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={SQL Server Native Client 11.0}; Server={DESKTOP-CPETP6D}; Database={sql-injection}; Trusted_Connection={yes};',
};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
})

app.get('/success', (req, res) => {
    res.sendFile(__dirname + '/public/success.html');
})

app.get('/error', (req, res) => {
    res.sendFile(__dirname + '/public/error.html');
})

app.route('/login')
    .get((req, res) => {
    res.sendFile(__dirname + '/public/login.html')
    })
    .post((req ,res) => {
        var username = req.body.username;
        var password = req.body.password;
        console.log("select * from Users where username='"+username+"'"+" and password='"+password+"'");
        sql.connect(config).then(pool => {
            pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            //.query("select * from Users where username=@username and password=@password")
            .query("select * from Users where username='"+username+"'"+" and password='"+password+"'")
            .then(user => {
                console.log(user);
                if(user.recordset.length == 0) {
                    res.redirect('/error')
                    sql.close();;
                }
                else{
                     res.redirect('/success')
                    sql.close();
                }
            }).catch(err => {
                console.log(err);
                res.status(500).send('500 internal server error. ' + err.originalError);
                sql.close();
            })
        })
    })

process.on('uncaughtException', (err) => {
    console.log('whoops! there was an error\n', err.stack);
});

app.use(function(req, res, next) {
    res.status(404).send('404 resource doesnt exist!')
});

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is listening on port 5000 ... ');
})