const { Client } = require("@line/bot-sdk");
const { channelAccessToken } = require("../config");
const { getSortedUserDetails } = require("./component/Func/userController");
const {
  getBankAccountDetails,
} = require("./component/Func/bankAccountController");
const {
  setGroup,
  setHilo,
  setCock,
  getGroupMembers,
} = require("./groupController");

const client = new Client({ channelAccessToken });

async function handleEvent(event) {
  console.log("log : " + JSON.stringify(event));

  if (event.source.type === "group" || event.source.type === "room") {
    if (event.type !== "message" || event.message.type !== "text") {
      return null;
    }

    const userMessage = event.message.text.trim();

    // set id group
    if (userMessage.toLowerCase().startsWith("setgroup#")) {
      const groupName = userMessage.substring(9).trim();
      if (groupName) {
        const confirmationMessage = await setGroup(event, groupName);

        return {
          type: "text",
          text: confirmationMessage,
        };
      }
    }

    // เมื่อ admin พิมพ์คำว่า "เพิ่มทั้งหมด"
    if (userMessage === "เพิ่มทั้งหมด") {
      const groupId = event.source.groupId || event.source.roomId; // กรณีเป็น group หรือ room
      if (!groupId) {
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "ไม่สามารถระบุ groupId หรือ roomId ได้",
        });
      }

      try {
        // ดึงสมาชิกทั้งหมดในกลุ่ม
        const members = await getGroupMembers(groupId);

        // ตอบกลับข้อความเมื่อเพิ่มสมาชิกเสร็จ
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "เพิ่มสมาชิกทั้งหมดในกลุ่มเรียบร้อยแล้ว!",
        });
      } catch (error) {
        console.error("Error adding members:", error);
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "เกิดข้อผิดพลาดในการเพิ่มสมาชิก.",
        });
      }
    }

    // เช็คคำสั่งที่เป็น "set#เปิด#ไฮโล"
    if (userMessage.toLowerCase().startsWith("set#เปิด#ไฮโล")) {
      const confirmationMessage = await setHilo(event, "เปิด");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: confirmationMessage,
      });
    }

    // เช็คคำสั่งที่เป็น "set#ปิด#ไฮโล"
    if (userMessage.toLowerCase().startsWith("set#ปิด#ไฮโล")) {
      const confirmationMessage = await setHilo(event, "ปิด");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: confirmationMessage,
      });
    }

    // เช็คคำสั่งที่เป็น "set#เปิด#ไก่ชน"
    if (userMessage.toLowerCase().startsWith("set#เปิด#ไก่ชน")) {
      const confirmationMessage = await setCock(event, "เปิด");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: confirmationMessage,
      });
    }

    // เช็คคำสั่งที่เป็น "set#ปิด#ไก่ชน"
    if (userMessage.toLowerCase().startsWith("set#ปิด#ไก่ชน")) {
      const confirmationMessage = await setCock(event, "ปิด");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: confirmationMessage,
      });
    }

    if (userMessage.toLowerCase() === "บช") {
      const bankAccountMessage = getBankAccountDetails();
      return client.replyMessage(event.replyToken, [bankAccountMessage]);
    }

    if (userMessage.toLowerCase() === "cdd") {
      const userDetailsMessage = getSortedUserDetails();
      return client.replyMessage(event.replyToken, userDetailsMessage);
    }
  }
  return null;
}

module.exports = { handleEvent };
