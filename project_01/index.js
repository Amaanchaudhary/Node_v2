import express from 'express'
import users from './MOCK_DATA.json' with {type: 'json'};
import fs from 'fs';

const app = express()
const port = 8000

// Middleware - builtIn - plugins 
app.use(express.urlencoded({ extended: false })) // this will call the next in the stack after processing the request. in these case logs middleware is next if its not then routes 

// Middleware - custom - here i made the middleware for logs  
app.use((req, res, next) => {
  fs.appendFile("./logs.txt", `\n${Date.now()}: ${req.ip}: ${req.method}: ${req.path}`, (err) => {
    next(); //here there is no other middleware so next is routes
  })
})

//Routes
//HTML SSR
app.get('/users', (req, res) => {
  const html = `
    <ul>
    ${users.map(user => `<li>${user.first_name}</li>`).join("")}
    </ul>
  `
  res.send(html)
})

// REST
app.get('/api/users', (req, res) => {
  console.log(req.headers, "headers"); // to check request headers.  
  res.setHeader("X-myName", "Amaan");  // to set custom headers.
  return res.json(users)
})

// Create New User
app.post('/api/user', (req, res) => {
  //todo create new user 
  const body = req.body
  users.push({ ...body, id: users.length + 1 })
  fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
    if (err) {
      console.log(err, "Error writing to file");
      return res.status(500).json({ status: "error", message: "Failed to save user" })
    }

    return res.status(201).json({ status: "success", id: users.length })
  })
})

//this all routes are same just methods are different.
// app.get('/api/users/:id', (req, res) => {
//   const id = Number(req.params.id)
//   const filteredUser = users.find(user => user.id === id)
//   return res.json(filteredUser)
// })

// app.patch('/api/user/:id', (req, res) => {
//   //todo Edit the user with Id 
//   return res.json({ status: "pending" })
// })

// app.delete('/api/user/:id', (req, res) => {
//   //todo Delete the user with Id 
//   return res.json({ status: "pending" })
// })

app.route('/api/user/:id')
  .get((req, res) => {
    const id = Number(req.params.id)
    const filteredUser = users.find(user => user.id === id)
    if (filteredUser) {
      return res.json({ status: "200", message: "Success", data: filteredUser })
    } else {
      return res.json({ status: "404", message: `No User Found With id ${id}` })
    }
  })
  .patch((req, res) => {
    // Edit user with id
    const { id } = req.params
    const updates = req.body
    const updateKeys = Object.keys(req.body)

    const allowed_fields = ["first_name", "last_name", "email", "gender", "ip_address"]

    const isValid = updateKeys.every(field => allowed_fields.includes(field))

    if (!isValid) {
      return res.status(400).json({ status: "error", message: "Invalid fields in request body" });
    }

    const userIndex = users.findIndex(user => user.id === Number(id))

    if (userIndex === -1) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    users[userIndex] = { ...users[userIndex], ...updates }

    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
      if (err) {
        console.log(err, `Failed to update user with id ${id}`);
        return res.status(500).json({ status: "error", message: `Failed to update user with id ${id}` })
      }

      // Only respond after the file write is successful
      return res.status(200).json({
        status: "Success",
        message: `User Updated Successfully with id ${id}`,
        user: users[userIndex]
      })
    })
  })
  .delete((req, res) => {
    // Delete user with id
    const { id } = req.params
    const removedUser = users.find(user => user.id === Number(id))
    if (!removedUser) {
      return res.status(404).json({ status: "error", message: `User with id ${id} not found` });
    }

    const filteredUser = users.filter(user => user.id !== Number(id))

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(filteredUser), (err) => {
      if (err) {
        console.log(err, `Failed to delete user with id ${id}`);
        return res.status(500).json({ status: "error", message: `Failed to delete user with id ${id}` })
      }

      // Only respond after the file write is successful
      return res.status(200).json({
        status: "Success",
        message: `User Deleted Successfully with id ${id}`,
        user: removedUser
      })
    })
  })

app.listen(port, () => console.log("server is running on port " + port))