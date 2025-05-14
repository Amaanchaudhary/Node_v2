import express from "express";
// import users from './MOCK_DATA.json' with {type: 'json'};
import fs from "fs";
import mongoose from "mongoose";

const app = express();
const port = 8000;

// Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/UserDoc")
  .then(() => console.log("DB connected"));

// Schema
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // Allowed values
      set: (v) => v.toLowerCase(), // <== This handles case-insensitive input
    },
  },
  { timestamps: true }
);

//model
const User = mongoose.model("User", userSchema);

// Middleware - builtIn - plugins
app.use(express.urlencoded({ extended: false })); // this will call the next in the stack after processing the request. in these case logs middleware is next if its not then routes

// Middleware - custom - here i made the middleware for logs
app.use((req, res, next) => {

  const now = new Date().toLocaleString(); // Converts to readable format like '5/14/2025, 10:30:15 AM'
  const log = `\n[${now}] ${req.ip} ${req.method} ${req.path}`;

  fs.appendFile(
    "./logs.txt",
    log,
    (err) => {
      if(err){
        console.log("error writing log file", err);
      }
      next(); //here there is no other middleware so next is routes
    })
});

//Routes
//HTML SSR
app.get("/users", async (req, res) => {
  try {
    const allDbUsers = await User.find({});
    const html = `
    <ul>
    ${allDbUsers
        .map((user) => `<li>${user.first_name} - ${user.email}</li>`)
        .join("")}
    </ul>
  `;
    res.send(html);
  } catch (err) {
    console.log(err, "Error");
    return res.status(500).json({ status: "error", message: err?.message });
  }
});

// REST
app.get("/api/users", async (req, res) => {
  try {
    const allDbUsers = await User.find({});

    // console.log(req.headers, "headers"); // to check request headers.
    // res.setHeader("X-myName", "Amaan"); // to set custom headers.
    return res.status(200).json(allDbUsers);
  } catch (err) {
    console.log(err, "error");
    return res.status(500).json({ status: "error", message: err?.message });
  }
});

// Create New User
app.post("/api/user", async (req, res) => {
  //todo create new user
  const { last_name, first_name, email, gender } = req.body;

  if (!req.body || !first_name || !email || !gender) {
    return res
      .status(400)
      .json({ status: "error", message: "All Fields are required" });
  }

  // users.push({ ...body, id: users.length + 1 })
  // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
  //   if (err) {
  //     console.log(err, "Error writing to file");
  //     return res.status(500).json({ status: "error", message: "Failed to save user" })
  //   }
  //   return res.status(201).json({ status: "success", id: users.length })
  // })

  try {
    const result = await User.create({
      first_name,
      last_name,
      gender,
      email,
    });
    console.log(result, "result");
    return res
      .status(201)
      .json({ status: "Success", message: "User Created Successfully" });
  } catch (err) {
    console.log(err, "Error writing to file");
    return res.status(500).json({ status: "error", message: err?.message });
  }
});

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

app
  .route("/api/user/:id")
  .get(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (user) {
        return res.json({
          status: "200",
          message: "Success",
          data: user,
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: `No User Found With id ${req.params.id}`,
        });
      }
    } catch (err) {
      console.log(err, "error");
      return res.status(500).json({ status: "error", message: err?.message });
    }
  })
  .patch(async (req, res) => {
    // Edit user with id
    try {
      const { id } = req.params;
      const updates = req.body;
      const updateKeys = Object.keys(req.body);

      const allowed_fields = ["first_name", "last_name", "email", "gender"];

      const isValid = updateKeys.every((field) =>
        allowed_fields.includes(field)
      );

      if (!isValid) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid fields in request body" });
      }

      // ✅ Check if ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID format",
        });
      }

      // ✅ { new: true } returns updated document
      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true, // makes enum and other schema validations run
      });

      if (!updatedUser) {
        return res.status(404).json({
          status: "error",
          message: `No user found with id ${id}`,
        });
      }

      return res.status(200).json({
        status: "Success",
        message: `User Updated Successfully with id ${id}`,
        data: updatedUser,
      });
    } catch (err) {
      console.log(err, "error");
      return res.status(500).json({ status: "error", message: err?.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.params;

      // ✅ Check if ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID format",
        });
      }

      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json({
          status: "error",
          message: `User with id ${id} not found`,
        });
      }

      return res.status(200).json({
        status: "success",
        message: `User deleted successfully with id ${id}`,
        user: deletedUser,
      });

    } catch (err) {
      console.error("Delete Error:", err);
      return res.status(500).json({
        status: "error",
        message: err?.message || "Internal server error",
      });
    }
  });

app.listen(port, () => console.log("server is running on port " + port));
