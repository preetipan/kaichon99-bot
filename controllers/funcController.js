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
  handleResultConfirmation,
  handleReturnConfirmResultCommand,
  handleReturnResultConfirmation,
  handleUserPlayInRound,
  handleCalTorLong,
  handleCalPlus,
  handleUserChecks,
  handleSumallinday,
} = require("./component/HandleCommand/botFuncCommand");

const client = new Client({ channelAccessToken });

const pendingCommands = new Map();

async function handleEvent(event) {

  // ตรวจสอบข้อความที่ผู้ใช้ส่งมา
  if (event.message && event.message.type === "image" && event.source && event.source.type !== "group") {
    return handleUserChecks(event);
  }

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
            size: "kilo", // ทำให้ bubble มีขนาดเล็กลง
            hero: {
              type: "image",
              url: member.pictureUrl,
              size: "full",
              aspectRatio: "4:3", // ปรับขนาดรูปให้เหมาะสม
              aspectMode: "cover",
            },
            body: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: `ยินดีต้อนรับกลับ ${member.displayName}`,
                  weight: "bold",
                  size: "lg", // ขนาดข้อความเล็กลง
                  color: "#1DB446",
                  align: "center",
                },
                {
                  type: "text",
                  text: "สู่กลุ่ม TAIGA689",
                  size: "sm", // ข้อความรองลงขนาดเล็กลง
                  color: "#555555",
                  align: "center",
                },
                {
                  type: "separator",
                  margin: "lg", // เพิ่มพื้นที่ว่างระหว่างองค์ประกอบ
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
          altText: `ยินดีต้อนรับคุณ ${member.displayName} สู่กลุ่ม Taiga689`,
          contents: {
            type: "bubble",
            size: "kilo",
            hero: {
              type: "image",
              url: member.pictureUrl,
              size: "full",
              aspectRatio: "4:3",
              aspectMode: "cover",
            },
            body: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: `ยินดีต้อนรับคุณ ${member.displayName}`,
                  weight: "bold",
                  size: "lg",
                  color: "#1DB446",
                  align: "center",
                },
                {
                  type: "text",
                  text: "สู่กลุ่ม TAIGA689",
                  size: "sm",
                  color: "#555555",
                  align: "center",
                },
                {
                  type: "separator",
                  margin: "lg",
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

    // เปิดใช้งานระบบไฮโล ยังใช้ไม่ได้
    if (userMessage.toLowerCase().startsWith("set#เปิด#ไฮโล")) {
      return handleSetHiloCommand(event, "เปิด");
    }

    // ปิดใช้งานระบบไฮโล ยังใช้ไม่ได้
    if (userMessage.toLowerCase().startsWith("set#ปิด#ไฮโล")) {
      return handleSetHiloCommand(event, "ปิด");
    }

    // เปิดใช้งานระบบไก่ชน ยังใช้ไม่ได้
    if (userMessage.toLowerCase().startsWith("set#เปิด#ไก่ชน")) {
      return handleSetCockCommand(event, "เปิด");
    }

    // ปิดใช้งานระบบไก่ชน ยังใช้ไม่ได้
    if (userMessage.toLowerCase().startsWith("set#ปิด#ไก่ชน")) {
      return handleSetCockCommand(event, "ปิด");
    }

    // แจ้งเลขบัญชี
    if (userMessage === "บช") {
      return handleBankAccountDetails(event);
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
      // เพิ่มแอดมิน
      if (userMessage.toLowerCase().includes("+admin")) {
        console.log("Adding admin");
        return handleUpdateAdminRole(event, { admin: 1 });
      }

      // ลบแอดมิน
      if (userMessage.toLowerCase().includes("-admin")) {
        console.log("Removing admin");
        return handleUpdateAdminRole(event, { admin: 2 });
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
        pendingCommands.delete("2");
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

          // กำหนดค่าที่อนุญาต
          const allowedOdds = [
            "8.5", "8", "7.5", "7", "6.5", "6", "5.5", "5", "4.5", "4",
            "3.5", "3", "2.5", "2", "1.5", "1", "10", "100"
          ];

          // ตรวจสอบว่าอัตราต่อรองเป็นตัวเลขหรืออักษรที่ถูกต้อง
          if (!allowedOdds.includes(odds)) {
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
      if (userMessage.toLowerCase() === "ปด") {
        return await handleCloseSetOdds(event);
      }

      // ปิดรอบเล่นหลัก
      if (userMessage.toLowerCase() === "x") {
        return await handleCloseMainPlayCommand(event);
      }

      // สรุปผล
      if (userMessage.toLowerCase().startsWith("s")) {
        const result = userMessage.slice(1); // Extracts "ด", "ง", "ส"

        // ตรวจสอบเฉพาะตัวอักษรที่อนุญาต
        if (["ด", "ง", "ส"].includes(result)) {
          pendingCommands.set("1", result); // เก็บคำสั่ง "sด", "sง", "ส"
          return await handleConfirmResultCommand(event, result);
        } else {
          console.log("คำสั่งไม่ถูกต้อง");
          return;
        }
      }

      // ยืนยันคำสั่ง
      if (userMessage.toLowerCase() === "y") {
        // กรณีที่เป็นการยืนยันการอัพเดตยอด
        if (pendingCommands.has("1")) {
          const selectedResult = pendingCommands.get("1");
          const returnd_status = pendingCommands.get("2");
          let status
          if (!returnd_status) {
            status = "New"
          } else {
            status = "Old"
          }

          await handleResultConfirmation(event, selectedResult, status);
          pendingCommands.delete("1");
          return;
        }
        // กรณีที่เป็นการยืนยันย้อนผล
        else if (pendingCommands.has("2")) {
          const roundNumber = pendingCommands.get("2");
          return await handleReturnResultConfirmation(event, roundNumber);
        }
        // กรณีที่ไม่พบคำสั่งที่รอการยืนยัน
        else {
          console.log("ไม่มีกำหนดคำสั่งที่รอการยืนยัน");
          return;
        }
      }

      // ย้อนผล
      if (userMessage.toLowerCase().startsWith("ย้อนผล#")) {
        const messageParts = userMessage.split('#');

        if (messageParts.length === 2) {
          const roundNumber = parseInt(messageParts[1]);
          if (!isNaN(roundNumber)) {
            pendingCommands.set("2", roundNumber);
            return await handleReturnConfirmResultCommand(event, roundNumber);
          } else {
            console.log("คำสั่งไม่ถูกต้อง");
            return;
          }
        } else {
          console.log("คำสั่งไม่ถูกต้อง");
          return;
        }
      }


      // เช็คยอดล่าสุด สำหรับกลุ่มหลังบ้าน
      if (userMessage.toLowerCase() === "u") {
        return await handleUserPlayInRound(event);
      }

    }

    // คำสั่งเฉพาะกลุ่มหลังบ้าน
    if (isSubGroup) {

      // เช็คยอดล่าสุด สำหรับกลุ่มหลังบ้าน
      if (userMessage.toLowerCase() === "u") {
        return await handleCalPlus(event);
      }


      if (userMessage.toLowerCase() === "sum") {
        return await handleSumallinday(event);
      }


      if (userMessage.toLowerCase().startsWith('q/')) {
        const parts = userMessage.substring(2);  // ตัด 'q/' ออก
        let amount;
        let action;
        let type;

        // ตรวจสอบว่าจำนวนอยู่ที่ด้านหน้า (เช่น 'Q/8ด') หรือด้านหลัง (เช่น 'Q/ด8')
        if (parts.charAt(parts.length - 1) === 'ด' || parts.charAt(parts.length - 1) === 'ง') {
          // ถ้าจำนวนอยู่ข้างหน้า
          amount = parseInt(parts.substring(0, parts.length - 1));
          type = "long"
          action = parts.charAt(parts.length - 1);
        } else if (parts.charAt(0) === 'ด' || parts.charAt(0) === 'ง') {
          // ถ้าจำนวนอยู่ข้างหลัง
          amount = parseInt(parts.substring(1));
          action = parts.charAt(0);
          type = "tor"
        }

        return await handleCalTorLong(event, amount, action, type);
      }

    }
  }
  return null;
}

module.exports = { handleEvent };
