const { Client } = require("@line/bot-sdk");
const { channelAccessToken } = require("../config");
const {
  AddMember,
  checkIfUserExists,
  updateMemberData,
} = require("./component/BotFunc/userController");
const {
  checkIfGroupSub,
  checkIfGroupMain,
} = require("./component/BotFunc/groupController");
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
  handleSetSubGroupCommand,
  handleOpenIndayCommand,
  handleCloseIndayCommand,
  handleOpenMainPlayCommand,
  handleCloseMainPlayCommand,
  handleSetOdds,
  handleCloseSetOdds,
  handleUserBet,
  handleConfirmResultCommand,
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

// เข้าร่วมกลุ่ม
async function handleMemberJoined(event) {
  const groupId = event.source.groupId;
  const newUserIds = event.joined.members.map((member) => member.userId);

  const isGroup = await checkIfGroupMain(groupId);
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
        await AddMember(member, userId, groupId);
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

// ออกจากกลุ่ม
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

// คำสั่งต่างๆ
async function handleTextMessage(event) {
  const groupId = event.source.groupId;
  const isGroup = await checkIfGroupMain(groupId);
  const isSubGroup = await checkIfGroupSub(groupId);
  const userMessage = event.message.text.trim();

  console.log("userMessage : " + userMessage);

  // เพิ่มกลุ่มครั้งแรก กลุ่มหลัก
  if (userMessage.toLowerCase().startsWith("setgroup#")) {
    return handleSetGroupCommand(event, userMessage);
  }

  // เพิ่มกลุ่มครั้งแรก กลุ่มหลังบ้าน
  if (userMessage.toLowerCase().startsWith("setsubgroup#")) {
    return handleSetSubGroupCommand(event, userMessage);
  }

  // แสดงยอดเงินคงเหลือ
  if (userMessage.toLowerCase() === "c") {
    return handleUserCheckMoney(event);
  }

  if (isGroup || isSubGroup) {
    // เพิ่มสมาชิกทั้งหมดที่มีอยู่ในกลุ่มหลัก ยังใช้ไม่ได้
    if (userMessage === "เพิ่มทั้งหมด") {
      return handleAddAllMembers(event);
    }

    // เปิดใช้งานระบบไฮโล
    if (userMessage.toLowerCase().startsWith("set#เปิด#ไฮโล")) {
      return handleSetHiloCommand(event, "เปิด");
    }

    // ปิดใช้งานระบบไฮโล
    if (userMessage.toLowerCase().startsWith("set#ปิด#ไฮโล")) {
      return handleSetHiloCommand(event, "ปิด");
    }

    // เปิดใช้งานระบบไก่ชน
    if (userMessage.toLowerCase().startsWith("set#เปิด#ไก่ชน")) {
      return handleSetCockCommand(event, "เปิด");
    }

    // ปิดใช้งานระบบไก่ชน
    if (userMessage.toLowerCase().startsWith("set#ปิด#ไก่ชน")) {
      return handleSetCockCommand(event, "ปิด");
    }

    // แจ้งเลขบัญชี
    if (userMessage === "บช") {
      return handleBankAccountDetails(event);
    }

    // เทส
    if (userMessage === "เทส") {
      return handleTestDetails(event);
    }

    // เทส2
    if (userMessage.toLowerCase() === "cdd") {
      return handleUserDetails(event);
    }

    // เพิ่มเงิน แบบเครดิต
    if (userMessage.includes("=++")) {
      return handleTopUpCredit(event, userMessage);
    }

    // เพิ่มเงิน แบบเงินสด
    if (userMessage.includes("=+")) {
      return handleCashCustomer(event, userMessage);
    }

    // ถอนเงิน
    if (userMessage.includes("=-")) {
      return handleWithdrawMoney(event, userMessage);
    }

    // คำสั่งเฉพาะกลุ่มหลัก
    if (isGroup) {
      // เพิ่มแอดมินสำหรับกลุ่มหลัก
      if (
        userMessage.toLowerCase().startsWith("@") &&
        userMessage.includes("+admin")
      ) {
        return handleUpdateAdminRole(event, userMessage, { admin: 1 }); // กำหนดเป็นแอดมิน
      }

      // ลบแอดมินสำหรับกลุ่มหลัก
      if (
        userMessage.toLowerCase().startsWith("@") &&
        userMessage.includes("-admin")
      ) {
        return handleUpdateAdminRole(event, userMessage, { admin: 2 }); // กำหนดเป็นสมาชิกทั่วไป
      }

      // เปิดบ้านไก่ชน
      if (userMessage.toLowerCase() === "z") {
        return await handleOpenIndayCommand(event);
      }

      // ปิดบ้าน
      if (userMessage.toLowerCase() === "zz") {
        return await handleCloseIndayCommand(event);
      }

      // เปิดรอบเล่นหลัก
      if (userMessage.toLowerCase() === "o") {
        return await handleOpenMainPlayCommand(event);
      }

      // คำสั่งเปิดราคา "ตร" และ "ง" หรือ "ด"
      if (userMessage.toLowerCase().startsWith("ตร/")) {
        const parts = userMessage.split("/");
        if (
          parts.length === 2 &&
          isFinite(parts[1]) &&
          parseFloat(parts[1]) > 0
        ) {
          const maxAmount = parts[1];
          return await handleSetOdds(event, { type: "ตร", maxAmount });
        } else {
          const replyMessage = {
            type: "text",
            text: "กรุณาระบุจำนวนเงินเดิมพันสูงสุด!!!",
          };

          return await client.replyMessage(event.replyToken, replyMessage);
        }
      }

      // คำสั่งเปิดราคา "ด" หรือ "ง" เช่น ด8/50000
      if (
        (userMessage.toLowerCase().startsWith("ด") ||
          userMessage.toLowerCase().startsWith("ง")) &&
        userMessage.includes("/")
      ) {
        const parts = userMessage.split("/");
        if (
          parts.length === 2 &&
          isFinite(parts[1]) &&
          parseFloat(parts[1]) > 0
        ) {
          const type = userMessage.toLowerCase().startsWith("ด") ? "ด" : "ง";
          const odds = parts[0].substring(1); // อัตราต่อรองหลังตัวอักษรนำหน้า
          const maxAmount = parts[1];

          if (!isFinite(odds) || parseFloat(odds) <= 0) {
            const replyMessage = {
              type: "text",
              text: "กรุณาระบุอัตราต่อรองให้ถูกต้อง เช่น ด8/50000 หรือ ง8/50000",
            };
            return await client.replyMessage(event.replyToken, replyMessage);
          }

          return await handleSetOdds(event, { type, odds, maxAmount });
        } else {
          const replyMessage = {
            type: "text",
            text: "กรุณาระบุจำนวนเงินเดิมพันสูงสุด!!!",
          };
          return await client.replyMessage(event.replyToken, replyMessage);
        }
      }

      // คำสั่งเปิดราคา "สด" หรือ "สง"
      if (
        userMessage.toLowerCase().startsWith("สด/") ||
        userMessage.toLowerCase().startsWith("สง/")
      ) {
        const parts = userMessage.split("/");
        if (
          parts.length === 2 &&
          isFinite(parts[1]) &&
          parseFloat(parts[1]) > 0
        ) {
          const [type, maxAmount] = parts;
          return await handleSetOdds(event, { type, maxAmount });
        } else {
          const replyMessage = {
            type: "text",
            text: "กรุณาระบุจำนวนเงินเดิมพันสูงสุด!!!",
          };

          return await client.replyMessage(event.replyToken, replyMessage);
        }
      }

      // คำสั่งเดิมพัน  "ด" หรือ "ง" เช่น ด50000
      if (
        userMessage.toLowerCase().startsWith("ด") ||
        userMessage.toLowerCase().startsWith("ง")
      ) {
        const type = userMessage.toLowerCase().startsWith("ด") ? "ด" : "ง";
        const amount = parseFloat(userMessage.substring(1));

        try {
          const userbet = await handleUserBet(event, { type, amount });

          return await client.replyMessage(event.replyToken, userbet);
        } catch (error) {
          const errorMessage = {
            type: "text",
            text: "เกิดข้อผิดพลาดในการลงเดิมพัน กรุณาลองใหม่อีกครั้ง",
          };
          return await client.replyMessage(event.replyToken, errorMessage);
        }
      }

      // ปิดรอบเล่นย่อย
      if (userMessage.toLowerCase() === "st") {
        return await handleCloseSetOdds(event);
      }

      // ปิดรอบเล่นหลัก
      if (userMessage.toLowerCase() === "x") {
        return await handleCloseMainPlayCommand(event);
      }

      let selectedResult = null;

      // สรุปผล
      if (userMessage.toLowerCase().startsWith("s")) {
        const result = userMessage.toLowerCase().slice(1);
        selectedResult = result;

        // ตรวจสอบเฉพาะตัวอักษรที่อนุญาต
        if (["ด", "ง", "ส"].includes(result)) {
          return await handleConfirmResultCommand(event, result);
        } else {
          console.log("คำสั่งไม่ถูกต้อง");
        }
      }

      // ยืนยันผล
      if (userMessage.toLowerCase() === "Y") {
        if (selectedResult) {
          return await updateResultConfirmation(event);
          selectedResult = null;
        } else {
          const replyMessage = {
            type: "text",
            text: "กรุณาเลือกผลลัพธ์ก่อนทำการยืนยัน (เช่น 'sด', 'sง', หรือ 'ส')",
          };
          return await client.replyMessage(event.replyToken, replyMessage);
        }
      }

      // ย้อนผล
      if (userMessage.toLowerCase().startsWith("return#")) {
        return "";
      }
    }
  }
  return null;
}

module.exports = { handleEvent };
