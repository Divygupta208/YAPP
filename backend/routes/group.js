const express = require("express");

const router = express.Router();
const groupController = require("../controllers/group");

router.post("/create", groupController.postCreateGroup);
router.get("/usergroups", groupController.getUserGroups);
router.get("/:groupId/details", groupController.getGroupDetails);
router.post("/:groupId/add-users", groupController.addMembersToGroup);
router.patch("/:groupId/update", groupController.postUpdateGroup);
router.delete("/:groupId/remove-member", groupController.removeGroupMember);
router.put("/:groupId/update-member-role", groupController.updateRole);
module.exports = router;
