const { Client } = require("@line/bot-sdk");
const { channelAccessToken } = require("../config");
const {
  AddMember,
  checkIfUserExists,
  updateMemberData,
} = require("./component/BotFunc/userController");
const { checkIfGroup } = require("./component/BotFunc/groupController");
const {
  handleUserCheckMoney,
  handleUserDetails,
  handleTestDetails,
  handleSetCockCommand,
  handleBankAccountDetails,
  handleSetHiloCommand,
  handleWithdrawMoney,
  handleCashCustomer,
  handleTopUpCredit,
  handleUpdateAdminRole,
  handleAddAllMembers,
  handleSetGroupCommand,
} = require("./component/HandleCommand/botFuncCommand");

const client = new Client({ channelAccessToken });

async function handleEvent(event) {
  if (event.source.type === "group" || event.source.type === "room") {
    if (event.type === "memberJoined") {
      return handleMemberJoined(event);
    }

    if (event.type === "memberLeft") {
      return handleMemberLeft(event);
    }

    if (event.type === "message" && event.message.type === "text") {
      return handleTextMessage(event);
    }
  }

  return null;
}

// Handle member join
async function handleMemberJoined(event) {
  const groupId = event.source.groupId;
  const newUserIds = event.joined.members.map((member) => member.userId);

  const isGroup = await checkIfGroup(groupId);
  if (!isGroup) {
    const isGroupMessage = `กรุณาเพิ่มกลุ่ม`;
    await client.replyMessage(event.replyToken, isGroupMessage);
  }

  for (const userId of newUserIds) {
    try {
      const member = await client.getGroupMemberProfile(groupId, userId);
      const isExistingMember = await checkIfUserExists(userId);

      if (isExistingMember) {
        await updateMemberData(userId, groupId, { status: true });
        const welcomeBackMessage = {
          type: "flex",
          altText: `ยินดีต้อนรับกลับคุณ ${member.displayName} สู่กลุ่ม DTG! ข้อมูลของคุณได้รับการอัปเดตแล้ว.`,
          contents: {
            type: "bubble",
            hero: {
              type: "image",
              url: member.pictureUrl,
              size: "full",
              aspectRatio: "20:13",
              aspectMode: "cover",
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `ยินดีต้อนรับกลับ ${member.displayName}`,
                  weight: "bold",
                  size: "xl",
                  color: "#1DB446",
                  align: "center",
                },
                {
                  type: "text",
                  text: "สู่กลุ่ม DTG!",
                  size: "md",
                  color: "#555555",
                  align: "center",
                },
                {
                  type: "separator",
                  margin: "md",
                },
              ],
            },
          },
        };
        await client.replyMessage(event.replyToken, welcomeBackMessage);
      } else {
        await AddMember(member);
        const replyMessage = {
          type: "flex",
          altText: `ยินดีต้อนรับคุณ ${member.displayName} สู่กลุ่ม DTG`,
          contents: {
            type: "bubble",
            hero: {
              type: "image",
              url: member.pictureUrl,
              size: "full",
              aspectRatio: "20:13",
              aspectMode: "cover",
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `ยินดีต้อนรับคุณ ${member.displayName}`,
                  weight: "bold",
                  size: "xl",
                  color: "#1DB446", // สีเขียวสดใส
                  align: "center",
                },
                {
                  type: "text",
                  text: "สู่กลุ่ม DTG!",
                  size: "md",
                  color: "#555555",
                  align: "center",
                },
                {
                  type: "separator",
                  margin: "md",
                },
              ],
            },
          },
        };
        await client.replyMessage(event.replyToken, replyMessage);
      }
    } catch (error) {
      console.error("Error processing new user:", error);
    }
  }
}

// Handle member leave
async function handleMemberLeft(event) {
  const groupId = event.source.groupId;
  const leavingUserIds = event.left.members.map((member) => member.userId);

  for (const userId of leavingUserIds) {
    try {
      await updateMemberData(userId, groupId, { status: false });
      console.log(`User ${userId} status updated to false.`);
    } catch (error) {
      console.error("Error processing leaving user:", error);
    }
  }
}

// Handle text message
async function handleTextMessage(event) {
  const userMessage = event.message.text.trim();
  console.log("User Message : " + userMessage);

  if (userMessage.toLowerCase().startsWith("setgroup#")) {
    return handleSetGroupCommand(event, userMessage);
  }

  if (userMessage === "เพิ่มทั้งหมด") {
    return handleAddAllMembers(event);
  }

  if (
    userMessage.toLowerCase().startsWith("@") &&
    userMessage.includes("//admin")
  ) {
    return handleUpdateAdminRole(event, userMessage, { admin: 1 });
  }

  if (
    userMessage.toLowerCase().startsWith("@") &&
    userMessage.includes("///admin")
  ) {
    return handleUpdateAdminRole(event, userMessage, { admin: 2 });
  }

  if (userMessage.toLowerCase().startsWith("set#เปิด#ไฮโล")) {
    return handleSetHiloCommand(event, "เปิด");
  }

  if (userMessage.toLowerCase().startsWith("set#ปิด#ไฮโล")) {
    return handleSetHiloCommand(event, "ปิด");
  }

  if (userMessage.toLowerCase().startsWith("set#เปิด#ไก่ชน")) {
    return handleSetCockCommand(event, "เปิด");
  }

  if (userMessage.toLowerCase().startsWith("set#ปิด#ไก่ชน")) {
    return handleSetCockCommand(event, "ปิด");
  }

  if (userMessage.toLowerCase() === "บช") {
    return handleBankAccountDetails(event);
  }

  if (userMessage.toLowerCase() === "เทส") {
    return handleTestDetails(event);
  }

  if (userMessage.toLowerCase() === "cdd") {
    return handleUserDetails(event);
  }

  if (userMessage.toLowerCase() === "c") {
    return handleUserCheckMoney(event);
  }

  if (userMessage.startsWith("++")) {
    return handleTopUpCredit(event, userMessage);
  }

  if (userMessage.startsWith("+")) {
    return handleCashCustomer(event, userMessage);
  }

  if (userMessage.startsWith("-")) {
    return handleWithdrawMoney(event, userMessage);
  }

  return null;
}

module.exports = { handleEvent };
