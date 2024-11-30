const axios = require("axios");

// ฟังก์ชันเช็คสิทธิ์โดยการส่ง userID ไปยัง API
async function checkPermission(userId) {
  try {
    // ส่ง request ไปยัง API ของคุณเพื่อเช็คสิทธิ์ของผู้ใช้
    const response = await axios.get(`${process.env.API_URL}/user/permission/${userId}`);

    // ตรวจสอบว่า API ส่งข้อมูลสิทธิ์ของผู้ใช้กลับมา
    if (response.status === 200 && response.data) {
      const { permission } = response.data; // สมมติว่า API ส่งข้อมูลสิทธิ์เป็น `permission`
      return permission;
    } else {
      throw new Error("ไม่สามารถดึงข้อมูลสิทธิ์ได้");
    }
  } catch (error) {
    console.error("Error checking permission:", error);
    throw new Error("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์");
  }
}

// การใช้งานฟังก์ชัน
async function handleEvent(event) {
  const userId = event.source.userId; // สมมติว่าเราได้ userId จาก event

  try {
    const permission = await checkPermission(userId); // เช็คสิทธิ์ของผู้ใช้

    // ทำการตรวจสอบสิทธิ์ (สมมติว่า 1 คือ admin, 2 คือ user ทั่วไป)
    if (permission === 1) {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "คุณมีสิทธิ์เป็น admin",
      });
    } else {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้",
      });
    }
  } catch (error) {
    console.error("Error handling event:", error);
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
    });
  }
}
