const axios = require("axios");
require("dotenv").config();
const { Client } = require("@line/bot-sdk");

const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

const users = require("../../../models/user");

function getSortedUserDetails() {
  // Sort users by displayName (name)
  const sortedUsers = users.sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  // Create a message with sorted user details (name and phone number)
  return sortedUsers.map((user) => ({
    type: "text",
    text: `ชื่อ: ${user.displayName}\nเบอร์: ${user.phoneNumber}`,
  }));
}

// ดึงสิทธิ์ user
async function getUserRole(userId) {
  try {
    const response = await axios.get(
      `${process.env.API_URL}/user/${userId}/role`
    );
    return response;
  } catch (error) {
    return "User";
  }
}

//เช็คเงินคงเหลือ
async function getUserMoney(userId, member) {
  try {
    const response = await axios.get(`${process.env.API_URL}/user/${userId}`);
    const { id, fund } = response.data || {};
    const userName = member.displayName || "ผู้ใช้";
    const userPictureUrl =
      member.pictureUrl || "https://example.com/default-profile.png";

    return {
      type: "flex",
      altText: `ข้อมูลเงินคงเหลือของ ${userName}`,
      contents: {
        type: "bubble",
        size: "mega",
        body: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "image",
              url: userPictureUrl,
              size: "sm",
              aspectRatio: "1:1",
              aspectMode: "cover",
              margin: "sm",
              flex: 1,
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `รหัส ${id} ${userName}`,
                  weight: "bold",
                  size: "lg",
                  align: "center",
                  wrap: true,
                },
                {
                  type: "text",
                  text: `เงินคงเหลือ ${fund} 💰`,
                  weight: "bold",
                  size: "md",
                  margin: "md",
                  align: "center",
                  wrap: true,
                },
              ],
              flex: 2,
            },
          ],
          paddingAll: "15px",
          backgroundColor: "#FFFFFF",
          cornerRadius: "5px",
        },
      },
    };
  } catch (error) {
    console.error(
      "Error fetching user money:",
      error.response?.data || error.message
    );
    return {
      type: "text",
      text: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ กรุณาลองใหม่",
    };
  }
}

// ฟังก์ชันตรวจสอบการมีอยู่ของสมาชิก
async function checkIfUserExists(userId) {
  try {
    const response = await axios.get(`${process.env.API_URL}/user/${userId}`);
    if (response.data) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// เพิ่มสมาชิก
async function AddMember(member) {
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

    // ตรวจสอบว่า API ส่งกลับสถานะ 200 หรือไม่
    if (response.status === 200) {
      console.log(`User ${userId} added successfully:`, response.data);
    } else {
      // หาก API ไม่ตอบกลับสถานะ 200 ให้โยนข้อผิดพลาดที่มีข้อมูลจาก API
      const errorMessage = response.data?.message || "Unknown error";
      throw new Error(`API Error: ${response.status} - ${errorMessage}`);
    }
  } catch (error) {
    // แสดงข้อผิดพลาดที่จับได้
    console.error(
      "Error sending user to API:",
      error.response?.data || error.message
    );

    // โยนข้อผิดพลาดกลับไปที่ระดับสูงขึ้น
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "ไม่สามารถเพิ่มข้อมูลผู้ใช้ได้";
    throw new Error(`ไม่สามารถเพิ่มข้อมูลผู้ใช้ ${userId}: ${errorMsg}`);
  }
}

// ฟังก์ชันอัพเดตข้อมูลผู้ใช้ในกรณีที่เคยเข้าร่วมแล้วออกไป
async function updateMemberData(userId, groupId, { status = false }) {
  try {
    const response = await axios.put(`${process.env.API_URL}/user/${userId}`, {
      groupID: groupId,
      isActive: status,
    });

    // ตรวจสอบสถานะการตอบกลับจาก API
    if (response.status === 200) {
      console.log(`User ${userId} data updated:`, response.data);
    } else {
      console.error(
        `Failed to update data for User ${userId}:`,
        response.status
      );
    }
  } catch (error) {
    console.error(
      "Error updating member data:",
      error.response?.data || error.message
    );
  }
}


// ฟังก์ชันอัพเดตข้อมูลAdmin
async function updateAdminData(userId, groupId, { role }) {
  try {
    const response = await axios.put(`${process.env.API_URL}/user/${userId}`, {
      groupID: groupId,
      role: role, // ใช้ role ที่รับมาจาก parameter
    });

    // ตรวจสอบสถานะการตอบกลับจาก API
    if (response.status === 200) {
      console.log(`User ${userId} data updated:`, response.data);
    } else {
      console.error(
        `Failed to update data for User ${userId}:`,
        response.status
      );
    }
  } catch (error) {
    console.error(
      "Error updating member data:",
      error.response?.data || error.message
    );
  }
}

module.exports = {
  getSortedUserDetails,
  AddMember,
  checkIfUserExists,
  updateMemberData,
  getUserRole,
  getUserMoney,
  updateAdminData,
};
