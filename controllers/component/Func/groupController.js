const axios = require("axios");
require("dotenv").config();
const { Client } = require("@line/bot-sdk");
const client = new Client({ channelAccessToken });

async function setGroup(event, groupName) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    const response = await axios.post(`${process.env.API_URL}/group`, {
      idGroup: groupId,
      groupName: groupName,
      cockIsActive: true,
      hiloIsActive: false,
    });

    // ส่งข้อความยืนยันการเพิ่มกลุ่ม
    const confirmationMessage = `กลุ่ม "${groupName}" ได้รับการเพิ่มเรียบร้อยแล้ว`;
    return confirmationMessage;
  } catch (error) {
    console.error("Error adding group:", error);
    return "เกิดข้อผิดพลาดในการเพิ่มกลุ่ม กรุณาลองใหม่";
  }
}

async function setHilo(event, status) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    const hiloIsActive = status === "เปิด" ? true : false;

    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}`,
      {
        hiloIsActive: hiloIsActive,
      }
    );

    const confirmationMessage = `ไฮโลได้ถูก ${status} แล้ว`;
    return confirmationMessage;
  } catch (error) {
    console.error("Error updating Hilo status:", error);
    return "เกิดข้อผิดพลาดในการอัปเดตสถานะ Hilo กรุณาลองใหม่";
  }
}

async function setCock(event, status) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    const cockIsActive = status === "เปิด" ? true : false;

    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}`,
      {
        cockIsActive: cockIsActive,
      }
    );

    const confirmationMessage = `ไก่ชนสำหรับกลุ่ม ID ${groupId} ได้ถูก ${status} แล้ว`;
    return confirmationMessage;
  } catch (error) {
    console.error("Error updating Cock status:", error);
    return "เกิดข้อผิดพลาดในการอัปเดตสถานะไก่ชน กรุณาลองใหม่";
  }
}

// ฟังก์ชันสำหรับส่งข้อมูลสมาชิกไปยัง API
async function sendUserToAPI(member) {
  const { userId, groupId } = member;

  try {
    await axios.post(`${process.env.API_URL}/user`, {
      userID: userId,
      status: groupName,
      role: 1,
      fund: 0,
      remaining_fund: 0,
      dailyCashback: 0,
      statusFund: 0,
      isActive: true,
      groupID: groupId,
    });
    console.log(`User ${userId} added to the database.`);
  } catch (error) {
    console.error("Error sending user to API:", error);
    throw new Error(`ไม่สามารถเพิ่มข้อมูลผู้ใช้ ${userId} ได้`);
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลสมาชิกจากกลุ่ม
async function getGroupMembers(groupId) {
  try {
    // ดึง memberIds จากกลุ่ม
    const memberIds = await client.getGroupMemberIds(groupId);
    const members = [];

    // ดึงโปรไฟล์ของสมาชิกทุกคนในกลุ่ม
    for (const userId of memberIds) {
      const profile = await client.getGroupMemberProfile(groupId, userId);
      members.push({
        userId: profile.userId,
        groupId: groupId,
      });
    }

    // ส่งข้อมูลสมาชิกทั้งหมดไปยัง API โดยรอให้สำเร็จก่อน
    await Promise.all(members.map((member) => sendUserToAPI(member)));

    return {
      success: true,
      message: `เพิ่มสมาชิกทั้งหมดในกลุ่ม ${groupId} เรียบร้อยแล้ว!`,
    };
  } catch (error) {
    console.error("Error fetching group members:", error);
    throw new Error("ไม่สามารถดึงข้อมูลสมาชิกได้");
  }
}

module.exports = { setGroup, setHilo, setCock, getGroupMembers };
