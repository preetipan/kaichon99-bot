const axios = require("axios");
require("dotenv").config();
const { Client } = require("@line/bot-sdk");
const { channelAccessToken } = require("../../../config");
const client = new Client({ channelAccessToken });

// ฟังก์ชันเพื่อดึงชื่อผู้ใช้จาก userID
async function getUserNameFromUserID(userID) {
  try {
    const profile = await client.getProfile(userID);
    return profile.displayName; // คืนค่าเฉพาะชื่อที่แสดง
  } catch (error) {
    console.error('Error fetching user profile: ', error);
    return userID; // กรณีมีข้อผิดพลาด ให้แสดง userID แทน
  }
}

// ฟังก์ชันเปิด-ปิด บ้านไก่ชน
async function setPlayInday(event, openPlay) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    // ตรวจสอบว่า groupId ถูกกำหนดหรือไม่
    if (!groupId) {
      return "ไม่พบกลุ่มที่ต้องการดำเนินการ กรุณาลองใหม่";
    }

    //console.log('groupId : ' + groupId);

    // ตรวจสอบว่า API_URL ถูกกำหนดใน .env หรือไม่
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const create_by = event.source.userId;

    // ตรวจสอบว่า create_by ถูกกำหนดหรือไม่
    if (!create_by) {
      return "ไม่สามารถหาผู้ใช้งานที่ทำการดำเนินการ กรุณาลองใหม่";
    }

    //console.log('create_by : ' + create_by);

    const payload = {
      openPlay: openPlay, // เปลี่ยนสถานะตามคำสั่ง
      updateBy: create_by, // ผู้ที่ทำการอัปเดต
    };

    // เรียก API เพื่ออัปเดตสถานะ
    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}`,
      payload
    );

    // ข้อความยืนยันการอัปเดต
    const action = openPlay ? "เปิดบ้านไก่ชน" : "ปิดบ้านไก่ชน";
    const confirmationMessage = `ทำการ${action}เรียบร้อยแล้ว`;

    // ส่งข้อความยืนยันกลับจากฟังก์ชัน
    return confirmationMessage;
  } catch (error) {
    console.error(
      "Error updating group:",
      error.response?.data || error.message
    );

    // การจัดการข้อผิดพลาดที่เกิดขึ้น
    if (error.response) {
      return `ข้อผิดพลาดจาก API: ${
        error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
      }`;
    }

    return "เกิดข้อผิดพลาดในการอัปเดตกลุ่ม กรุณาลองใหม่";
  }
}

//ฟังก์ชันเช็คสถานะเปิดบ้าน
async function checkOpenPlayInday(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    if (!groupId) {
      return "ไม่พบกลุ่มที่ต้องการตรวจสอบ กรุณาลองใหม่";
    }

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.get(
      `${process.env.API_URL}/group/detail/${groupId}`
    );
    const { openPlay } = response.data;
    return openPlay;
  } catch (error) {
    console.error(
      "Error checking openPlayInday:",
      error.response?.data || error.message
    );

    if (error.response) {
      return `ข้อผิดพลาดจาก API: ${
        error.response.data.message || "ไม่สามารถตรวจสอบสถานะได้"
      }`;
    }

    return "เกิดข้อผิดพลาดในการตรวจสอบสถานะ กรุณาลองใหม่";
  }
}

// ฟังก์ชันรีเซ็ตจำนวนรอบ รอบเล่นหลัก
async function resetMainRound(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    if (!groupId) {
      return "ไม่พบกลุ่มที่ต้องการดำเนินการ กรุณาลองใหม่";
    }
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const create_by = event.source.userId;
    if (!create_by) {
      return "ไม่สามารถหาผู้ใช้งานที่ทำการดำเนินการ กรุณาลองใหม่";
    }

    const payload = {
      updateBy: create_by,
    };

    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}/reset-main-round`,
      payload
    );
  } catch (error) {
    console.error(
      "Error updating group:",
      error.response?.data || error.message
    );
    if (error.response) {
      return `ข้อผิดพลาดจาก API: ${
        error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
      }`;
    }

    return "เกิดข้อผิดพลาดในการอัปเดตกลุ่ม กรุณาลองใหม่";
  }
}

// ฟังก์ชันรีเซ็ตจำนวนรอบ รอบเล่นย่อย
async function resetSubRound(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    if (!groupId) {
      return "ไม่พบกลุ่มที่ต้องการดำเนินการ กรุณาลองใหม่";
    }
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const create_by = event.source.userId;
    if (!create_by) {
      return "ไม่สามารถหาผู้ใช้งานที่ทำการดำเนินการ กรุณาลองใหม่";
    }

    const payload = {
      updateBy: create_by,
    };

    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}/reset-sub-round`,
      payload
    );
  } catch (error) {
    console.error(
      "Error updating group:",
      error.response?.data || error.message
    );
    if (error.response) {
      return `ข้อผิดพลาดจาก API: ${
        error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
      }`;
    }

    return "เกิดข้อผิดพลาดในการอัปเดตกลุ่ม กรุณาลองใหม่";
  }
}

// ฟังก์ชันเพิ่มจำนวน รอบเล่นหลัก
async function setNumberMainRound(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    if (!groupId) {
      return "ไม่พบกลุ่มที่ต้องการดำเนินการ กรุณาลองใหม่";
    }
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const create_by = event.source.userId;
    if (!create_by) {
      return "ไม่สามารถหาผู้ใช้งานที่ทำการดำเนินการ กรุณาลองใหม่";
    }

    const payload = {
      updateBy: create_by,
    };

    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}/increment-main-round`,
      payload
    );
  } catch (error) {
    console.error(
      "Error updating group:",
      error.response?.data || error.message
    );
    if (error.response) {
      return `ข้อผิดพลาดจาก API: ${
        error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
      }`;
    }

    return "เกิดข้อผิดพลาดในการอัปเดตกลุ่ม กรุณาลองใหม่";
  }
}

// ฟังก์ชันเพิ่มจำนวน รอบเล่นหลัก
async function setNumberSubRound(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;
    if (!groupId) {
      return "ไม่พบกลุ่มที่ต้องการดำเนินการ กรุณาลองใหม่";
    }
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const create_by = event.source.userId;
    if (!create_by) {
      return "ไม่สามารถหาผู้ใช้งานที่ทำการดำเนินการ กรุณาลองใหม่";
    }

    const payload = {
      updateBy: create_by,
    };

    const response = await axios.patch(
      `${process.env.API_URL}/group/${groupId}/increment-sub-round`,
      payload
    );
  } catch (error) {
    console.error(
      "Error updating group:",
      error.response?.data || error.message
    );
    if (error.response) {
      return `ข้อผิดพลาดจาก API: ${
        error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
      }`;
    }

    return "เกิดข้อผิดพลาดในการอัปเดตกลุ่ม กรุณาลองใหม่";
  }
}

// ฟังก์ชันเปิดรอบเล่นหลัก
async function setMainPlay(event, status) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const groupId = event.source.groupId || event.source.roomId;
    const createBy = event.source.userId;
    const isOpenMainStatus = await checkPreviousRoundStatus();
    const numberMainRound = await checkMainRoundNumber(event);

    const currentTime = new Date();

    // แปลงเวลาให้เป็นรูปแบบ "YYYY-MM-DD HH:mm:ss.SSS"
    const formattedTime =
      currentTime.getFullYear() +
      "-" +
      ("0" + (currentTime.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + currentTime.getDate()).slice(-2) +
      " " +
      ("0" + currentTime.getHours()).slice(-2) +
      ":" +
      ("0" + currentTime.getMinutes()).slice(-2) +
      ":" +
      ("0" + currentTime.getSeconds()).slice(-2) +
      "." +
      ("00" + currentTime.getMilliseconds()).slice(-3);

    const roundStatus = status === "open" ? 1 : 2; // 1 = OPEN, 2 = CLOSE

    // ตรวจสอบรอบก่อนหน้า
    if (status === "open" && isOpenMainStatus) {
      return "ไม่สามารถเปิดรอบใหม่ได้ เนื่องจากยังมีรอบที่เปิดอยู่";
    }

    const payload = {
      round_status: roundStatus,
      numberMainRound: numberMainRound,
      groupId: groupId,
      createBy: createBy,
      start_time: formattedTime,
    };
    const response = await axios.post(`${process.env.API_URL}/round`, payload);
    const confirmationMessage = `คู่ที่ # ${numberMainRound}`;

    return confirmationMessage;
  } catch (error) {
    console.error(
      "Error updating round:",
      error.response?.data || error.message
    );
    return "เกิดข้อผิดพลาดในการอัปเดตรอบ กรุณาลองใหม่";
  }
}

// ฟังก์ชันปิดรอบเล่นหลัก
async function updateMainPlay(event, status) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }
    const groupId = event.source.groupId || event.source.roomId;
    const isOpenMainStatus = await checkPreviousRoundStatus();
    const idMainRound = await checkMainRoundNow(event);

    if (status === "close" && !isOpenMainStatus) {
      return "ไม่พบรอบที่เปิดอยู่!!!";
    }

    const currentTime = new Date();
    const formattedTime =
      currentTime.getFullYear() +
      "-" +
      ("0" + (currentTime.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + currentTime.getDate()).slice(-2) +
      " " +
      ("0" + currentTime.getHours()).slice(-2) +
      ":" +
      ("0" + currentTime.getMinutes()).slice(-2) +
      ":" +
      ("0" + currentTime.getSeconds()).slice(-2) +
      "." +
      ("00" + currentTime.getMilliseconds()).slice(-3);
    const roundStatus = status === "open" ? 1 : 2;

    const payload = {
      round_status: roundStatus,
      groupId: groupId,
      end_time: formattedTime,
    };

    const response = await axios.patch(
      `${process.env.API_URL}/round/${idMainRound}`,
      payload
    );

    // เพิ่มการตรวจสอบข้อมูลที่ได้จาก API
    if (response && response.data) {
      return "ปิดรอบ";
    } else {
      throw new Error("ไม่สามารถปิดรอบได้ หรือไม่พบข้อมูล");
    }
  } catch (error) {
    return "เกิดข้อผิดพลาดในการอัปเดตรอบ กรุณาลองใหม่";
  }
}

// ฟังก์ชันเช็คสถานะรอบเล่นหลัก
async function checkPreviousRoundStatus() {
  try {
    const response = await axios.get(
      `${process.env.API_URL}/round/statusMain/latest`
    );

    // ตรวจสอบค่าจาก response.data ซึ่งควรเป็น boolean
    if (response.status === 200) {
      return response.data; // ค่าที่คืนจะเป็น true หรือ false
    }
    return false; // หากไม่สามารถรับค่าได้ จะคืนค่า false
  } catch (error) {
    console.error("Error checking previous round status:", error);
    return false; // หากเกิดข้อผิดพลาด, คืนค่าผลลัพธ์เป็น false
  }
}

// ฟังก์ชันเช็คสถานะรอบเล่นย่อย
async function checkPreviousSubRoundStatus() {
  try {
    const response = await axios.get(
      `${process.env.API_URL}/sub-round/statusSubMain/latest`
    );

    //console.log("response", response);

    // ตรวจสอบค่าจาก response.data ซึ่งควรเป็น boolean
    if (response.status === 200) {
      return response.data; // ค่าที่คืนจะเป็น true หรือ false
    }
    return false; // หากไม่สามารถรับค่าได้ จะคืนค่า false
  } catch (error) {
    console.error("Error checking previous round status:", error);
    return false; // หากเกิดข้อผิดพลาด, คืนค่าผลลัพธ์เป็น false
  }
}

//ฟังก์ชันเช็ครอบเล่นหลักล่าสุด
async function checkMainRoundNow(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    if (!groupId) {
      return "ไม่พบกลุ่ม กรุณาลองใหม่";
    }

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.get(
      `${process.env.API_URL}/round/latest-details`
    );

    return response.data.id;
  } catch (error) {
    console.error(
      "Error checking openPlayInday:",
      error.response?.data || error.message
    );

    return {
      error: true,
      message:
        error.response?.data?.message || "เกิดข้อผิดพลาดในการตรวจสอบสถานะ",
    };
  }
}

//ฟังก์ชันเช็ครอบเล่นย่อยล่าสุด
async function checkSubRoundNow(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    if (!groupId) {
      return "ไม่พบกลุ่ม กรุณาลองใหม่";
    }

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.get(
      `${process.env.API_URL}/sub-round/latest-details`
    );

    return response.data.id;
  } catch (error) {
    console.error(
      "Error checking openPlayInday:",
      error.response?.data || error.message
    );

    return {
      error: true,
      message:
        error.response?.data?.message || "เกิดข้อผิดพลาดในการตรวจสอบสถานะ",
    };
  }
}

//ฟังก์ชันเช็คข้อมูลรอบเล่นย่อยล่าสุด
async function checkSubRoundData(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    if (!groupId) {
      return "ไม่พบกลุ่ม กรุณาลองใหม่";
    }

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.get(
      `${process.env.API_URL}/sub-round/latest-details`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error checking openPlayInday:",
      error.response?.data || error.message
    );

    return {
      error: true,
      message:
        error.response?.data?.message || "เกิดข้อผิดพลาดในการตรวจสอบสถานะ",
    };
  }
}

//ฟังก์ชันเช็คจำนวนรอบหลักล่าสุด
async function checkMainRoundNumber(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    if (!groupId) {
      return "ไม่พบกลุ่ม กรุณาลองใหม่";
    }

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.get(
      `${process.env.API_URL}/group/${groupId}/main-round`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error checking openPlayInday:",
      error.response?.data || error.message
    );

    return {
      error: true,
      message:
        error.response?.data?.message || "เกิดข้อผิดพลาดในการตรวจสอบสถานะ",
    };
  }
}

//ฟังก์ชันเช็คจำนวนรอบย่อยล่าสุด
async function checkSubRoundNumber(event) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    if (!groupId) {
      return "ไม่พบกลุ่ม กรุณาลองใหม่";
    }

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.get(
      `${process.env.API_URL}/group/${groupId}/sub-round`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error checking openPlayInday:",
      error.response?.data || error.message
    );

    return {
      error: true,
      message:
        error.response?.data?.message || "เกิดข้อผิดพลาดในการตรวจสอบสถานะ",
    };
  }
}

// ฟังก์ชันตั้งราคาเล่น
async function setOpenOdds(event, oddsToSend, maxAmount) {
  try {
    const groupId = event.source.groupId || event.source.roomId;

    if (!groupId) {
      return "ไม่พบกลุ่ม กรุณาลองใหม่";
    }

    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const create_by = event.source.userId;

    const currentTime = new Date();
    const formattedTime =
      currentTime.getFullYear() +
      "-" +
      ("0" + (currentTime.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + currentTime.getDate()).slice(-2) +
      " " +
      ("0" + currentTime.getHours()).slice(-2) +
      ":" +
      ("0" + currentTime.getMinutes()).slice(-2) +
      ":" +
      ("0" + currentTime.getSeconds()).slice(-2) +
      "." +
      ("00" + currentTime.getMilliseconds()).slice(-3);

    const subround_number = await checkSubRoundNumber(event);
    const round_number = await checkMainRoundNow(event);

    // เตรียม payload
    const payload = {
      numberRound: subround_number,
      round: round_number,
      price: oddsToSend,
      status: 1,
      start_time: formattedTime,
      max_amount: maxAmount,
      createBy: create_by,
    };

    // เรียก API
    const response = await axios.post(
      `${process.env.API_URL}/sub-round`,
      payload
    );

    // ตรวจสอบการตอบสนองจาก API
    if (response.status === 200 || response.status === 201) {
      //console.log("API call succeeded:", response.data);
      return true;
    } else {
      //console.error("Unexpected response:", response.data);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.error(
        `ข้อผิดพลาดจาก API: ${
          error.response.data?.message || "ไม่สามารถอัปเดตกลุ่มได้"
        }`
      );
    }

    return false;
  }
}

// ฟังก์ชันปิดราคาเล่น
async function setCloseOdds(event) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const groupId = event.source.groupId || event.source.roomId;
    const isOpenMainStatus = await checkPreviousRoundStatus();
    const idSubRound = await checkSubRoundNow(event);

    const currentTime = new Date();
    const formattedTime =
      currentTime.getFullYear() +
      "-" +
      ("0" + (currentTime.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + currentTime.getDate()).slice(-2) +
      " " +
      ("0" + currentTime.getHours()).slice(-2) +
      ":" +
      ("0" + currentTime.getMinutes()).slice(-2) +
      ":" +
      ("0" + currentTime.getSeconds()).slice(-2) +
      "." +
      ("00" + currentTime.getMilliseconds()).slice(-3);

    const payload = {
      status: 2,
      end_time: formattedTime,
    };

    const response = await axios.patch(
      `${process.env.API_URL}/sub-round/${idSubRound}`,
      payload
    );

    // เพิ่มการตรวจสอบข้อมูลที่ได้จาก API
    if (response && response.data) {
      return "ปิดราคาเล่น";
    } else {
      throw new Error("ไม่สามารถปิดรอบได้ หรือไม่พบข้อมูล");
    }
  } catch (error) {
    return "เกิดข้อผิดพลาดในการอัปเดตรอบ กรุณาลองใหม่";
  }
}

// ฟังก์ชันปิดราคาเล่น
async function setPlayBet(event, betData) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const response = await axios.post(
      `${process.env.API_URL}/transaction-play`,
      betData
    );

    // เพิ่มการตรวจสอบข้อมูลที่ได้จาก API
    if (response && response.data) {
      return true;
    } else {
      throw new Error("ไม่สามารถปิดรอบได้ หรือไม่พบข้อมูล");
    }
  } catch (error) {
    return "เกิดข้อผิดพลาดในการอัปเดตรอบ กรุณาลองใหม่";
  }
}

async function checkUserPlay(event) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const userId = event.source.userId;
    const idMainRound = await checkMainRoundNow(event);

    const response = await axios.get(
      `${process.env.API_URL}/transaction-play/user/${userId}/round/${idMainRound}`
    );

    // ตรวจสอบข้อมูลใน response.data
    if (response.data && response.data.length > 0) {
      return response.data;
    } else {
      throw new Error("ไม่สามารถปิดรอบได้ หรือไม่พบข้อมูล");
    }
  } catch (error) {
    return "เกิดข้อผิดพลาด กรุณาลองใหม่";
  }
}

async function checkUserPlayBalance(event) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const userId = event.source.userId;
    const idMainRound = await checkMainRoundNow(event);

    const response = await axios.get(
      `${process.env.API_URL}/transaction-play/latest/user/${userId}/round/${idMainRound}`
    );

    // ตรวจสอบข้อมูลใน response.data
    if (response.data) {
      return response.data;
    } else {
      throw new Error("ไม่สามารถปิดรอบได้ หรือไม่พบข้อมูล");
    }
  } catch (error) {
    return "เกิดข้อผิดพลาด กรุณาลองใหม่";
  }
}

// ฟังก์ชันดึงข้อมูลสรุปรายการเล่น
async function fetchPlaySummary(event) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }
    const idMainRound = await checkMainRoundNow(event);

    const response = await axios.get(
      `${process.env.API_URL}/transaction-play/round/${idMainRound}`
    );

    if (response && response.data) {
      return response.data; // ข้อมูลสรุป
    } else {
      throw new Error("ไม่พบข้อมูลสรุปสำหรับรอบนี้");
    }
  } catch (error) {
    console.error("Error fetching play summary:", error);
    throw new Error("ไม่สามารถดึงข้อมูลสรุปได้");
  }
}


// ฟังก์ชันหลักสำหรับสร้าง Flex Message
async function generateFlexSummaryMessage(summary) {
  // จัดกลุ่มข้อมูลตามผู้ใช้
  const groupedData = summary.reduce((acc, item) => {
    if (!acc[item.user]) {
      acc[item.user] = [];
    }
    acc[item.user].push(item);
    return acc;
  }, {});

  const groupedEntries = Object.entries(groupedData);
  
  // ดึงชื่อผู้ใช้ทั้งหมดพร้อมกัน
  const userNames = await Promise.all(
    groupedEntries.map(async ([userID]) => getUserNameFromUserID(userID))
  );

  return {
    type: "flex",
    altText: "สรุปรายการเล่นก่อนปิดรอบ",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "สรุปรายการก่อนปิดรอบ",
            weight: "bold",
            size: "lg",
            color: "#1DB446",
            align: "center",
            margin: "none",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: groupedEntries.map(([userID, bets], userIndex) => {
          const isLastUser = userIndex === groupedEntries.length - 1;
          
          const userContent = {
            type: "box",
            layout: "vertical",
            margin: "sm",
            contents: [
              {
                type: "text",
                text: `${userIndex + 1}) ${userNames[userIndex]}`,
                size: "sm",
                weight: "bold",
                color: "#111111",
              },
              ...bets.slice(0, 4).map((bet, betIndex) => ({
                type: "text",
                text: `ยก #${bet.round.numberMainRound} | ${bet.betType === "RED" ? "ด" : "ง"} = ${bet.betAmount.toLocaleString()} | ${bet.subRound.price}`,
                size: "sm",
                weight: "bold",
                color: (() => {
                  const price = bet.subRound.price;
                  if (price.startsWith("ตร")) {
                    return "#1DB446"; // สีเขียน
                  } else if (price.startsWith("สด")) {
                    return "#d7686a"; // สีแดง
                  } else if (price.startsWith("สง")) {
                    return "#6ea7dc"; // สีน้ำเงิน
                  } else if (price.startsWith("ด")) {
                    return "#d7686a"; // สีแดง
                  } else if (price.startsWith("ง")) {
                    return "#6ea7dc"; // สีน้ำเงิน
                  }
                  return "#1DB446"; // สีเริ่มต้น
                })(),
                margin: betIndex === 0 ? "none" : "xs",
                align: "end",
              })),
            ],
          };

          if (!isLastUser) {
            return [
              userContent,
              {
                type: "separator",
                margin: "md",
                color: "#000000"
              }
            ];
          }

          return [userContent];
        }).flat(),
      },
    },
  };
}


module.exports = {
  setPlayInday,
  setMainPlay,
  updateMainPlay,
  checkOpenPlayInday,
  resetMainRound,
  setNumberMainRound,
  checkPreviousRoundStatus,
  checkMainRoundNow,
  setOpenOdds,
  checkPreviousSubRoundStatus,
  setCloseOdds,
  setNumberSubRound,
  resetSubRound,
  checkSubRoundData,
  setPlayBet,
  checkUserPlay,
  checkUserPlayBalance,
  fetchPlaySummary,
  generateFlexSummaryMessage,
};
