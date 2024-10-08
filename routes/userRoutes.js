const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.route("/").get(userController.getAllUsers);
router.route("/me").get(authController.protect, userController.getUser);

router.route("/delete/:id").delete(userController.deleteUser);

module.exports = router;
