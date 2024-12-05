const { Client } = require("@line/bot-sdk");
const { channelAccessToken } = require("../../../config");
const {
  getSortedUserDetails,
  AddMember,
  checkIfUserExists,
  getUserRole,
  getUserMoney,
  updateAdminData,
} = require("../BotFunc/userController");
const {
  getBankAccountDetails,
  depositMoneyCredit,
  depositMoneyCash,
  withdrawMoney,
} = require("../BotFunc/bankAccountController");
const {
  setGroup,
  setHilo,
  setCock,
  getGroupMembers,
} = require("../BotFunc/groupController");

const client = new Client({ channelAccessToken });


// Handle setGroup# command
async function handleSetGroupCommand(event, userMessage) {
    // ตรวจสอบสิทธิ์ของผู้ใช้ก่อน
    const userRoleResponse = await getUserRole(event.source.userId);
    const userRole = userRoleResponse.data;
  
    if (userRole !== "Superadmin") {
      // ถ้าไม่ใช่ Superadmin ก็ไม่สามารถใช้งานคำสั่งนี้ได้
      return null;
    }
  
    const groupName = userMessage.substring(9).trim();
    if (groupName) {
      try {
        const confirmationMessage = await setGroup(event, groupName);
        return { type: "text", text: confirmationMessage };
      } catch (error) {
        console.error("Error setting group:", error);
        return sendErrorMessage(
          event,
          "เกิดข้อผิดพลาดในการตั้งค่ากลุ่ม กรุณาลองใหม่"
        );
      }
    } else {
      return sendErrorMessage(event, "กรุณาระบุชื่อกลุ่มหลังคำสั่ง setgroup#");
    }
  }
  
  // Handle "เพิ่มทั้งหมด" command
  async function handleAddAllMembers(event) {
    // ตรวจสอบสิทธิ์
    const userRoleResponse = await getUserRole(event.source.userId);
    const userRole = userRoleResponse.data;
    if (userRole !== "Superadmin") {
      return null;
    }
  
    const groupId = event.source.groupId || event.source.roomId;
    if (!groupId) {
      return sendErrorMessage(event, "ไม่สามารถระบุ groupId หรือ roomId ได้");
    }
  
    try {
      const result = await getGroupMembers(groupId);
      return {
        type: "text",
        text: result.message || "เพิ่มสมาชิกทั้งหมดในกลุ่มเรียบร้อยแล้ว!",
      };
    } catch (error) {
      console.error("Error adding members:", error);
      return sendErrorMessage(
        event,
        `เกิดข้อผิดพลาดในการเพิ่มสมาชิก: ${error.message}`
      );
    }
  }
  
  // Handle updating admin role
  async function handleUpdateAdminRole(event, userMessage, admin) {
    try {
      const { data: userRole } = await getUserRole(event.source.userId);
      if (!["Superadmin", "Admin"].includes(userRole)) {
        return null;
      }
  
      // Extract userId from message
      const userIdMatch = userMessage.match(/^@([^\s]+)\/\/admin$/);
      if (!userIdMatch) {
        return sendErrorMessage(
          event,
          "คำสั่งไม่ถูกต้อง. ตัวอย่าง: @username//admin"
        );
      }
  
      const userId = userIdMatch[1];
  
      let profileName = "ไม่รู้จักชื่อ";
      try {
        const profile = await client.getProfile(userId);
        if (profile && profile.displayName) {
          profileName = profile.displayName;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
  
      // Determine the role to assign based on the admin value
      let newRole;
      let roleName;
  
      if (admin === 1) {
        newRole = 2; // แอดมิน
        roleName = "แอดมิน";
      } else if (admin === 2) {
        newRole = 3; // สมาชิกทั่วไป
        roleName = "สมาชิกทั่วไป";
      } else {
        return sendErrorMessage(event, "ไม่พบบทบาทที่ถูกต้อง");
      }
  
      // Update the user's role
      const updateResult = await updateAdminData(userId, event.source.groupId, {
        role: newRole,
      });
      if (updateResult.success) {
        const replyMessage = {
          type: "text",
          text: `${profileName} ได้รับการอัปเดตเป็น ${roleName} เรียบร้อยแล้ว!`,
        };
        return client.replyMessage(event.replyToken, replyMessage);
      } else {
        return sendErrorMessage(event, `ไม่สามารถอัปเดตสิทธิ์ ${roleName} ได้`);
      }
    } catch (error) {
      console.error("Error updating admin role:", error);
      return sendErrorMessage(event, "เกิดข้อผิดพลาดในการอัปเดตสิทธิ์");
    }
  }
  
  //ฝากเงินเครดิต
  async function handleTopUpCredit(event, userMessage) {
    try {
      const userRoleResponse = await getUserRole(event.source.userId);
      const userRole = userRoleResponse.data;
  
      if (userRole !== "Superadmin" && userRole !== "Admin") {
        return sendErrorMessage(event, "คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้");
      }
  
      // ตรวจสอบและดึงข้อมูลจากข้อความ
      const match = userMessage.match(/\+\+(\d+)=([\d]+)/);
      if (!match) {
        return sendErrorMessage(
          event,
          "รูปแบบคำสั่งไม่ถูกต้อง\nตัวอย่าง: ++รหัสผู้ใช้=1000=200"
        );
      }
  
      const userCode = match[1]; // รหัสผู้ใช้
      const amount = parseInt(match[2], 10); // จำนวนเงิน
  
      // ตรวจสอบว่าจำนวนเงินต้องเป็นค่าบวก
      if (amount <= 0) {
        return sendErrorMessage(event, "จำนวนเงินต้องมากกว่า 0 บาท");
      }
  
      // ดำเนินการเติมเงิน
      const response = await depositMoneyCredit(userCode, amount);
      if (response && response.type === "text") {
        return client.replyMessage(event.replyToken, response); // ส่งข้อความที่ได้จาก depositMoneyCredit
      } else {
        throw new Error(response.message || "ไม่สามารถเติมเงินได้");
      }
    } catch (error) {
      console.error("Error in handleTopUpCredit:", error.message);
      return sendErrorMessage(
        event,
        `เกิดข้อผิดพลาด: ${error.message || "กรุณาลองใหม่"}`
      );
    }
  }
  
  // Handle ฝากเงินสด command
  async function handleCashCustomer(event, userMessage) {
    try {
      const userRoleResponse = await getUserRole(event.source.userId);
      const userRole = userRoleResponse.data;
  
      if (userRole !== "Superadmin" && userRole !== "Admin") {
        return sendErrorMessage(event, "คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้");
      }
  
      // ตรวจสอบและดึงข้อมูลจากข้อความ
      const match = userMessage.match(/\+(\d+)=([\d]+)/);
      if (!match) {
        return sendErrorMessage(
          event,
          "รูปแบบคำสั่งไม่ถูกต้อง\nตัวอย่าง: +รหัสผู้ใช้=1000=200"
        );
      }
  
      const userCode = match[1]; // รหัสผู้ใช้
      const amount = parseInt(match[2], 10); // จำนวนเงิน
  
      // ตรวจสอบว่าจำนวนเงินต้องเป็นค่าบวก
      if (amount <= 0) {
        return sendErrorMessage(event, "จำนวนเงินต้องมากกว่า 0 บาท");
      }
  
      // ดำเนินการบันทึกข้อมูลลูกค้าเงินสด
      const response = await depositMoneyCash(userCode, amount); // ฟังก์ชันฝากเงินสด
      if (response && response.type === "text") {
        return client.replyMessage(event.replyToken, response); // ส่งข้อความที่ได้จาก depositMoneyCredit
      } else {
        throw new Error(response.message || "ไม่สามารถเติมเงินได้");
      }
    } catch (error) {
      console.error("Error in handleCashCustomer:", error.message);
      return sendErrorMessage(
        event,
        `เกิดข้อผิดพลาด: ${error.message || "กรุณาลองใหม่"}`
      );
    }
  }
  
  // Handle ถอนเงิน command
  async function handleWithdrawMoney(event, userMessage) {
    try {
      const userRoleResponse = await getUserRole(event.source.userId);
      const userRole = userRoleResponse.data;
  
      if (userRole !== "Superadmin" && userRole !== "Admin") {
        return sendErrorMessage(event, "คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้");
      }
  
      // ตรวจสอบและดึงข้อมูลจากข้อความ
      const match = userMessage.match(/\-(\d+)=([\d]+)/); // รูปแบบคำสั่ง: -รหัสผู้ใช้=1000=200
      if (!match) {
        return sendErrorMessage(
          event,
          "รูปแบบคำสั่งไม่ถูกต้อง\nตัวอย่าง: -รหัสผู้ใช้=1000=200"
        );
      }
  
      const userCode = match[1]; // รหัสผู้ใช้
      const amount = parseInt(match[2], 10); // จำนวนเงิน
  
      // ตรวจสอบว่าจำนวนเงินต้องเป็นค่าบวก
      if (amount <= 0) {
        return sendErrorMessage(event, "จำนวนเงินต้องมากกว่า 0 บาท");
      }
  
      // ดำเนินการถอนเงิน
      const response = await withdrawMoney(userCode, amount); // ฟังก์ชันถอนเงิน
      if (response && response.type === "text") {
        return client.replyMessage(event.replyToken, response); // ส่งข้อความที่ได้จาก depositMoneyCredit
      } else {
        throw new Error(response.message || "ไม่สามารถถอนเงินได้");
      }
    } catch (error) {
      console.error("Error in handleWithdrawMoney:", error.message);
      return sendErrorMessage(
        event,
        `เกิดข้อผิดพลาด: ${error.message || "กรุณาลองใหม่"}`
      );
    }
  }
  
  // Handle setHilo command (เปิด/ปิด)
  async function handleSetHiloCommand(event, status) {
    try {
      const confirmationMessage = await setHilo(event, status);
      return { type: "text", text: confirmationMessage };
    } catch (error) {
      console.error("Error setting Hilo:", error);
      return sendErrorMessage(
        event,
        `เกิดข้อผิดพลาดในการ${status}ไฮโล กรุณาลองใหม่`
      );
    }
  }
  
  // Handle setCock command (เปิด/ปิด)
  async function handleSetCockCommand(event, status) {
    try {
      const confirmationMessage = await setCock(event, status);
      return { type: "text", text: confirmationMessage };
    } catch (error) {
      console.error("Error setting Cock:", error);
      return sendErrorMessage(
        event,
        `เกิดข้อผิดพลาดในการ${status}ไก่ชน กรุณาลองใหม่`
      );
    }
  }
  
  // Handle bank account details
  async function handleBankAccountDetails(event) {
    try {
      const groupId = event.source.groupId;
      const userId = event.source.userId;
      const member = await client.getGroupMemberProfile(groupId, userId);
      const bankAccountMessage = getBankAccountDetails(member);
  
      return client.replyMessage(event.replyToken, [bankAccountMessage]);
    } catch (error) {
      console.error("Error fetching bank account details:", error);
      return sendErrorMessage(
        event,
        "เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี กรุณาลองใหม่"
      );
    }
  }
  
  // Handle handleTestDetails
  async function handleTestDetails(event) {
    try {
      // ดึงข้อมูลสมาชิกจาก LINE API
      const groupId = event.source.groupId; // ใช้ groupId จาก event
      const userId = event.source.userId; // ใช้ userId จาก event
      const member = await client.getGroupMemberProfile(groupId, userId);
  
      const replyMessage = {
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
                text: "9922120029",
                weight: "bold",
                size: "xl",
                align: "center",
                color: "#FFFFFF",
              },
              {
                type: "text",
                text: "ไทยพาณิชย์\nปรีติพันธ์ สุทธิพันธ์",
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
                  uri: "line://app/clipboard?text=9922120029",
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
                  uri: "line://ti/p/@892xtjpl",
                },
                margin: "sm",
              },
            ],
            backgroundColor: "#5A2D82",
          },
        },
      };
  
      // ส่ง Flex Message กลับไปยังผู้ใช้
      return client.replyMessage(event.replyToken, replyMessage);
    } catch (error) {
      console.error("Error fetching member profile:", error);
      return sendErrorMessage(
        event,
        "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก กรุณาลองใหม่"
      );
    }
  }
  
  // Handle user details
  async function handleUserDetails(event) {
    try {
      const userDetailsMessage = await getSortedUserDetails();
      return client.replyMessage(event.replyToken, userDetailsMessage);
    } catch (error) {
      console.error("Error fetching user details:", error);
      return sendErrorMessage(
        event,
        "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ กรุณาลองใหม่"
      );
    }
  }
  
  // เช็คยอดเงิน
  async function handleUserCheckMoney(event) {
    const { groupId, userId } = event.source;
    try {
      const member = await client.getGroupMemberProfile(groupId, userId);
      if (!member) {
        return sendErrorMessage(event, "ไม่สามารถดึงข้อมูลสมาชิกได้");
      }
  
      // ตรวจสอบว่า userId นี้มีอยู่ในฐานข้อมูลหรือไม่
      const isUserExist = await checkIfUserExists(userId);
      if (!isUserExist) {
        console.log(`User ${userId} does not exist, adding user to database...`);
        await AddMember(member);
      }
  
      // ดึงข้อมูลยอดเงินของผู้ใช้
      const userDetailsMessage = await getUserMoney(userId, member);
      return client.replyMessage(event.replyToken, [userDetailsMessage]);
    } catch (error) {
      console.error("Error in handleUserCheckMoney:", error);
      return sendErrorMessage(event, "กรุณากด c ใหม่อีกครั้ง");
    }
  }
  
  // Helper function to send error messages
  function sendErrorMessage(event, message) {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: message,
    });
  }


  module.exports = {
    sendErrorMessage,
    handleUserCheckMoney,
    handleUserDetails,
    handleTestDetails,
    handleSetCockCommand,
    handleBankAccountDetails,
    handleSetHiloCommand,
    handleWithdrawMoney,
    handleCashCustomer,
    handleTopUpCredit,
    handleUpdateAdminRole,
    handleAddAllMembers,
    handleSetGroupCommand,
  };