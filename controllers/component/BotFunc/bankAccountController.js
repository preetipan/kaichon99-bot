const axios = require("axios");
require("dotenv").config();

function getBankAccountDetails(member) {
  const bank_type = process.env.BANK_TYPE || "scb";
  const bank_name = process.env.BANK_NAME || "ไม่ระบุธนาคาร";
  const bank_account = process.env.BANK_ACCOUNT || "ไม่ระบุเลขบัญชี";
  const bank_account_name = process.env.BANK_ACCOUNT_NAME || "ไม่ระบุชื่อบัญชี";
  const img = `${process.env.IMGE_URL}/Img/${bank_type}.png`;

  return {
    type: "flex",
    altText: `ยินดีต้อนรับกลับคุณ ${member.displayName} ข้อมูลบัญชีของคุณถูกแสดงแล้ว`,
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
                url: img,
                size: "sm",
                aspectMode: "cover",
                aspectRatio: "1:1",
                gravity: "center",
                flex: 1,
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: bank_account,
                    weight: "bold",
                    size: "xl",
                    color: "#FFFFFF",
                    wrap: false,
                    align: "center",
                  },
                  {
                    type: "text",
                    text: bank_name,
                    size: "md",
                    color: "#FFFFFF",
                    wrap: false,
                    align: "center",
                  },
                  {
                    type: "text",
                    text: bank_account_name,
                    size: "md",
                    color: "#FFFFFF",
                    wrap: false,
                    align: "center",
                  },
                ],
                flex: 2,
                margin: "md",
              },
            ],
            spacing: "md",
            paddingAll: "10px",
          },
          {
            type: "separator",
            color: "#FFFFFF",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                style: "secondary",
                action: {
                  type: "clipboard",
                  label: "คัดลอกเลขบัญชี",
                  clipboardText: bank_account,
                },
                color: "#E0E0E0",
                height: "sm",
                margin: "lg",
              },
              {
                type: "button",
                style: "primary",
                action: {
                  type: "uri",
                  label: "กรุณาส่งสลิป ผ่านช่องทางนี้",
                  uri: "line://ti/p/@892xtjpl",
                },
                color: "#00C851",
                height: "sm",
                margin: "sm",
              },
            ],
            spacing: "sm",
            paddingTop: "10px",
          },
        ],
        backgroundColor: "#b0b0b0",
        paddingAll: "20px",
        cornerRadius: "5px",
        borderWidth: "0px",
      },
    },
  };
}

// ฟังก์ชันฝากเงินสด
async function depositMoneyCash(id, amount, event) {
  try {

    const userId = event.source.userId;
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const response = await axios.get(`${process.env.API_URL}/user/id/${id}`);
    const { fund } = response.data;

    // เพิ่มเงิน
    const updatedFund = fund + amount;
    //CASH = 1
    //CREDIT = 2
    // อัปเดตข้อมูลเงินใน API
    const updateResponse = await axios.patch(
      `${process.env.API_URL}/user/id/${id}/${userId}`,
      {
        fund: updatedFund,
        statusFund: 1,
      }
    );

    const formattedFund = updatedFund.toLocaleString("en-US");

    // ตรวจสอบสถานะการอัปเดต
    if (updateResponse.status === 200) {
      console.log(
        `User ${id} deposited ${amount}. New balance: ${formattedFund}`
      );
      return {
        type: "text",
        text: `ฝากเงินสำเร็จ 💰\nยอดเงินคงเหลือ: ${formattedFund} บาท`,
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
async function depositMoneyCredit(id, amount, event) {
  try {
    const userId = event.source.userId;
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const response = await axios.get(`${process.env.API_URL}/user/id/${id}`);
    const { fund } = response.data;

    // เพิ่มเงิน
    const updatedFund = fund + amount;

    // อัปเดตข้อมูลเงินใน API
    const updateResponse = await axios.patch(
      `${process.env.API_URL}/user/id/${id}/${userId}`,
      { fund: updatedFund, statusFund: 2 }
    );

    const formattedFund = updatedFund.toLocaleString("en-US");
    // ตรวจสอบสถานะการอัปเดต
    if (updateResponse.status === 200) {
      console.log(
        `User ${id} deposited ${amount}. New balance: ${formattedFund}`
      );
      return {
        type: "text",
        text: `เติมเครดิตสำเร็จ 💰\nยอดเงินคงเหลือ: ${formattedFund} บาท`,
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
async function withdrawMoney(id, amount, event) {
  try {
    const userId = event.source.userId;
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
    const updateResponse = await axios.patch(
      `${process.env.API_URL}/user/id/${id}/${userId}`,
      {
        fund: updatedFund,
      }
    );

    const formattedFund = updatedFund.toLocaleString("en-US");

    // ตรวจสอบสถานะการอัปเดต
    if (updateResponse.status === 200) {
      console.log(
        `User ${id} withdrew ${amount}. New balance: ${formattedFund}`
      );
      return {
        type: "text",
        text: `ถอนเงินสำเร็จ 💰\nยอดเงินคงเหลือ: ${formattedFund} บาท`,
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


async function transationMoney(payload) {
  try {
    const response = await axios.post(`${process.env.API_URL}/transation-money`, payload);
    if (response.status === 201) {
      console.log('Transaction successful', response.data);
    } else {
      console.log('Transaction failed', response.data);
    }
  } catch (error) {
    console.error('Error during transaction:', error.message);
    throw error;
  }
}

module.exports = {
  getBankAccountDetails,
  depositMoneyCredit,
  depositMoneyCash,
  withdrawMoney,
  transationMoney,
};
