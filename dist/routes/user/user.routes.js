"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const user_controller_1 = require("../../controllers/user/user.controller");
const router = (0, express_1.Router)();
router.get("/search", auth_middleware_1.default, user_controller_1.searchUsers);
router.post("/friend-requests/:userId", auth_middleware_1.default, user_controller_1.sendFriendRequest);
router.get("/pending-requests", auth_middleware_1.default, user_controller_1.getPendingRequests);
router.post("/friend-requests/:requestId/accept", auth_middleware_1.default, user_controller_1.acceptFriendRequest);
router.post("/friends/:userId", auth_middleware_1.default, user_controller_1.addFriend);
router.post("/friend-requests/:requestId/reject", auth_middleware_1.default, user_controller_1.rejectFriendRequest);
router.get("/friends", auth_middleware_1.default, user_controller_1.getFriends);
exports.default = router;
