const axios = require("axios");
require("dotenv").config();
const { Client } = require("@line/bot-sdk");

const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

// ฟังก์ชันเพิ่มกลุ่ม
async function setGroup(event, groupName) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    console.log("groupId:", groupId);
    console.log("groupName:", groupName);

    const response = await axios.post(`${process.env.API_URL}/group`, {
      idGroup: groupId,
      groupName: groupName,
      cockIsActive: true,
      hiloIsActive: false,
    });

    console.log("Group added response:", response.data);

    // สร้างข้อความยืนยันการเพิ่มกลุ่ม
    const confirmationMessage = `กลุ่ม "${groupName}" ได้รับการเพิ่มเรียบร้อยแล้ว`;

    // ส่งข้อความตอบกลับไปยังกลุ่มโดยใช้ replyMessage
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: confirmationMessage,
    });

    // ส่งข้อความยืนยันกลับจากฟังก์ชัน
    return confirmationMessage;
  } catch (error) {
    console.error("Error adding group:", error.response?.data || error.message);
    return "เกิดข้อผิดพลาดในการเพิ่มกลุ่ม กรุณาลองใหม่";
  }
}

// ฟังก์ชันตั้งค่า Hilo
async function setHilo(event, status) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    const hiloIsActive = status === "เปิด";

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}`,
      {
        hiloIsActive: hiloIsActive,
      }
    );

    const confirmationMessage = `ไฮโลได้ถูก ${status} แล้ว`;
    return confirmationMessage;
  } catch (error) {
    console.error(
      "Error updating Hilo status:",
      error.response?.data || error.message
    );
    return "เกิดข้อผิดพลาดในการอัปเดตสถานะ Hilo กรุณาลองใหม่";
  }
}

// ฟังก์ชันตั้งค่า Cock
async function setCock(event, status) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    const cockIsActive = status === "เปิด";

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}`,
      {
        cockIsActive: cockIsActive,
      }
    );

    console.log("Cock updated response:", response.data);

    const confirmationMessage = `ไก่ชนสำหรับกลุ่ม ID ${groupId} ได้ถูก ${status} แล้ว`;
    return confirmationMessage;
  } catch (error) {
    console.error(
      "Error updating Cock status:",
      error.response?.data || error.message
    );
    return "เกิดข้อผิดพลาดในการอัปเดตสถานะไก่ชน กรุณาลองใหม่";
  }
}

// ฟังก์ชันส่งข้อมูลสมาชิกไปยัง API
async function sendUserToAPI(member) {
  const { userId, groupId } = member;

  try {
    const response = await axios.post(`${process.env.API_URL}/user`, {
      userID: userId,
      status: 1,
      role: 3,
      fund: 0,
      remaining_fund: 0,
      dailyCashback: 0,
      statusFund: 1,
      isActive: true,
      groupID: groupId,
    });

    console.log(`User ${userId} added successfully:`, response.data);
  } catch (error) {
    console.error(
      "Error sending user to API:",
      error.response?.data || error.message
    );
    throw new Error(`ไม่สามารถเพิ่มข้อมูลผู้ใช้ ${userId} ได้`);
  }
}

// ฟังก์ชันดึงข้อมูลสมาชิกจากกลุ่ม
async function getGroupMembers(groupId) {
  try {
    const memberIds = await client.getGroupMemberIds(groupId);
    console.log("จำนวนสมาชิก:", memberIds.length);

    const members = [];
    for (const userId of memberIds) {
      try {
        const profile = await client.getGroupMemberProfile(groupId, userId);
        members.push({
          userId: profile.userId,
          displayName: profile.displayName,
          groupId: groupId,
        });
        console.log("สมาชิก:", profile.displayName);
      } catch (profileError) {
        console.warn(`ข้ามการเพิ่มสมาชิก ${userId}`);
      }
    }

    await Promise.all(members.map((member) => sendUserToAPI(member)));

    return {
      success: true,
      message: `เพิ่มสมาชิก ${members.length} คนในกลุ่มเรียบร้อย!`,
    };
  } catch (error) {
    console.error("Error fetching group members:", error);

    if (error.response?.status === 403) {
      throw new Error("Bot ไม่มีสิทธิ์เข้าถึงสมาชิก");
    }

    throw new Error("ไม่สามารถดึงข้อมูลสมาชิกได้");
  }
}

// ฟังก์ชันตรวจสอบการมีอยู่ของสมาชิก
async function checkIfGroup(groupID) {
  try {
    const response = await axios.get(`${process.env.API_URL}/group/${groupID}`);
    if (response.data) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

module.exports = {
  setGroup,
  setHilo,
  setCock,
  getGroupMembers,
  checkIfGroup,
};
