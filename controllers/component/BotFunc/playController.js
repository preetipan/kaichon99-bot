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
      return `ข้อผิดพลาดจาก API: ${error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
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
      return `ข้อผิดพลาดจาก API: ${error.response.data.message || "ไม่สามารถตรวจสอบสถานะได้"
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
      return `ข้อผิดพลาดจาก API: ${error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
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
      return `ข้อผิดพลาดจาก API: ${error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
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
      return `ข้อผิดพลาดจาก API: ${error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
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
      return `ข้อผิดพลาดจาก API: ${error.response.data.message || "ไม่สามารถอัปเดตกลุ่มได้"
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


// ฟังก์ชันอัพเดตผลการแข่งขัน
async function setResultMainPlay(event, result) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const resultS = result === "ด"
      ? "WIN_RED"
      : result === "ง"
        ? "WIN_BLUE"
        : result === "ส"
          ? "DRAW"
          : null;

    if (!resultS) {
      throw new Error("Invalid result value. It must be 'ด', 'ง', or 'ส'.");
    }

    const Round_id = await checkMainRoundNow(event);

    if (!Round_id) {
      throw new Error("Failed to fetch Round ID. Please check the event data.");
    }

    const payload = {
      result: resultS
    };

    const response = await axios.patch(`${process.env.API_URL}/round/${Round_id}`, payload);

    const confirmationMessage = `ผลการแข่งขันถูกบันทึกสำเร็จ: ${resultS}`;

    return confirmationMessage;
  } catch (error) {
    console.error(
      "Error updating round:",
      error.response?.data || error.message
    );
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

    const summary = await fetchPlaySummary(event);
    const flexMessage = await generateFlexSummaryMessage(summary);

    const messages = [
      {
        type: "text",
        text: "ปิดรอบ",
      },
      flexMessage,
    ];

    // เพิ่มการตรวจสอบข้อมูลที่ได้จาก API
    if (response && response.data) {
      return messages;
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
        `ข้อผิดพลาดจาก API: ${error.response.data?.message || "ไม่สามารถอัปเดตกลุ่มได้"
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

// ฟังก์ชั่นเช็คข้อมูลการเล่นของ User
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

// ฟังก์ชั่นเช็คยอดที่สามารถเล่นได้ คงเหลือของUser
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
  // ถ้าไม่มีข้อมูลให้แสดงข้อความว่า "ไม่มีรายการเล่น"
  if (summary.length === 0) {
    return {
      type: "flex",
      altText: "ไม่มีรายการเล่น",
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
          contents: [
            {
              type: "text",
              text: "ไม่มีรายการเล่น",
              size: "md",
              weight: "bold",
              color: "#111111",
              align: "center",
            },
          ],
        },
      },
    };
  }

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
                size: "md",
                weight: "bold",
                color: "#111111",
              },
              ...bets.slice(0, 4).map((bet, betIndex) => ({
                type: "text",
                text: `ยก #${bet.round.numberMainRound} | ${bet.betType === "RED" ? "ด" : "ง"} = ${bet.betAmount.toLocaleString()} | ${bet.subRound.price}`,
                size: "md",
                weight: "bold",
                color: bet.betType === "RED" ? "#d7686a" : "#6ea7dc",
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

// ฟังก์ชันสรุปเงินคงเหลือล่าสุดก่อนสรุปผล
async function updateRemainingFund(summary, resultStatus) {
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL is not defined in .env");
    }

    const usersToUpdate = summary.map((item) => item.user);
    const uniqueUsersToUpdate = [...new Set(usersToUpdate)];

    // ใช้ Promise.all เพื่ออัพเดตหลายๆ ผู้ใช้พร้อมกัน
    const updateResults = await Promise.all(uniqueUsersToUpdate.map(async (userId) => {
      try {
        const userSummary = summary.find((item) => item.user === userId);
        const sum_result = calculateUserSummary(summary, userId);

        // ดึงข้อมูลผู้ใช้งาน
        const userData = await axios.get(`${process.env.API_URL}/user/${userId}`);

        // กำหนด remainingFund จาก userData หรือค่าที่คำนวณมา
        const remainingFund = userData.data.remainingFund || 0;

        return {
          userData: userData.data,
          ...userSummary,
          remainingFund: remainingFund,
          sum_results: sum_result.total,
        };
      } catch (error) {
        console.error(`Error updating fund for user ${userId}:`, error);
        return null;
      }
    }));

    // กรองข้อมูลที่มีค่า null
    const validResults = updateResults.filter(result => result !== null);

    // สร้าง Flex message contents
    const flexContents = await Promise.all(validResults.map(async (result) => {
      try {
        let cal = result.userData.fund || 0;
        if (resultStatus === "Old") {
          cal = Math.floor(parseFloat(result.remainingFund) + parseFloat(result.sum_results));
        } else {
          cal = Math.floor(parseFloat(result.userData.fund) + parseFloat(result.sum_results));
        }

        const userName = await getUserNameFromUserID(result.userData.userID);

        // อัปเดตข้อมูล fund ของผู้ใช้
        await axios.patch(`${process.env.API_URL}/user/${result.userData.userID}`, { fund: cal });

        return {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: `${result.userData.id}) ${userName}`,
              size: "sm",
              color: "#000000",
              flex: 2,
              wrap: true,
            },
            {
              type: "text",
              text: "|",
              size: "sm",
              color: "#AAAAAA",
              flex: 0,
              align: "center",
            },
            {
              type: "text",
              text: `${result.sum_results} = ${cal}`,
              size: "sm",
              color: "#000000",
              flex: 2,
              align: "end",
            },
          ],
        };
      } catch (error) {
        console.error(`Error processing user ${result.userData.userID}:`, error);
        return null;
      }
    }));

    // กรองข้อมูล Flex Contents ที่มีค่า null
    const validFlexContents = flexContents.filter(content => content !== null);

    // คืนค่า Flex Message
    return {
      type: "flex",
      altText: `สรุปรอบย่อย #${validResults[0]?.group?.main_round_number || "N/A"}`,
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `สรุปรอบย่อย #${validResults[0]?.group?.main_round_number || "N/A"}`,
              weight: "bold",
              size: "md",
              color: "#22c35e",
              margin: "sm",
              align: "center",
            },
            {
              type: "box",
              layout: "vertical",
              spacing: "md",
              margin: "lg",
              contents: validFlexContents,
            },
          ],
          paddingAll: "lg",
        },
        styles: {
          body: {
            backgroundColor: "#FFFFFF",
          },
        },
      },
    };
  } catch (error) {
    console.error("Error updating remaining fund:", error);
    throw new Error("ไม่สามารถอัปเดตข้อมูลได้");
  }
}




function calculateUserSummary(summary, userID) {
  const PRICE_RULES = {
    RED: {
      "ตร": 0.9, "สด": 0.8, "ด8.5": 0.75, "ด8": 0.7, "ด7.5": 0.65, "ด7": 0.6,
      "ด6.5": 0.55, "ด6": 0.5, "ด5.5": 0.45, "ด5": 0.4, "ด4.5": 0.35, "ด4": 0.3,
      "ด3.5": 0.25, "ด3": 0.2, "ด2.5": 0.15, "ด2": 0.1, "ด1": 0.067, "ด100": 0.01,
      "สง": 1, "ง8.5": 1.05, "ง8": 1.11, "ง7.5": 1.17, "ง7": 1.25, "ง6.5": 1.33,
      "ง6": 1.42, "ง5.5": 1.53, "ง5": 1.66, "ง4.5": 1.81, "ง4": 2, "ง3.5": 2.22,
      "ง3": 2.5, "ง2.5": 2.85, "ง2": 3.33, "ง1": 10, "ง100": 20,
    },
    BLUE: {
      "ตร": 0.9, "สง": 0.8, "ง8.5": 0.75, "ง8": 0.7, "ง7.5": 0.65, "ง7": 0.6,
      "ง6.5": 0.55, "ง6": 0.5, "ง5.5": 0.45, "ง5": 0.4, "ง4.5": 0.35, "ง4": 0.3,
      "ง3.5": 0.25, "ง3": 0.2, "ง2.5": 0.15, "ง2": 0.1, "ง1": 0.067, "ง100": 0.01,
      "สด": 1, "ด8.5": 1.05, "ด8": 1.11, "ด7.5": 1.17, "ด7": 1.25, "ด6.5": 1.33,
      "ด6": 1.42, "ด5.5": 1.53, "ด5": 1.66, "ด4.5": 1.81, "ด4": 2, "ด3.5": 2.22,
      "ด3": 2.5, "ด2.5": 2.85, "ด2": 3.33, "ด1": 10, "ด100": 20,
    },
  };

  const userSummary = summary.filter((item) => item.user === userID);

  const results = [];

  userSummary.forEach((item) => {
    const { betType, betAmount, round, subRound } = item;

    const priceRule = PRICE_RULES[betType][subRound.price];

    let resultSummary = {};

    if (
      (round.result === "WIN_BLUE" && betType === "BLUE") ||
      (round.result === "WIN_RED" && betType === "RED")
    ) {
      const profit = betAmount * priceRule;
      resultSummary = {
        user: item.user,
        betType,
        betAmount,
        profit,
        status: "WIN",
        subRound: subRound.numberRound,
        mainRound: round.numberMainRound,
      };
    } else {
      resultSummary = {
        user: item.user,
        betType,
        betAmount,
        loss: betAmount,
        status: "LOSE",
        subRound: subRound.numberRound,
        mainRound: round.numberMainRound,
      };
    }

    results.push(resultSummary);
  });

  // คำนวณผลรวม
  const total = results.reduce((acc, item) => {
    if (item.profit) {
      acc += item.profit;
    }
    if (item.loss) {
      acc -= item.loss;
    }
    return acc;
  }, 0);

  // แสดงผลรวม
  //console.log("Total result: ", total);
  //console.log("results : ",results)
  //return results;
  return {
    data: results,
    total: total
  }
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
  setResultMainPlay,
  updateRemainingFund,
};
