const express = require("express");
const usersController = require("../controllers/users");


const router = express.Router();

router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.patch('/update/:email', usersController.updateUser);

// router.get("/active/:token", usersController.active);



// router.delete('/delete/:id', usersController.delete);


// router.post("/logout/:id", usersController.logout);


// router.post('/tokenrefresh', usersController.tokenrefresh);
module.exports = router;