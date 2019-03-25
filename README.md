# AllInOneNode
All In One Node.js
.<br />
I got peeved with all those frameworks that promise wonders and deliver much less. .<br />
.<br />
This is my third instance of a simple CRUD web app - after PHP and Python - now Node.js. .<br />
.<br />
It really lives up to its name of "all in one" as this readme text and the css styling are all tucked away in the server.js file! .<br />
.<br />
We no longer use MySQL or SQLite but MongoDB wihch is a kind of storage for JSON data..<br />
So instead of tables and rows we have collections and documents. If we are fortunate enough that all documents share exactly the same keys (all rows share the same columns...) then we can export the data in SQL format..<br />

You can use the little app as a JSON <==> SQL converter although there is no special concern for referential integrity. Bear in mind that MongoDB generates its own primary keys _id .<br />
.<br />
You know the drill.<br />
Install node.js.<br />
Insall npm.<br />
Install MongoDB.<br />
create a database mydb.<br />
.<br />
npm install.<br />
nodemon server.js.<br />
point your browser to localhost:3000.<br />
click on "create some demo data".<br />
