const axios = require("axios");
require("dotenv").config();

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

    console.log("response", response);

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

async function setOpenOdds(event, oddsToSend) {
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

    // ตรวจสอบค่า subround_number
    let subround_number = await checkSubRoundNumber(event);

    subround_number = Number(subround_number);
    if (isNaN(subround_number)) {
      subround_number = 0;
    }
    subround_number += 1;

    // ตรวจสอบค่า round_number
    const round_number = await checkMainRoundNow(event)

    // เตรียม payload
    const payload = {
      numberRound: subround_number,
      round: round_number,
      price: oddsToSend,
      status: 1,
      start_time: formattedTime,
      createBy: create_by,
    };

    // เรียก API
    const response = await axios.post(`${process.env.API_URL}/sub-round`, payload);

    // ตรวจสอบการตอบสนองจาก API
    if (response.status === 200 || response.status === 201) {
      //console.log("API call succeeded:", response.data);
      return true;
    } else {
      //console.error("Unexpected response:", response.data);
      return false;
    }
  } catch (error) {
    //console.error("เกิดข้อผิดพลาดใน setOpenOdds:", error.message);

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

// ฟังก์ชันปิดรอบเล่นหลัก
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
      return "กรุณารอราคาถัดไป!!!";
    } else {
      throw new Error("ไม่สามารถปิดรอบได้ หรือไม่พบข้อมูล");
    }
  } catch (error) {
    return "เกิดข้อผิดพลาดในการอัปเดตรอบ กรุณาลองใหม่";
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
};
