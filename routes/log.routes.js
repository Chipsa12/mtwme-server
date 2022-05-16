const Router = require("express");
const router = new Router()
const authMiddleware = require("../middleware/auth.middleware")
const logController = require("../controllers/logController")

router.post('/', authMiddleware, logController.createLog)
router.get('/', authMiddleware, logController.getLog)

module.exports = router
