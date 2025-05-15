import { User } from "../Models/user.js";
import mongoose from "mongoose";

export const createNewUser = async (req, res) => {
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
    return res
      .status(201)
      .json({
        status: "Success",
        message: "User Created Successfully",
        id: result._id,
      });
  } catch (err) {
    console.log(err, "Error writing to file");
    return res.status(500).json({ status: "error", message: err?.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allDbUsers = await User.find({});
    return res.status(200).json(allDbUsers);
  } catch (err) {
    console.log(err, "error");
    return res.status(500).json({ status: "error", message: err?.message });
  }
};

export const getUserById = async (req, res) => {
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
};

export const updateUserById = async (req, res) => {
  // Edit user with id
  try {
    const { id } = req.params;
    const updates = req.body;
    const updateKeys = Object.keys(req.body);

    const allowed_fields = ["first_name", "last_name", "email", "gender"];

    const isValid = updateKeys.every((field) => allowed_fields.includes(field));

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
};

export const deleteUserById = async (req, res) => {
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
};
