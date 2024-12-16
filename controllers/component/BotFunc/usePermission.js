// usePermission.js

const { getUserRole } = require("../BotFunc/userController");

// ฟังก์ชันนี้จะตรวจสอบสิทธิ์ของผู้ใช้
async function checkUserRole(event, allowedRoles = ["Superadmin", "Admin"]) {
  try {
    // ดึงข้อมูล role ของผู้ใช้จาก getUserRole
    const userRoleResponse = await getUserRole(event.source.userId);

    // ตรวจสอบว่า response ได้ข้อมูลมาอย่างถูกต้องหรือไม่
    if (!userRoleResponse || !userRoleResponse.data) {
      return { success: false, message: "ไม่สามารถดึงข้อมูลสิทธิ์ของผู้ใช้ได้" };
    }

    const userRole = userRoleResponse.data;

    // เช็คว่า userRole อยู่ใน list ของ allowedRoles หรือไม่
    if (!allowedRoles.includes(userRole)) {
      return { success: false, message: "คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้" };
    }

    // ถ้าผ่านการตรวจสอบสิทธิ์แล้ว
    return { success: true, role: userRole };
  } catch (error) {
    console.error("Error checking user role:", error);
    
    // เพิ่มการส่งข้อความข้อผิดพลาดที่มีรายละเอียดมากขึ้น
    return { success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ กรุณาลองใหม่อีกครั้ง" };
  }
}

module.exports = { checkUserRole };
