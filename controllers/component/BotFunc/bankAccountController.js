const axios = require("axios");
require("dotenv").config();
const { Client } = require("@line/bot-sdk");

const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

function getBankAccountDetails(member) {
  return {
    type: "flex",
    altText: `ยินดีต้อนรับกลับคุณ ${member.displayName} ข้อมูลบัญชีของคุณถูกแสดงแล้ว`,
    contents: {
      type: "bubble",
      size: "mega",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "9922120029", // เลขบัญชี
            weight: "bold",
            size: "xl",
            align: "center",
            color: "#FFFFFF",
          },
          {
            type: "text",
            text: "ไทยพาณิชย์\nปรีติพันธ์ สุทธิพันธ์", // ชื่อบัญชี
            align: "center",
            color: "#FFFFFF",
            margin: "md",
            wrap: true,
          },
          {
            type: "button",
            style: "primary",
            color: "#AAAAAA",
            action: {
              type: "uri",
              label: "คัดลอกเลขบัญชี",
              uri: "line://app/clipboard?text=9922120029", // คัดลอกไปยังคลิปบอร์ด
            },
            margin: "lg",
          },
          {
            type: "button",
            style: "primary",
            color: "#00C851",
            action: {
              type: "uri",
              label: "กรุณาส่งสลิป",
              uri: "line://ti/p/@892xtjpl", // ส่งข้อความไปยังบอท LINE
            },
            margin: "sm",
          },
        ],
        backgroundColor: "#5A2D82",
      },
    },
  };
}

// ฟังก์ชันฝากเงินสด
async function depositMoneyCash(id, amount) {
  try {
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const response = await axios.get(`${process.env.API_URL}/user/id/${id}`);
    const { fund } = response.data;

    // เพิ่มเงิน
    const updatedFund = fund + amount;
    //CASH = 1
    //CREDIT = 2
    // อัปเดตข้อมูลเงินใน API
    const updateResponse = await axios.put(
      `${process.env.API_URL}/user/id/${id}`,
      {
        fund: updatedFund,
        statusFund: 1,
      }
    );

    // ตรวจสอบสถานะการอัปเดต
    if (updateResponse.status === 200) {
      console.log(
        `User ${id} deposited ${amount}. New balance: ${updatedFund}`
      );
      return {
        type: "text",
        text: `ฝากเงินสำเร็จ 💰\nยอดเงินคงเหลือ: ${updatedFund} บาท`,
      };
    } else {
      throw new Error("Failed to update user balance.");
    }
  } catch (error) {
    console.error("Error in depositMoney:", error.message);
    return {
      type: "text",
      text: "เกิดข้อผิดพลาดในการฝากเงิน กรุณาลองใหม่",
    };
  }
}

//ฝากเงินเครดิต
async function depositMoneyCredit(id, amount) {
  try {
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const response = await axios.get(`${process.env.API_URL}/user/id/${id}`);
    const { fund } = response.data;

    // เพิ่มเงิน
    const updatedFund = fund + amount;

    // อัปเดตข้อมูลเงินใน API
    const updateResponse = await axios.put(
      `${process.env.API_URL}/user/id/${id}`,
      { fund: updatedFund, statusFund: 2 }
    );

    // ตรวจสอบสถานะการอัปเดต
    if (updateResponse.status === 200) {
      console.log(
        `User ${id} deposited ${amount}. New balance: ${updatedFund}`
      );
      return {
        type: "text",
        text: `เติมเครดิตสำเร็จ 💰\nยอดเงินคงเหลือ: ${updatedFund} บาท`,
      };
    } else {
      throw new Error("Failed to update user balance.");
    }
  } catch (error) {
    console.error("Error in depositMoney:", error.message);
    return {
      type: "text",
      text: "เกิดข้อผิดพลาดในการฝากเงิน กรุณาลองใหม่",
    };
  }
}

// ฟังก์ชันถอนเงิน
async function withdrawMoney(id, amount) {
  try {
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const response = await axios.get(`${process.env.API_URL}/user/id/${id}`);
    const { fund } = response.data;

    // ตรวจสอบยอดเงินที่มีอยู่
    if (fund < amount) {
      throw new Error("ยอดเงินไม่เพียงพอสำหรับการถอน");
    }

    // ลดจำนวนเงินที่ถอนออก
    const updatedFund = fund - amount;

    // อัปเดตข้อมูลในระบบ
    const updateResponse = await axios.put(
      `${process.env.API_URL}/user/id/${id}`,
      {
        fund: updatedFund,
      }
    );

    // ตรวจสอบสถานะการอัปเดต
    if (updateResponse.status === 200) {
      console.log(`User ${id} withdrew ${amount}. New balance: ${updatedFund}`);
      return {
        type: "text",
        text: `ถอนเงินสำเร็จ 💰\nยอดเงินคงเหลือ: ${updatedFund} บาท`,
      };
    } else {
      throw new Error("Failed to update user balance.");
    }
  } catch (error) {
    console.error("Error in withdrawMoney:", error.message);
    return {
      type: "text",
      text: `ยอดเงินไม่เพียงพอสำหรับการถอน`,
    };
  }
}

module.exports = {
  getBankAccountDetails,
  depositMoneyCredit,
  depositMoneyCash,
  withdrawMoney,
};
