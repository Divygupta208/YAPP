const { ConversationsMessageFileImageInfo } = require("sib-api-v3-sdk");
const Group = require("../models/group");
const Invitation = require("../models/invitation");
const User = require("../models/user");
const UserGroup = require("../models/user-group");

exports.postCreateGroup = async (req, res, next) => {
  const { name, description, users } = req.body;
  const userId = req.user.id;

  try {
    const group = await Group.create({ name, description });

    const userGroupPromises = users.map((user) =>
      UserGroup.create({ userId: user, groupId: group.id, role: "member" })
    );

    userGroupPromises.push(
      UserGroup.create({ userId, groupId: group.id, role: "admin" })
    );

    await Promise.all(userGroupPromises);

    res.status(201).json({ group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const userGroups = await UserGroup.findAll({
      where: { userId: userId },
      include: {
        model: Group,
        attributes: ["id", "name", "description"],
      },
    });

    const groups = userGroups.map((userGroup) =>
      userGroup.Group.get({ plain: true })
    );
    console.log("Group:", groups);
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ error: "Error fetching groups" });
  }
};

exports.getGroupDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Assumed from middleware decoding token
    const { groupId } = req.params;

    // Check if the user is in the group and retrieve the role
    const currentUserGroup = await UserGroup.findOne({
      where: { userId, groupId },
    });

    const group = await Group.findOne({
      where: { id: groupId },
      raw: true,
    });

    if (!currentUserGroup) {
      return res
        .status(404)
        .json({ message: "User is not a member of this group" });
    }

    // Check if the current user is an admin
    const isAdmin = currentUserGroup.role === "admin";

    // Get all users in the group with their roles
    const groupMembers = await UserGroup.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ["id", "username", "email"] }],
      raw: true, // Simplifies the result, removing extra metadata
      nest: true,
    });

    console.log("groupmembers", groupMembers);

    // Format the group members list to include user info and role
    const members = groupMembers.map((member) => ({
      id: member.user.id,
      name: member.user.username,
      email: member.user.email,
      role: member.role,
    }));

    console.log("group", group);

    // Respond with both the admin status and members list
    return res.status(200).json({ isAdmin, members, group });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addMembersToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIds } = req.body; // Array of user IDs to be added to the group

  console.log("groupid", groupId);

  try {
    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get existing member records from UserGroup for this group
    const existingMembers = await UserGroup.findAll({
      where: { groupId },
      attributes: ["userId"],
    });
    const existingMemberIds = existingMembers.map((member) => member.userId);

    // Filter out userIds that are already in the group
    const newUserIds = userIds.filter(
      (userId) => !existingMemberIds.includes(userId)
    );

    // Create new entries in UserGroup with role 'member' for each new user
    const newMembers = newUserIds.map((userId) => ({
      userId,
      groupId,
      role: "member",
    }));

    await UserGroup.bulkCreate(newMembers);

    // Retrieve the updated list of members, including their roles
    const updatedMembers = await UserGroup.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ["id", "username", "email"] }],
      attributes: ["userId", "role"],
    });

    res.json({
      message: "Members added successfully",
      members: updatedMembers,
    });
  } catch (error) {
    console.error("Error adding members to group:", error);
    res.status(500).json({ message: "Unable to add members to group" });
  }
};

exports.postUpdateGroup = async (req, res, next) => {
  const { groupId } = req.params;
  const { name, description } = req.body;

  try {
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.name = name || group.name;
    group.description = description || group.description;
    await group.save();

    res
      .status(200)
      .json({ message: "Group information updated successfully", group });
  } catch (error) {
    console.error("Error updating group information:", error);
    res.status(500).json({ message: "Unable to update group information" });
  }
};

exports.removeGroupMember = async (req, res) => {
  const { groupId } = req.params;
  const { memberId } = req.body;

  try {
    const userGroup = await UserGroup.findOne({
      where: { groupId, userId: memberId },
    });

    if (!userGroup) {
      return res
        .status(404)
        .json({ message: "Member not found in this group" });
    }

    await userGroup.destroy();

    res.status(200).json({ message: "Member removed from group successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Failed to remove member from group" });
  }
};

exports.updateRole = async (req, res, next) => {
  const { groupId } = req.params;
  const { memberId, role } = req.body;

  try {
    const usergroup = await UserGroup.findOne({
      userId: memberId,
      groupId: groupId,
      role: role,
    });

    if (!usergroup) {
      return res
        .status(404)
        .json({ message: "Member not found in this group" });
    }

    usergroup.role = role || usergroup.role;
    await usergroup.save();

    res.status(200).json({ message: "Role updated successfully", usergroup });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
};
// exports.getGroupMembers = async (req, res) => {
//   try {
//     const { groupId } = req.params;

//     const members = await UserGroup.findAll({
//       where: { groupId },
//       include: [
//         {
//           model: User,
//           attributes: ["id", "username", "email"],
//         },
//       ],
//     });

//     res.status(200).json(members);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching group members" });
//   }
// };

// exports.inviteUser = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { invitedUserId } = req.body;
//     const userId = req.user.id;

//     const userGroup = await UserGroup.findOne({ where: { userId, groupId } });
//     if (!userGroup) {
//       return res.status(403).json({ error: "You are not part of this group." });
//     }

//     const invite = await Invitation.create({
//       groupId,
//       invitedUserId,
//       invitedBy: userId,
//     });

//     res.status(201).json({ invite });
//   } catch (error) {
//     res.status(500).json({ error: "Error sending invite" });
//   }
// };

// exports.acceptInvite = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const userId = req.user.id;

//     const invite = await Invitation.findOne({
//       where: { groupId, invitedUserId: userId },
//     });
//     if (!invite) {
//       return res
//         .status(403)
//         .json({ error: "You have not been invited to this group." });
//     }

//     await UserGroup.create({ userId, groupId });

//     await invite.destroy();

//     res.status(200).json({ message: "Successfully joined the group." });
//   } catch (error) {
//     res.status(500).json({ error: "Error joining group" });
//   }
// };
