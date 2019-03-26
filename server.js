//##################################################
//#                                                #
//# All In One Node Demo                           #
//#                                                #
//##################################################

/*
fixed MongoDB -id no recognised as string
fixed missing table name
*/

const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const querystring = require('querystring');
const escapeString = require('sql-escape-string');
const fileUpload = require('express-fileupload');
var sqlparser = require('sql-parse').parse;
app.use(fileUpload());
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var db;
var table = '';
var ObjectID = require('mongodb').ObjectID;

MongoClient.connect(url, {useNewUrlParser: true }, function(err, database) {
  if (err) throw err;
  db = database.db("mydb");
}); 

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const title = 'All In One Node.js';
var myStyle =
`
#Schlumpf {
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
}
#Schlumpf div {
    margin: auto;
    width: 50%;
    text-align: center;
    border: 3px solid green;
    padding: 10px;
}
#tablehead {
    margin: auto;
    width: 50%;
    text-align: center;
}
#Schlumpf table {
    margin: auto;
//    width: auto;
    padding: 10px;
} 
#Schlumpf td, #Schlumpf th {
    border: 1px solid #ddd;
    padding: 8px;
}

#Schlumpf tr:nth-child(even){background-color: #f2f2f2;}

#Schlumpf tr:hover {background-color: #ddd;}

#Schlumpf th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #4CAF50;
    color: white;
}

#content a, .menu a:link, .menu a:active, .menu a:visited 
{
text-decoration: none;
}
#content a:hover 
{
background-color: black;
color: white;
}
.nav 
{
align: center;
margin: 10px 10px;
padding-top: 8px;
padding-bottom: 10px;
padding-left: 8px;
background: none;
}

.nav li 
{
list-style-type: none;
display: inline;
padding: 10px 30px;
background-color: #e67e22;
margin-left: -11px;
font-size: 120%;
}

.nav li:first-child
{
margin-left: 0;
border-top-left-radius: 10px !important;
border-bottom-left-radius: 10px !important;
}

.nav li:last-child
{
margin-right: 0px;
border-top-right-radius: 10px !important;
border-bottom-right-radius: 10px !important;
}

.nav a, .menu a:link, .menu a:active, .menu a:visited 
{
text-decoration: none;
color: white;
border-bottom: 0;
padding: 10px 10px;
}

.nav a:hover 
{
text-decoration: none;
background: #9b59b6;
padding: 10px 10px;
}

ul.nav li a.current 
{
text-decoration: none;
background: #e74c3c;
padding: 10px 10px;
}

#footer
{
padding-top: 12px;
padding-bottom: 12px;
text-align: center;
background-color: black;
color: white;
font-style: italic;
font-weight: bold;
}
`;

const myblog = `
<center><div style="width: 75%; padding: 10px 10px; display: block; text-align: left;">
<h1>Really all in one</h1>
<p>
I got peeved with all those frameworks that promise wonders and deliver much less.
<br /><br />
This is my third instance of a simple CRUD web app - after PHP and Python - now Node.js.
<br /><br />
It really lives up to its name of "all in one" as this readme text and the css styling are all
tucked away in the server.js file!
<br /><br />
We no longer use MySQL or SQLite but MongoDB wihch is a kind of storage for JSON data.<br />
So instead of tables and rows we have collections and documents.

If we are fortunate enough that all documents share exactly the same keys (all rows share the same columns...)
 then we can export the data in SQL format.<br /><br />
You can use the little app as a JSON <==> SQL converter although there is no special concern for referential integrity.
 Bear in mind that MongoDB generates its own primary keys _id
<br /><br />
<br /><br />
</p>
</div></center>                   
`;

//##################################################
//#                                                #
//# DoHeader                                       #
//#                                                #
//##################################################

function DoHeader(myTitle)
{
return `
<center>
<h1>
${myTitle}
</h1>

<ul class="nav">
<li><a href="/">Home</a></li>
<li> <a href="/?menu=blog">readme</a></li>
<li> <a href="/?menu=list">list</a></li>
<li> <a href="/?menu=load">load JSON</a></li>
<li> <a href="/?menu=dump">dump JSON</a></li>
<li> <a href="/?menu=import">import SQL</a></li>
<li> <a href="/?menu=export">export SQL</a></li>
</ul>
</center>
`;
}

//##################################################
//#                                                #
//# DoFooter                                       #
//#                                                #
//##################################################

function DoFooter()
{
return `
<div id="footer">Say NO to bloatware</div>    
`;
}

//##################################################
//#                                                #
//# RenderPage                                     #
//#                                                #
//##################################################

function RenderPage(content, message='')
{
const header = DoHeader(title);
const footer = DoFooter();
var html =
`
<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<style>
${myStyle}
</style>
</head>
<body>
${header}
<p>${message}</p>
${content}
${footer}
</body>
</html>
`;
return html;
}

//##################################################
//#                                                #
//# main                                           #
//#                                                #
//##################################################

//app.use(express.static(__dirname + '/public')); // serve static files from /public directory

//##################################################
//#                                                #
//# POST route                                     #
//#                                                #
//##################################################

app.post('/', (req, res, next) => 
    {
    var d = new Date();
    var content = d.toUTCString() + '<hr>';

    if (req.body.button === 'import SQL file')
        {
        let thefile = req.files.foo;
        let store = __dirname+path.sep+'mydata.json';

         thefile.mv(store, function(err) 
            {
            if (err)
              return res.status(500).send(err);

            var fs = require('fs');
                
            var sqldata = fs.readFileSync(store, 'utf8');
            var lines = sqldata.split(";\n"); // can't handle ;
            var mydata =[];
            for (var i=0; i<lines.length; i++) 
                {
                if (lines[i].startsWith("insert"))
                    {
                    console.log(`processing ${lines[i]}`);
                    var row = {};
                    var result = sqlparser(lines[i]);
                    console.log(JSON.stringify(result, null, '\t'));
                    console.log('table='+result.source.name);
                    console.log('columns='+JSON.stringify(result.source.column));
                    table = result.source.name;
                    mycols = result.source.column;
                    myvals = result.values[0];
                    for (var j=0; j<mycols.length; j++) 
                        row[mycols[j].text] = myvals[j].text;
                    console.log(JSON.stringify(row));
                    mydata.push(row);
                    }
                }
                
            for (var i=0; i< mydata.length; i++) // MongoDB doesn't like strings as _id
                {
                 for (key in mydata[i]) 
                    {
                    if (key == '_id')
                        mydata[i]._id = ObjectID(mydata[i]._id);
                    }
                }
                
            db.collection(table).drop(function(err, delOK) 
                {
                //if (err) throw err; // keep quiet if deleting non existing table
                if (delOK) console.log("Collection deleted");

                db.collection(table).insertMany(mydata, (err, result) => 
                    {
                    if (err) return console.log(err)
                    content += result.insertedCount+ ' records inserted<br /><br />';
                    console.log(result);
                    res.send(RenderPage(content));
                    });
                });
            });
        }

    if (req.body.button === 'load JSON file')
        {
        table = req.body.table;
        
        if (table == '') // user didn't give us a table name - let's make one up
            {
            var charset = "abcdefghijklmnopqrstuvwxyz0123456789";    
            
            for (var i = 0; i < 15; i++)
                table += charset.charAt(Math.floor(Math.random() * charset.length));

            content += `<h4>table= no table name entered - just made one up ${table}</h4>`;
            }
            
        db.collection(table).drop(function(err, delOK) 
            {
            //if (err) throw err;
            if (delOK) console.log("Collection deleted");

            let thefile = req.files.foo;
            console.log (req.files.foo);
            let store = __dirname+path.sep+'mydata.json';
 
             thefile.mv(store, function(err) 
                {
                if (err)
                  return res.status(500).send(err);

                var fs = require('fs');
                var mydata = JSON.parse(fs.readFileSync(store, 'utf8'));
                
                for (var i=0; i< mydata.length; i++) // MongoDB doesn't like strings as _id
                    {
                     for (key in mydata[i]) 
                        {
                        if (key == '_id')
                            mydata[i]._id = ObjectID(mydata[i]._id);
                        }
                    }
                    
                db.collection(table).insertMany(mydata, (err, result) => 
                    {
                    if (err) return console.log(err)
                    content += result.insertedCount+ ' records inserted<br /><br />';
                    console.log(result);
                    res.send(RenderPage(content));
                    })
                });
            });
        }

    if (req.body.button === 'NEW')
         {
         table = req.body.table;
         delete req.body.button;
         delete req.body.table;
         delete req.body.row;
         
         console.log('saving to database' + JSON.stringify(req.body))
         db.collection(table).insertOne(req.body, (err, result) => 
            {
            if (err) return console.log(err)
            content += 'record created ' + JSON.stringify(req.body) + '<hr>' + JSON.stringify(result);

            console.log(`${content} on line 275`);
            res.send(RenderPage(content));
            })
         }

    else if (req.body.button === 'SAVE')
        {
        //var ObjectID = require('mongodb').ObjectID;
        var id = req.body.row;
        table = req.body.table;
        delete req.body.button;
        delete req.body.table;
        delete req.body.row;
          db.collection(table).replaceOne({'_id': ObjectID(id)}, req.body, (err, result) => 
            {
            if (err) return console.log(err)
            content += 'record replaced ' + JSON.stringify(req.body) + '<hr>' + JSON.stringify(result);
            //res.redirect('/');
            console.log(`${content} on line 293`);
            res.send(RenderPage(content));
            })
        }  
        
    else if (req.body.button === 'DELETE')
        {
        //var ObjectID = require('mongodb').ObjectID;
        var id = req.body.row;
        table = req.body.table;
        delete req.body.button;
        delete req.body.table;
        delete req.body.row;
        db.collection(table).deleteOne({'_id': ObjectID(id)}, (err, result) => 
            {
            if (err) return res.send(500, err)
            console.log(`${id} deleted`);
            content += `${id} record deleted ` + JSON.stringify(req.body) + '<hr>' + JSON.stringify(result);
            console.log(`${content} on line 311`);
            res.send(RenderPage(content));
            })
        }          
    })
       
//##################################################
//#                                                #
//# root route                                     #
//#                                                #
//##################################################

app.get('/', (req, res) => 
{
if (req.query.menu == 'blog')
    res.send(RenderPage(myblog));

else if (req.query.menu == 'import')
    {
    const myform = `
    <form "fileupload" action="/" method="post" enctype="multipart/form-data">
    <p style="text-align: center">
    <input type="file" name="foo" /> &nbsp;
    <input type="submit" name="button" value="import SQL file" />
    </p></form>
    `;
    res.send(RenderPage(myform));
    }
    
else if (req.query.menu == 'load')
    {
    const myform = `
    <form "fileupload" action="/" method="post" enctype="multipart/form-data">
    <p style="text-align: center">
    <input type="file" name="foo" /> &nbsp;
    <input type="text" placeholder="collection name" name="table" /> &nbsp;
    <input type="submit" name="button" value="load JSON file" />
    </p></form>
    `;
    res.send(RenderPage(myform));
    }

else if ("pick" in req.query)
    {
    table = req.query.pick;
    res.redirect('/');
    }

else if ((table == '') || (req.query.menu == 'list'))
    {
    db.listCollections().toArray(function(err, collInfos) 
        {
        //console.log(db);
        //console.log(collInfos);
        var content = `<div style="text-align: center"><h2>collections found in ${db.s.databaseName}</h2>`;
        for (var i=0; i < collInfos.length; i++)
            content += `<a href="/?pick=${collInfos[i].name}">${collInfos[i].name}</a><br />`;

        content += '<br /></div>';
        res.send(RenderPage(content));
       });
    }

else if (req.query.menu == 'demo') 
    {
    let mydata =
[
	{
		"name": "Fred Astaire",
		"age": 33,
		"quote": "dance on the rooftops at midnight"
	},
	{
		"name": "Miss Piggy",
		"age": 44,
		"quote": "talk to me porky"
	},
	{
		"name": "Kermit the Forg",
		"age": 55,
		"quote": "croak in my ear"
	},
	{
		"name": "Gonzo the Great",
		"age": 66,
		"quote": "Artificial intelligence is no match for natural stupidity."
	},
	{
		"name": "Fuzzy Bear",
		"age": 77,
		"quote": "one more joke"
	},
	{
		"name": "Guest Star",
		"age": 88,
		"quote": "they 're all nuts! *** REALLY ***"
	}
];        
    db.collection(table).insertMany(mydata, (err, result) => 
        {
        if (err) return console.log(err)
         console.log(result);
        res.redirect ('/');
        })
    }

else if (req.query.menu == 'dump')
    {
    res.setHeader('Content-disposition', `attachment; filename=${table}.json`);
    db.collection(table).find().toArray((err, result) => 
        {
        if (err) return console.log(err)

        res.end(JSON.stringify(result, null, '\t'));
        })
    }

else if (req.query.menu == 'export') 
    {
    var content = ``;
    res.setHeader('Content-disposition', `attachment; filename=${table}.sql`);
    db.collection(table).find().toArray((err, result) => 
        {
        if (err) return console.log(err)

        for (var i=0; i<result.length; i++) 
            { 
            var mykeys = Object.keys(result[i]);
            if (i == 0)
                {                
                content +=        
`drop table if exists ${table};
create table if not exists ${table} (\n`;

               for (var j=0; j<mykeys.length; j++) 
                    {
                    if (j != 0)
                        content += `,\n`;
                    content += `${mykeys[j]} text NULL`;
                    }
                content += `);\n`;
                }
            
            content += `insert into ${table} (`;
              for (var j=0; j<mykeys.length; j++) 
                    {
                    if (j != 0)
                        content += `, `;
                    content += mykeys[j];
                    }
            content += `) values (`;
        
                for (var j=0; j<mykeys.length; j++) 
                    {
                    var value = result[i][mykeys[j]];
                    console.log (`value = ${value}`);
                    if (j != 0)
                        content += `, `;
                    if (isNaN(value))
                        content += escapeString(value, {backslashSupported: true});
                    else
                        content += value;
                    }
                content += `);\n`;
                }
        res.end(content);
        })
    }

else if ("row" in req.query)
    {
    table = req.query.table;
    var condition = {};
    if (req.query.row != -1)
        condition = {'_id': ObjectID(req.query.row)};

    db.collection(table).find(condition).toArray((err, result) => 
        {
        if (err) 
            return console.log(err)

        content = '<table id="Schlumpf">';
        content += '<form class="edittable" action="/" name="myform" method="post">';
        var myrow = result[0];
         for (key in myrow) 
            {
            if (key != '_id')
                {
                if (req.query.row == -1)
                    content += `<tr><td>${key}</td><td><input type="text" name="${key}" value="" /></td></tr>`;
                else
                    content += `<tr><td>${key}</td><td><input type="text" name="${key}" value="${myrow[key]}" /></td></tr>`;
                }
            }

        content += `<tr><td><input type="hidden" name="row" value="${req.query.row}"/>`;
        content += `<input type="hidden" name="table" value="${req.query.table}"/>`;
        if (req.query.row == -1)
            content += `</td><td><input type="submit" name="button" value="NEW"/></td</tr>`;
        else
            {
            content += `<input type="submit" name="button" OnClick="return confirm('Are you sure you want to delete this record ?');"value="DELETE"/></td><td>`;
            content += `<input type="submit" name="button" value="SAVE"/></td</tr>`;
            }
        content += '</table></form>';
        res.send(RenderPage(content));
        })
    }
    
else
    {  
    var sorted = {};
    if ("order" in req.query)
        {
        if ("dir" in req.query)
            {
            if (req.query.dir == 'asc')
                sorted[req.query.order] =  1; // ascending
            else
                sorted[req.query.order] = -1; // descending
            }
        else
            sorted[req.query.order] =  1;  // ascending
        }
    else
        sorted['_id'] = -1;  // newest first
    
    db.collection(table).find().collation({'locale':'en'}).sort(sorted).toArray((err, result) => 
        {
        if (err) return console.log(err)

        if (result.length == 0)
            res.send(RenderPage(`<div style="text-align: center">collection ${table} is empty!<br /><br /><a href="/?menu=demo">Want to create some demo data ?</a><br /><br /></div>`));
        else
        {
        content = `<div id="tablehead"><h2>${table}</h2></div>`;
        content +=`<a href="/?table=${table}&row=-1">new item</a>`;
        content += `<div id="content"><table id="Schlumpf">`;
        var mykeys = Object.keys(result[0]);

        for (var i=0; i<result.length; i++) 
            { 
            if (i == 0)
                {                
                //console.log (mykeys);
                content += `<tr>`;
                for (var j=0; j<mykeys.length; j++) 
                    {
                    if ("dir" in req.query)
                        {
                        if (req.query.dir == 'asc')
                            content += `<th><a href="?table=view&order=${mykeys[j]}&dir=desc">${mykeys[j]}</a></th>`;
                        else
                            content += `<th><a href="?table=view&order=${mykeys[j]}&dir=asc">${mykeys[j]}</a></th>`;
                        }
                    else
                        content += `<th><a href="?table=view&order=${mykeys[j]}&dir=asc">${mykeys[j]}</a></th>`;

                    }
                content += `</tr>`;
                }
            
            content += `<tr>`;
            var myrow = result[i];
             for (key in myrow) 
                {
                if (key == '_id')
                    content += `<td><a href="/?table=${table}&row=${myrow[key]}">${myrow[key]}</a></td>`;
                else
                    content += `<td>${myrow[key]}</td>`;
                }
            content += `</tr>`;
            }

        content += `</table></div>`;
        res.send(RenderPage(content));
        }
        })
    }
})

app.listen(process.env.PORT || 3000, () => {
console.log('listening on 3000')
});
