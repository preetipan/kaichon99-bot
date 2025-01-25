const axios = require("axios");
require("dotenv").config();
const { channelAccessToken } = require("../../../config");
const { checkUserPlay ,checkPreviousRoundStatus} = require("../BotFunc/playController");

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
async function getUserMoney(event, userId, member) {
  try {
    const response = await axios.get(`${process.env.API_URL}/user/${userId}`);
    const { id, fund } = response.data || {};
    const userName = member.displayName || "ผู้ใช้";
    const userPictureUrl =
      member.pictureUrl || "https://example.com/default-profile.png";
    const formattedFund = fund.toLocaleString("en-US");

    const userPlay = await checkUserPlay(event);
    let latestPlay = null;

    // ตรวจสอบว่า userPlay เป็น Array และมีข้อมูลหรือไม่
    // if (Array.isArray(userPlay) && userPlay.length > 0) {
    //   latestPlay = userPlay.reduce((latest, current) => {
    //     return new Date(current.createDate) > new Date(latest.createDate) ? current : latest;
    //   }, userPlay[0]);
    // }
    if (Array.isArray(userPlay) && userPlay.length > 0) {
      latestPlay = userPlay.reduce((latest, current) => {
        return current.id > latest.id ? current : latest;
      }, userPlay[0]);
    }

    const isOpenMainStatus = await checkPreviousRoundStatus();

    if (latestPlay && isOpenMainStatus) {
      return {
        type: "flex",
        altText: `ข้อมูลเงินคงเหลือของ ${userName}`,
        contents: {
          type: "bubble",
          size: "giga",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
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
                        wrap: false,
                      },
                      ...userPlay.map((play) => ({
                        type: "box",
                        layout: "horizontal",
                        contents: [
                          {
                            type: "text",
                            text: `ยกที่ ${play.subRound.numberRound} ${play.subRound.price}`,
                            weight: "bold",
                            margin: "sm",
                            size: "sm",
                            align: "start",
                            wrap: false,
                            color: "#FFFFFF",
                          },
                          {
                            type: "text",
                            text: `${play.betAmount}`,
                            weight: "bold",
                            margin: "sm",
                            size: "sm",
                            align: "end",
                            wrap: false,
                            color: "#FFFFFF",
                          },
                        ],
                        alignItems: "center",
                        backgroundColor: play.betType === 'BLUE' ? '#3399FF' : (play.betType === 'RED' ? '#fc0000' : '#FFFFFF'),
                        cornerRadius: "0px",
                        margin: "sm",
                      })),
                      {
                        type: "text",
                        text: `เล่นได้อีก ${latestPlay.balance}`,
                        weight: "bold",
                        color: "#00FF00",
                        size: "sm",
                        align: "end",
                        margin: "md",
                        wrap: false,
                      },
                    ],
                    flex: 2,
                  },
                ],
                paddingAll: "15px",
                backgroundColor: "#FFFFFF",
                cornerRadius: "5px",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: `เงินทั้งหมด ${formattedFund} 💰`,
                        weight: "bold",
                        size: "md",
                        align: "end",
                        wrap: false,
                      },
                    ],
                  },
                ],
                paddingAll: "15px",
                backgroundColor: "#FFFFFF",
                cornerRadius: "5px",
              },
            ],
          },
        },
      };
    } else {
      return {
        type: "flex",
        altText: `ข้อมูลเงินคงเหลือของ ${userName}`,
        contents: {
          type: "bubble",
          size: "giga",
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
                    wrap: false,
                  },
                  {
                    type: "text",
                    text: `เงินคงเหลือ ${formattedFund} 💰`,
                    weight: "bold",
                    size: "md",
                    margin: "md",
                    align: "center",
                    wrap: false,
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
    }
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
async function AddMember(member, userId, groupId) {
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
      groupId: groupId,
    });

    // ตรวจสอบว่า API ส่งกลับสถานะ 201 หรือไม่
    if (response.status === 201) {
      // เปลี่ยนเป็น 201 เพราะ API จะส่งสถานะนี้เมื่อเพิ่มข้อมูลสำเร็จ
      //console.log(`User ${userId} added successfully:`, response.data);
    } else {
      // หาก API ไม่ตอบกลับสถานะ 201 ให้โยนข้อผิดพลาดที่มีข้อมูลจาก API
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
    const response = await axios.patch(
      `${process.env.API_URL}/user/${userId}`,
      {
        groupId: groupId, // ใช้ groupId ให้ถูกต้อง
        isActive: status,
      }
    );

    // ตรวจสอบสถานะการตอบกลับจาก API
    if (response.status === 200 || response.status === 204) {
      // คำนึงถึงสถานะ 204 ซึ่งอาจเกิดขึ้นในบางกรณี
      console.log(`User ${userId} data updated successfully:`, response.data);
    } else {
      console.error(
        `Failed to update data for User ${userId}:`,
        response.status,
        response.data
      );
    }
  } catch (error) {
    console.error(
      "Error updating member data:",
      error.response?.data || error.message
    );
  }
}

// ฟังก์ชันอัพเดตข้อมูล Admin
async function updateAdminData(userId, groupId, { role }) {
  try {
    // ทำการส่งคำขออัปเดตข้อมูล
    const response = await axios.patch(
      `${process.env.API_URL}/user/${userId}`,
      {
        groupId: groupId,
        role: role,
      }
    );

    console.log(`response : `, response);

    // ตรวจสอบสถานะการตอบกลับจาก API
    if (response.status === 200 && response.data) {
      console.log(`User ${userId} data updated:`, response.data);
      return { success: true, message: "ข้อมูลของสมาชิกได้รับการอัปเดตแล้ว" };
    } else {
      console.error(
        `ไม่สามารถอัปเดตข้อมูลสำหรับผู้ใช้ ${userId}:`,
        response.status,
        response.data
      );
      return {
        success: false,
        message: `ไม่สามารถอัปเดตข้อมูลได้. โปรดลองใหม่อีกครั้งในภายหลัง`,
      };
    }
  } catch (error) {
    // ตรวจสอบข้อผิดพลาดในกรณีที่เกิด exception
    console.error(
      "Error updating member data:",
      error.response?.data || error.message
    );
    return { success: false, message: error.response?.data || error.message };
  }
}


//ฟังก์ชันเช็คข้อมูลผู้ใช้
async function checkUserData(userId) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.get(`${process.env.API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error checking openPlayInday:",
      error.response?.data || error.message
    );
  }
}


//ฟังก์ชันเช็คข้อมูลผู้ใช้ by id
async function checkUserDataByID(id) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.get(`${process.env.API_URL}/user/id/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error checking openPlayInday:",
      error.response?.data || error.message
    );
  }
}


async function getUserCheckMoney(event) {
  try {
    const userId = event.source.userId;
    // ดึงข้อมูลผู้ใช้จาก API ของระบบ
    const response = await axios.get(`${process.env.API_URL}/user/${userId}`);
    const { id, fund } = response.data || {};
    const formattedFund = fund ? fund.toLocaleString("en-US") : "0";

    // ดึงข้อมูลโปรไฟล์ผู้ใช้จาก LINE Messaging API
    const profileResponse = await axios.get(
      `https://api.line.me/v2/bot/profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${channelAccessToken}`,
        },
      }
    );

    const { displayName, pictureUrl } = profileResponse.data || {};
    const userName = displayName || "ผู้ใช้";
    const userPictureUrl = pictureUrl || "https://example.com/default-profile.png";

    // สร้างข้อความ Flex Message
    return {
      type: "flex",
      altText: `ข้อมูลเงินคงเหลือของ ${userName}`,
      contents: {
        type: "bubble",
        size: "giga",
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
                  text: `รหัส ${id} ) ${displayName}`,
                  weight: "bold",
                  size: "xl",
                  align: "center",
                  gravity: "center",
                  wrap: false,
                },
                
              ],
              flex: 2,
              justifyContent: "center",
              alignItems: "center",
            },
          ],
          paddingAll: "10px",
          backgroundColor: "#FFFFFF",
          cornerRadius: "5px",
        },
      },
    };
  } catch (error) {
    console.error("Error fetching user money:", error.response?.data || error.message);
    return {
      type: "text",
      text: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ กรุณาลองใหม่",
    };
  }
}

module.exports = {
  AddMember,
  checkIfUserExists,
  updateMemberData,
  getUserRole,
  getUserMoney,
  updateAdminData,
  checkUserData,
  checkUserDataByID,
  getUserCheckMoney,
};
