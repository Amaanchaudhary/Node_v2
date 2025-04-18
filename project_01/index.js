import express from 'express'
import users from './MOCK_DATA.json' with {type: 'json'};

const app = express()
const port = 8000

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
  return res.json(users)
})

app.post('/api/user', (req, res) => {
  //todo create new user 
  return res.json({ status: "pending" })
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

app.route('/api/users/:id')
  .get((req, res) => {
    const id = Number(req.params.id)
    const filteredUser = users.find(user => user.id === id)
    return res.json({ status: "200", message: "Success", data: filteredUser })
  })
  .patch((req, res) => {
    return res.json({ status: "pending Patch" })
  })
  .delete((req, res) => {
    return res.json({ status: "pending Delete" })
  })

app.listen(port, () => console.log("server is running on port " + port))