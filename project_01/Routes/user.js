import express, { Router } from "express";
import {
  createNewUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from "../Controllers/user.js";

const router = Router();

//HTML SSR
// router.get("/users", async (req, res) => {
//   try {
//     const allDbUsers = await User.find({});
//     const html = `
//     <ul>
//     ${allDbUsers
//       .map((user) => `<li>${user.first_name} - ${user.email}</li>`)
//       .join("")}
//     </ul>
//   `;
//     res.send(html);
//   } catch (err) {
//     console.log(err, "Error");
//     return res.status(500).json({ status: "error", message: err?.message });
//   }
// });

// REST
router.route("/").post(createNewUser).get(getAllUsers);

router
  .route("/:id")
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

export default router;
