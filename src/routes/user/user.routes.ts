import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { acceptFriendRequest, addFriend, getFriends, getPendingRequests, rejectFriendRequest, searchUsers, sendFriendRequest } from "../../controllers/user/user.controller";

const router = Router();

router.get("/search", authMiddleware, searchUsers);
router.post("/friend-requests/:userId", authMiddleware, sendFriendRequest);
router.get("/pending-requests", authMiddleware, getPendingRequests);
router.post("/friend-requests/:requestId/accept", authMiddleware, acceptFriendRequest);
router.post("/friends/:userId", authMiddleware, addFriend);
router.post("/friend-requests/:requestId/reject", authMiddleware, rejectFriendRequest);
router.get("/friends", authMiddleware, getFriends);

export default router;