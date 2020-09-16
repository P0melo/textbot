import Express from 'express';
import Products from './products.js';
import MySql from 'mysql';

const app = Express();
const port = 8000;

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

// GET, PUT, POST, DELETE

// app.get("/products/:id", (req, res) => {
//     // res.send(req.params);
//     // res.json(Products)
//     // res.json(Products.find((product) => {
//     //     return +req.params.id === product.id
//     // }))

// });

function formatDate(d){
    let dateSplit = d.split('/');
    let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return dateSplit[1] + '.' + month[dateSplit[0]] + '.' + dateSplit[2];
}

app.post("/add", (req, res) => {

    if (req.body.queryResult.intent.displayName === "Show Product By ID") {
        let product = Products.find((product) => {
            return +req.body.queryResult.parameters.id === product.id
        })

        let result = {
            "fulfillmentMessages": [
                {
                    "text": {
                        "text": [
                            "Your product is: " + product.name
                        ]
                    }
                }
            ]
        };

        res.send(result)
    } else if (req.body.queryResult.intent.displayName === "Show Schedule") {

        var con = MySql.createConnection({
            host: "localhost",
            user: "user",
            password: "1234",
            database: "officecadetprogram"
        });

        con.connect(function (err) {

            if (err) throw err;
            con.query("SELECT s.DateFrom, s.DateTo, t.SubjectName, c.LName " +
                        "FROM tblscheddata sd " +
                            "JOIN tblschedule s ON sd.SchedID = s.SchedID " +
                            "JOIN tbltrainings t ON s.TrainingID = t.SubjectCode " +
                            "LEFT JOIN tblcrew c ON sd.MNNo = c.MNNo " +
                        "WHERE sd.MNNo = '" + req.body.queryResult.parameters.id + "' AND c.LName = '" + req.body.queryResult.parameters.lastName +"'", function (err, result, fields){
                            
                            if (err) throw err;
                            
                            let messageToAppend = "";

                            for(let i = 0; i < result.length; i++) {
                                messageToAppend += formatDate(result[i].DateFrom.getMonth() + "/" + result[i].DateFrom.getDate() + "/" + result[i].DateFrom.getFullYear()) + " -- " + result[i].SubjectName + " \n\n";
                            }
                                                        
                            let datetime = new Date();
                            let dateAndTime = datetime.getMonth() + "/" + datetime.getDate() + "/" + datetime.getFullYear();
                            let message = "As of " + formatDate(dateAndTime) + ", your upcoming training schedules are as follows: \n\n " + messageToAppend;
                            
                            let result1 = {
                                "fulfillmentMessages": [
                                    {
                                        "text": {
                                            "text": [
                                                message
                                            ]
                                        }
                                    }
                                ]
                            };

                            res.send(result1)
                        });
        });
    }

})

app.listen(port, () => console.log("Listening on port " + port));

