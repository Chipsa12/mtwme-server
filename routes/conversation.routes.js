const Router = require("express");
const router = new Router()
const conversationController = require("../controllers/conversationController")
const authMiddleware = require("../middleware/auth.middleware")

router.post('/', authMiddleware, conversationController.createConversation)
router.get('/', authMiddleware, conversationController.getConversations)

module.exports = router
