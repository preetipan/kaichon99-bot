const { Client } = require("@line/bot-sdk");
const { channelAccessToken } = require("../../../config");
const axios = require('axios');

const {
  getSortedUserDetails,
  AddMember,
  checkIfUserExists,
  getUserMoney,
  updateAdminData,
  checkUserData,
  checkUserDataByID,
} = require("../BotFunc/userController");
const {
  getBankAccountDetails,
  depositMoneyCredit,
  depositMoneyCash,
  withdrawMoney,
  transationMoney,
} = require("../BotFunc/bankAccountController");
const {
  setGroup,
  setSubGroup,
  setHilo,
  setCock,
  getGroupMembers,
} = require("../BotFunc/groupController");
const {
  setPlayInday,
  setMainPlay,
  updateMainPlay,
  checkOpenPlayInday,
  resetMainRound,
  setResultMainPlay,
  setNumberMainRound,
  checkPreviousRoundStatus,
  setOpenOdds,
  checkPreviousSubRoundStatus,
  setCloseOdds,
  setNumberSubRound,
  checkSubRoundData,
  setPlayBet,
  checkUserPlayBalance,
  fetchPlaySummary,
  updateRemainingFund,
  resetSubRound,
} = require("../BotFunc/playController");
const { checkUserRole } = require("../BotFunc/usePermission");

const client = new Client({ channelAccessToken });

// Handle setGroup# command
async function handleSetGroupCommand(event, userMessage) {
  // ตรวจสอบสิทธิ์ของผู้ใช้ก่อน
  const permissionResult = await checkUserRole(event, ["Superadmin"]);
  if (!permissionResult.success) {
    return null;
  }

  const groupName = userMessage.substring(9).trim();
  if (groupName) {
    try {
      const user_id = event.source.userId;
      const confirmationMessage = await setGroup(event, groupName, user_id);

      return client.replyMessage(event.replyToken, {
        type: "text",
        text: confirmationMessage,
      });
      // return { type: "text", text: confirmationMessage };
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

// Handle setSubGroup# command
async function handleSetSubGroupCommand(event, userMessage) {
  // ตรวจสอบสิทธิ์ของผู้ใช้ก่อน
  const permissionResult = await checkUserRole(event, ["Superadmin"]);
  if (!permissionResult.success) {
    return null;
  }

  const messageContent = userMessage.substring(12).trim();
  const groupNames = messageContent.split("#");

  if (groupNames.length === 2) {
    const mainGroupName = groupNames[0]?.trim();
    const subGroupName = groupNames[1]?.trim();

    console.log("mainGroupName : " + mainGroupName);
    console.log("subGroupName : " + subGroupName);

    // ถ้าทั้งสองชื่อไม่เป็นค่าว่าง
    if (mainGroupName && subGroupName) {
      const confirmationMessage = await setSubGroup(
        event,
        mainGroupName,
        subGroupName
      );

      return client.replyMessage(event.replyToken, {
        type: "text",
        text: confirmationMessage,
      });
      // return { type: "text", text: confirmationMessage };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// Handle "เพิ่มทั้งหมด" command
async function handleAddAllMembers(event) {
  // ตรวจสอบสิทธิ์
  const permissionResult = await checkUserRole(event, ["Superadmin"]);
  if (!permissionResult.success) {
    return null;
  }

  const groupId = event.source.groupId || event.source.roomId;
  if (!groupId) {
    return sendErrorMessage(event, "ไม่สามารถระบุ groupId หรือ roomId ได้");
  }

  try {
    const confirmationMessage = await getGroupMembers(groupId);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: confirmationMessage,
    });
    // return {
    //   type: "text",
    //   text: result.message || "เพิ่มสมาชิกทั้งหมดในกลุ่มเรียบร้อยแล้ว!",
    // };
  } catch (error) {
    console.error("Error adding members:", error);
    return sendErrorMessage(
      event,
      `เกิดข้อผิดพลาดในการเพิ่มสมาชิก: ${error.message}`
    );
  }
}

// Handle เพิ่มสิทธิ์ แอดมิน
async function handleUpdateAdminRole(event, userMessage, admin) {
  try {
    // ตรวจสอบสิทธิ์ของผู้ใช้ (Superadmin หรือ Admin)
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);
    if (!permissionResult.success) {
      return null;
    }

    // ใช้ regex เพื่อจับคู่ข้อความในรูปแบบ @username +admin หรือ @username -admin
    const userIdMatch = userMessage.match(/^@([^\s]+)\s*(\+admin|-admin)$/i);

    console.log("userIdMatch:", userIdMatch); // ตรวจสอบผลลัพธ์จาก match

    if (!userIdMatch) {
      return sendErrorMessage(
        event,
        "คำสั่งไม่ถูกต้อง. ตัวอย่าง: @username +admin หรือ @username -admin"
      );
    }

    // ดึง userId และ คำสั่ง (+admin หรือ -admin) ออกจากข้อความ
    const userId = userIdMatch[1]; // ชื่อผู้ใช้ที่ได้รับจากข้อความ
    const action = userIdMatch[2]; // +admin หรือ -admin

    let profileName = "ไม่รู้จักชื่อ";
    try {
      // ใช้ userId ที่ถูกต้องจากข้อความที่จับได้
      const profile = await client.getProfile(userId);
      console.log("profile : " + profile);
      if (profile && profile.displayName) {
        profileName = profile.displayName;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      profileName = "ไม่พบโปรไฟล์";
    }

    let newRole;
    let roleName;

    if (action === "+admin") {
      newRole = 2; // แอดมิน
      roleName = "แอดมิน";
    } else if (action === "-admin") {
      newRole = 3; // สมาชิกทั่วไป
      roleName = "สมาชิกทั่วไป";
    } else {
      return sendErrorMessage(event, "ไม่พบคำสั่งที่ถูกต้อง");
    }

    const updateResult = await updateAdminData(userId, event.source.groupId, {
      role: newRole,
    });

    if (updateResult && updateResult.success) {
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

// Handle ฝากเงินเครดิต command
async function handleTopUpCredit(event, userMessage) {
  try {
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);

    console.log("permissionResult:", permissionResult);
    if (!permissionResult.success) {
      return null;
    }

    // ตรวจสอบและดึงข้อมูลจากข้อความ
    const match = userMessage.match(/^(\d+)=\+\+([\d]+)$/);
    if (!match) {
      return sendErrorMessage(
        event,
        "รูปแบบคำสั่งไม่ถูกต้อง\nตัวอย่าง: รหัสผู้ใช้=++1000"
      );
    }

    const userCode = match[1]; // รหัสผู้ใช้
    const amount = parseInt(match[2], 10); // จำนวนเงิน

    // ตรวจสอบว่าจำนวนเงินต้องเป็นค่าบวก
    if (amount <= 0) {
      return sendErrorMessage(event, "จำนวนเงินต้องมากกว่า 0 บาท");
    }

    // ดำเนินการเติมเงิน
    const response = await depositMoneyCredit(userCode, amount, event);
    const userData = await checkUserDataByID(userCode);

    const payload = {
      user: userCode,
      type: "DEPOSIT",
      typeCredit: "CREDIT",
      status: "SUCCESS",
      amount: amount,
      createBy: event.source.userId,
      groupId: userData.groupId,
    };

    if (response && response.type === "text") {
      const transaction_money = await transationMoney(payload);
      console.log(transaction_money)

      return client.replyMessage(event.replyToken, response);
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
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);
    if (!permissionResult.success) {
      return null;
    }

    // ตรวจสอบและดึงข้อมูลจากข้อความ
    const match = userMessage.match(/^(\d+)=\+([\d]+)$/);
    if (!match) {
      return sendErrorMessage(
        event,
        "รูปแบบคำสั่งไม่ถูกต้อง\nตัวอย่าง: รหัสผู้ใช้=+1000"
      );
    }

    const userCode = match[1];
    const amount = parseInt(match[2], 10);

    // ตรวจสอบว่าจำนวนเงินต้องเป็นค่าบวก
    if (amount <= 0) {
      return sendErrorMessage(event, "จำนวนเงินต้องมากกว่า 0 บาท");
    }

    const response = await depositMoneyCash(userCode, amount, event);
    const userData = await checkUserDataByID(userCode);

    const payload = {
      user: userCode,
      type: "DEPOSIT",
      typeCredit: "CASH",
      status: "SUCCESS",
      amount: amount,
      createBy: event.source.userId,
      groupId: userData.groupId,
    };


    if (response && response.type === "text") {

      const transaction_money = await transationMoney(payload);
      console.log(transaction_money)

      return client.replyMessage(event.replyToken, response);
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
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);
    if (!permissionResult.success) {
      return null;
    }

    // ตรวจสอบและดึงข้อมูลจากข้อความ
    const match = userMessage.match(/^(\d+)=\-([\d]+)$/);
    if (!match) {
      return sendErrorMessage(
        event,
        "รูปแบบคำสั่งไม่ถูกต้อง\nตัวอย่าง: รหัสผู้ใช้=-1000"
      );
    }

    const userCode = match[1]; // รหัสผู้ใช้
    const amount = parseInt(match[2], 10); // จำนวนเงิน

    // ตรวจสอบว่าจำนวนเงินต้องเป็นค่าบวก
    if (amount <= 0) {
      return sendErrorMessage(event, "จำนวนเงินต้องมากกว่า 0 บาท");
    }

    const response = await withdrawMoney(userCode, amount, event);
    const userData = await checkUserDataByID(userCode);

    const payload = {
      user: userCode,
      type: "WITHDRAW",
      typeCredit: "CASH",
      status: "SUCCESS",
      amount: amount,
      createBy: event.source.userId,
      groupId: userData.groupId,
    };


    if (response && response.type === "text") {

      const transaction_money = await transationMoney(payload);
      console.log(transaction_money)

      return client.replyMessage(event.replyToken, response); // ส่งข้อความที่ได้จาก withdrawMoney
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

// Handle เปิดปิดไฮโล command (เปิด/ปิด)
async function handleSetHiloCommand(event, status) {
  try {
    const permissionResult = await checkUserRole(event, ["Superadmin"]);
    if (!permissionResult.success) {
      return null;
    }

    const confirmationMessage = await setHilo(event, status);
    // return { type: "text", text: confirmationMessage };
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: confirmationMessage,
    });
  } catch (error) {
    console.error("Error setting Hilo:", error);
    return sendErrorMessage(
      event,
      `เกิดข้อผิดพลาดในการ${status}ไฮโล กรุณาลองใหม่`
    );
  }
}

// Handle เปิดปิดไก่ชน command (เปิด/ปิด)
async function handleSetCockCommand(event, status) {
  try {
    const permissionResult = await checkUserRole(event, ["Superadmin"]);
    if (!permissionResult.success) {
      return null;
    }

    const confirmationMessage = await setCock(event, status);
    // return { type: "text", text: confirmationMessage };
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: confirmationMessage,
    });
  } catch (error) {
    console.error("Error setting Cock:", error);
    return sendErrorMessage(
      event,
      `เกิดข้อผิดพลาดในการ${status}ไก่ชน กรุณาลองใหม่`
    );
  }
}

// Handle แจ้งเลขธนาคาร details
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

// Handle เช็คยอดเงินคงเหลือ
async function handleUserCheckMoney(event) {
  const userId = event.source.userId;
  const groupId = event.source.groupId;
  try {
    const member = await client.getGroupMemberProfile(groupId, userId);
    if (!member) {
      return sendErrorMessage(event, "ไม่สามารถดึงข้อมูลสมาชิกได้");
    }

    // ตรวจสอบว่า userId นี้มีอยู่ในฐานข้อมูลหรือไม่
    const isUserExist = await checkIfUserExists(userId);
    if (!isUserExist) {
      console.log(`User ${userId} does not exist, adding user to database...`);
      await AddMember(member, userId, groupId);
    }

    // ดึงข้อมูลยอดเงินของผู้ใช้
    const userDetailsMessage = await getUserMoney(event, userId, member);
    return client.replyMessage(event.replyToken, [userDetailsMessage]);
  } catch (error) {
    console.error("Error in handleUserCheckMoney:", error);
    return sendErrorMessage(event, "กรุณากด c ใหม่อีกครั้ง");
  }
}

// Handle เปิดรอบเล่นประจำวัน
async function handleOpenIndayCommand(event) {
  try {
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);
    const playInday = await checkOpenPlayInday(event);
    if (!permissionResult.success) {
      console.log("ไม่มีสิทธิ์ใช้คำสั่งนี้");
      return null;
    }

    let openIndayMessage;

    if (!playInday) {
      // ถ้าเปิดบ้านไก่ชนไม่อยู่ จะเปิดบ้าน
      openIndayMessage = await setPlayInday(event, true);
    } else {
      // ถ้าบ้านไก่ชนเปิดอยู่แล้ว
      openIndayMessage = "เปิดบ้านไก่ชนอยู่แล้ว!!!";
    }

    // ส่งข้อความยืนยันการเปิดบ้าน
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: openIndayMessage,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);

    // ส่งข้อความแสดงข้อผิดพลาดที่เกิดขึ้น
    return sendErrorMessage(
      event,
      "เกิดข้อผิดพลาดในการเปิดบ้านไก่ชน กรุณาลองใหม่"
    );
  }
}

// Handle ปิดรอบเล่นประจำวัน
async function handleCloseIndayCommand(event) {
  try {
    const playInday = await checkOpenPlayInday(event);
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);
    if (!permissionResult.success) {
      return null;
    }

    let closeIndayMessage;

    if (!playInday) {
      closeIndayMessage = "ปิดบ้านไก่ชนอยู่แล้ว!!!";
    } else {
      closeIndayMessage = await setPlayInday(event, false);
      await resetMainRound(event);
    }

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: closeIndayMessage,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return sendErrorMessage(
      event,
      "เกิดข้อผิดพลาดในการปิดบ้านไก่ชน กรุณาลองใหม่"
    );
  }
}

// Handle เปิดรอบเล่นหลัก
async function handleOpenMainPlayCommand(event) {
  try {
    const playInday = await checkOpenPlayInday(event);
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);
    if (!permissionResult.success) {
      return null;
    }

    let openMainMessage;
    if (playInday) {
      await setNumberMainRound(event);
      openMainMessage = await setMainPlay(event, "open");
    } else {
      openMainMessage = "ยังไม่ได้เปิดบ้านไก่ชน!!!";
    }
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: openMainMessage,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return sendErrorMessage(event, "เกิดข้อผิดพลาดในการเปิดรอบ กรุณาลองใหม่");
  }
}

// Handle ปิดรอบเล่นหลัก
async function handleCloseMainPlayCommand(event) {
  try {
    // ตรวจสอบสิทธิ์ผู้ใช้
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);
    if (!permissionResult.success) {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "คุณไม่มีสิทธิ์ในการปิดรอบ",
      });
    }

    // ตรวจสอบว่ามีรอบที่เปิดอยู่หรือไม่
    const playInday = await checkOpenPlayInday(event);
    if (!playInday) {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "ไม่พบรอบที่เปิดอยู่",
      });
    }

    // ตรวจสอบสถานะรอบเล่นย่อย
    const isSubRoundOpen = await checkPreviousSubRoundStatus();
    if (isSubRoundOpen) {
      console.log("ยังไม่ได้ปิดราคา");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "ยังไม่ได้ปิดราคา กรุณาปิดราคาก่อน!",
      });
    }

    // ดำเนินการปิดรอบและสร้างข้อความสรุป
    const closeMainMessage = await updateMainPlay(event, "close");


    if (closeMainMessage) {
      const summary = await fetchPlaySummary(event);
      const usersToUpdate = summary.map((item) => item.user);
      const uniqueUsersToUpdate = [...new Set(usersToUpdate)];

      // ใช้ Promise.all เพื่ออัพเดทหลายๆ ผู้ใช้พร้อมกัน
      const userUpdatePromises = uniqueUsersToUpdate.map((userId) =>
        axios.patch(`${process.env.API_URL}/user/${userId}/remainingFund`)
          .then(response => {
            if (response && response.data) {
              console.log("response.data :", response.data);
            } else {
              console.error(`Failed to fetch data for user: ${userId}`);
            }
          })
          .catch(error => {
            console.error(`Error updating fund for user ${userId}:`, error);
          })
      );

      await Promise.all(userUpdatePromises);
      await resetSubRound(event);
      // ส่งข้อความสรุปให้ผู้ใช้
      await client.replyMessage(event.replyToken, closeMainMessage);
    } else {
      // ถ้าไม่มีข้อความใด ๆ
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "ไม่สามารถสร้างข้อความสรุปได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  } catch (error) {
    console.error("Error in handleCloseMainPlayCommand:", error);
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ไม่พบรอบที่เปิดอยู่!!!",
    });
  }
}


// Handle ตั้งราคา
async function handleSetOdds(event, { type, odds, maxAmount }) {
  try {
    // ตรวจสอบสิทธิ์ผู้ใช้งาน
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);
    const isSubRoundOpen = await checkPreviousSubRoundStatus();

    if (!permissionResult.success) {
      //console.log("ไม่มีสิทธิ์ใช้คำสั่งนี้");
      const replyMessage = {
        type: "text",
        text: "คุณไม่มีสิทธิ์ใช้คำสั่งนี้!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    // ตรวจสอบสถานะรอบเล่น
    const isOpenMainStatus = await checkPreviousRoundStatus();
    if (!isOpenMainStatus) {
      const replyMessage = {
        type: "text",
        text: "ยังไม่เปิดรอบเล่น!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    if (isSubRoundOpen) {
      const replyMessage = {
        type: "text",
        text: "ราคาเล่นเปิดอยู่ กรุณาปิดก่อนตั้งราคาใหม่!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    let oddsValue;
    if (odds) {
      oddsValue = parseFloat(odds.match(/[\d.]+/g)?.[0]);
    }

    let oddsText;

    // กำหนดข้อความอัตราต่อรองแบบคงที่
    const fixedOddsText = {
      ตร:  {
        x: `ต่อ แดง แทง 10 ได้ 9`,
        y: `ต่อ น้ำเงิน แทง 10 ได้ 9`,
      },
      สง:  {
        x: `ต่อ น้ำเงิน แทง 10 ได้ 8`,
        y: `รอง แดง แทง 10 ได้ 10`,
      },
      สด:  {
        x: `ต่อ แดง แทง 10 ได้ 8`,
        y: `รอง น้ำเงิน แทง 10 ได้ 10`,
      },
    };

    // ตรวจสอบและคำนวณข้อความ oddsText
    if (fixedOddsText[type]) {
      oddsText = fixedOddsText[type];
    } else if ((type === "ด" || type === "ง") && !isNaN(oddsValue)) {
      oddsText = calculateOdds(type, oddsValue);
    } else {
      oddsText = "\n• ไม่สามารถคำนวณอัตราได้ เนื่องจากข้อมูลไม่ถูกต้อง";
    }

    // กำหนดข้อความ oddsToSend
    let oddsToSend = type;
    if (type !== "ตร" && type !== "สง" && type !== "สด" && !isNaN(oddsValue)) {
      oddsToSend = type + oddsValue;
    }

    let colors = {
      สด: { coler1: "#E83A30", coler2: "#0066CC" },
      สง: { coler1: "#0066CC", coler2: "#E83A30" },
      ด: { coler1: "#E83A30", coler2: "#0066CC" },
      ง: { coler1: "#0066CC", coler2: "#E83A30" },
      ตร: { coler1: "#E83A30", coler2: "#0066CC" },
    };
    
    let selectedColors;
    
    // เลือกสีตามประเภท type
    if (colors[type]) {
      selectedColors = colors[type];
    } else {
      selectedColors = { coler1: "#E83A30", coler2: "#0066CC" };
    }


    // ตั้งค่ารอบย่อย
    await setNumberSubRound(event);

    // เรียกใช้ setOpenOdds และตรวจสอบผลลัพธ์
    const addOdds = await setOpenOdds(event, oddsToSend, maxAmount);

    if (addOdds) {

      const img = `${process.env.IMGE_URL}/Img/end_round.jpg`;

      const flexMessage = {
        type: "flex",
        altText: "เปิดราคา",
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "image",
                url: `${img}`,
                size: "full",
                aspectRatio: "3:2",
                aspectMode: "cover"
              },
              {
                type: "box",
                layout: "vertical",
                margin: "lg",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: `${oddsText.x}`,
                    size: "xl",
                    color: `${selectedColors.coler1}`,
                    weight: "bold",
                    align: "center",
                    wrap: true
                  },
                  {
                    type: "text",
                    text: `${oddsText.y}`,
                    size: "xl",
                    color: `${selectedColors.coler2}`,
                    weight: "bold",
                    align: "center",
                    wrap: true
                  }
                ]
              }
            ],
            paddingAll: "lg"
          }
        }
      };
      // ส่งข้อความ
      await client.replyMessage(event.replyToken, flexMessage);
    } else {
      // หากตั้งราคาไม่ได้
      console.log("ไม่สามารถตั้งราคาได้");
      const replyMessage = {
        type: "text",
        text: "ไม่สามารถตั้งราคาได้!!!",
      };
      await client.replyMessage(event.replyToken, replyMessage);
    }
  } catch (error) {
    // จัดการข้อผิดพลาด
    console.error("เกิดข้อผิดพลาดใน handleSetOdds:", error);

    const replyMessage = {
      type: "text",
      text: "เกิดข้อผิดพลาดในการตั้งค่าอัตรา!!! กรุณาลองใหม่อีกครั้ง.",
    };

    await client.replyMessage(event.replyToken, replyMessage);
  }
}

// Handle ปิดราคา
async function handleCloseSetOdds(event) {
  try {
    // ตรวจสอบสิทธิ์ผู้ใช้งาน
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);

    if (!permissionResult.success) {
      console.log("ไม่มีสิทธิ์ใช้คำสั่งนี้");
      const replyMessage = {
        type: "text",
        text: "คุณไม่มีสิทธิ์ใช้คำสั่งนี้!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    //ตรวจสอบสถานะรอบเล่นหลัก
    const isOpenMainStatus = await checkPreviousRoundStatus();
    if (!isOpenMainStatus) {
      const replyMessage = {
        type: "text",
        text: "ยังไม่เปิดรอบเล่น!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    //ตรวจสอบสถานะรอบเล่นย่อย
    const isSubRoundOpen = await checkPreviousSubRoundStatus();
    if (!isSubRoundOpen) {
      console.log("ยังไม่ได้ตั้ง!");
      const replyMessage = {
        type: "text",
        text: "ราคาเล่นปิดอยู่ กรุณาตั้งราคาก่อน!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    // เรียกฟังก์ชันปิดรอบ
    const response = await setCloseOdds(event);

    const img = `${process.env.IMGE_URL}/Img/end_round.jpg`;
    // ตรวจสอบผลลัพธ์จากการปิดรอบ
    const replyMessage = [
      {
        type: "text",
        text: response || "ไม่สามารถปิดรอบได้! กรุณาลองใหม่.",
      },
      {
        type: "image",
        originalContentUrl: img,
        previewImageUrl: img,
      },
    ];

    return await client.replyMessage(event.replyToken, replyMessage);
  } catch (error) {
    console.error("Error in handleCloseSetOdds:", error);
    return sendErrorMessage(event, "เกิดข้อผิดพลาดในการปิดรอบ กรุณาลองใหม่");
  }
}

// Handle เล่นเดิมพัน
async function handleUserBet(event, { type, amount }) {
  try {
    const userId = event.source.userId;
    const isOpenMainStatus = await checkPreviousRoundStatus();
    if (!isOpenMainStatus) {
      return { type: "text", text: "ยังไม่เปิดรอบเล่น!!!" };
    }

    const isSubRoundOpen = await checkPreviousSubRoundStatus();
    if (!isSubRoundOpen) {
      return { type: "text", text: "❌❌ ยังไม่ได้ตั้งราคา !! ❌❌" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { type: "text", text: "กรุณาระบุจำนวนเงินเดิมพันให้ถูกต้อง!!!" };
    }

    const userData = await checkUserData(userId);
    let funds = userData?.fund || 0;

    const checkBalance = await checkUserPlayBalance(event);
    if (checkBalance && typeof checkBalance.balance === "number") {
      funds = checkBalance.balance;
    }

    const formattedFund = funds.toLocaleString("en-US");

    if (amount > funds) {
      return {
        type: "text",
        text: `เดิมพันผิดพลาด \n ยอดเงินคงเหลือ ${formattedFund} บาท`,
      };
    }

    const subround_data = await checkSubRoundData(event);
    const max_amounts = subround_data?.max_amount || 0;
    const formattedMax = max_amounts.toLocaleString("en-US");

    if (amount > max_amounts) {
      return {
        type: "text",
        text: `ยอดเดิมพันสูงเกินไป!! \n เล่นได้ไม่เกิน ${formattedMax} บาท`,
      };
    }

    const round_id = subround_data?.round?.id;
    const subround_id = subround_data?.id;
    const profile = await client.getProfile(userId);
    const userName = profile?.displayName || "ไม่ทราบชื่อ";

    const bet_type = type === "ด" ? "RED" : "BLUE";
    const backgroundColor = type === "ด" ? "#ffcdd2" : "#bbdefb";
    const endColor = type === "ด" ? "#ef5350" : "#42a5f5";

    const totalBalance = funds - amount;

    const betData = {
      user: userId,
      round: round_id,
      subRound: subround_id,
      group: event.source.groupId,
      betType: bet_type,
      betAmount: amount,
      balance: totalBalance,
    };

    const betResult = await setPlayBet(event, betData);

    if (betResult) {
      return {
        type: "flex",
        altText: `เดิมพัน${type} ${amount}บาท`,
        contents: {
          type: "bubble",
          size: "kilo",
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
                    url:
                      profile?.pictureUrl || "https://via.placeholder.com/100",
                    size: "xs",
                    aspectMode: "cover",
                    aspectRatio: "1:1",
                    margin: "sm",
                    flex: 1,
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: `รหัส ${userData?.id || "N/A"} ${userName}`,
                        size: "sm",
                        weight: "regular",
                      },
                      {
                        type: "text",
                        text: `ยก ${subround_data?.numberRound || "-"
                          } ✅ ${type}=${amount.toLocaleString()} #ตง10/9`,
                        size: "xs",
                        color: "#000000",
                      },
                    ],
                    flex: 3,
                    spacing: "xs",
                    paddingStart: "md",
                  },
                ],
                spacing: "md",
              },
            ],
            paddingAll: "sm",
            background: {
              type: "linearGradient",
              angle: "45deg",
              startColor: backgroundColor,
              endColor: endColor,
              centerColor: backgroundColor,
            },
          },
          styles: {
            body: {
              backgroundColor: backgroundColor,
            },
          },
        },
      };
    } else {
      return { type: "text", text: "เดิมพันผิดพลาด!!!" };
    }
  } catch (error) {
    console.error("Error in handleUserBet:", error);
    return { type: "text", text: "กรุณาลองใหม่อีกครั้ง." };
  }
}

// Handle สรุปผลการแข่งขัน
async function handleConfirmResultCommand(event, result) {
  try {
    // ตรวจสอบสิทธิ์ผู้ใช้งาน
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);

    const playInday = await checkOpenPlayInday(event);
    if (!playInday) {
      return null;
    }

    if (!permissionResult.success) {
      console.log("ไม่มีสิทธิ์ใช้คำสั่งนี้");
      const replyMessage = {
        type: "text",
        text: "คุณไม่มีสิทธิ์ใช้คำสั่งนี้!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    // ตรวจสอบสถานะรอบเล่นหลัก
    const isOpenMainStatus = await checkPreviousRoundStatus();
    if (isOpenMainStatus) {
      const replyMessage = {
        type: "text",
        text: "ยังไม่ปิดรอบเล่น!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    // กำหนดผลลัพธ์และไฟล์ภาพ
    let resultText;
    let resultS;
    switch (result) {
      case "ด":
        resultText = "red_win.jpg";
        resultS = "แดงชนะ";
        break;
      case "ง":
        resultText = "blue_win.jpg";
        resultS = "น้ำเงินชนะ";
        break;
      case "ส":
        resultText = "draw.jpg";
        resultS = "เสมอ";
        break;
      default:
        throw new Error("Invalid result value");
    }

    // ประกอบ URL ของภาพ
    const img = `${process.env.IMGE_URL}/Img/${resultText}`;

    // ส่งข้อความสรุปผล
    const replyMessageText = {
      type: "text",
      text: `สรุป ${resultS} \nยืนยันผลสรุป Y`,
    };

    // ส่งภาพผลลัพธ์
    const replyMessageImage = {
      type: "image",
      originalContentUrl: img,
      previewImageUrl: img,
    };

    // ส่งทั้งข้อความและภาพ
    await client.replyMessage(event.replyToken, [replyMessageText, replyMessageImage]);
  } catch (error) {
    console.error("Error in handleConfirmResultCommand:", error);
    return sendErrorMessage(event, "เกิดข้อผิดพลาด กรุณาลองใหม่");
  }
}

// Handle ย้อนผลสรุปผลการแข่งขัน
async function handleReturnConfirmResultCommand(event, roundNumber) {
  try {
    // ตรวจสอบสิทธิ์ผู้ใช้งาน
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);

    if (!permissionResult.success) {
      console.log("ไม่มีสิทธิ์ใช้คำสั่งนี้");
      return null;
    }

    const playInday = await checkOpenPlayInday(event);
    if (!playInday) {
      return null;
    }

    // ตรวจสอบสถานะรอบเล่นหลัก
    const isOpenMainStatus = await checkPreviousRoundStatus();
    if (isOpenMainStatus) {
      const replyMessage = {
        type: "text",
        text: "ยังไม่ปิดรอบเล่น!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    // ส่งข้อความสรุปผล
    const replyMessageText = {
      type: "text",
      text: `ต้องการย้อนผลการแข่ง รอบที่#${roundNumber} ใช่หรือไม่ \n กด Y เพื่อยืนยัน`,
    };

    // ส่งทั้งข้อความและภาพ
    await client.replyMessage(event.replyToken, replyMessageText);
  } catch (error) {
    console.error("Error in handleConfirmResultCommand:", error);
    return sendErrorMessage(event, "เกิดข้อผิดพลาด กรุณาลองใหม่");
  }
}

// Handle แจ้งให้ยืนยันผลใหม่
async function handleReturnResultConfirmation(event) {
  try {
    // ตรวจสอบสิทธิ์ผู้ใช้งาน
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);

    if (!permissionResult.success) {
      console.log("ไม่มีสิทธิ์ใช้คำสั่งนี้");
      return null;
    }

    const playInday = await checkOpenPlayInday(event);
    if (!playInday) {
      return null;
    }

    // ตรวจสอบสถานะรอบเล่นหลัก
    const isOpenMainStatus = await checkPreviousRoundStatus();
    if (isOpenMainStatus) {
      const replyMessage = {
        type: "text",
        text: "ยังไม่ปิดรอบเล่น!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    // ส่งข้อความสรุปผล
    const replyMessageText = {
      type: "text",
      text: `กรุณาระบุผล เช่น sด, sง`,
    };

    // ส่งทั้งข้อความและภาพ
    await client.replyMessage(event.replyToken, replyMessageText);
  } catch (error) {
    console.error("Error in handleConfirmResultCommand:", error);
    return sendErrorMessage(event, "เกิดข้อผิดพลาด กรุณาลองใหม่");
  }
}


// Handle ยืนยันผลการแข่งขัน
async function handleResultConfirmation(event, result, resultStatus) {
  try {

    console.log("resultStatus : ", resultStatus)
    // ตรวจสอบสิทธิ์ผู้ใช้งาน
    const permissionResult = await checkUserRole(event, [
      "Superadmin",
      "Admin",
    ]);

    const playInday = await checkOpenPlayInday(event);
    if (!playInday) {
      return null;
    }

    if (!permissionResult.success) {
      return null;
    }

    const isOpenMainStatus = await checkPreviousRoundStatus();
    if (isOpenMainStatus) {
      const replyMessage = {
        type: "text",
        text: "ยังไม่ปิดรอบเล่น!!!",
      };
      return await client.replyMessage(event.replyToken, replyMessage);
    }

    //update result round
    await setResultMainPlay(event, result);
    const summary = await fetchPlaySummary(event);
    const results = await updateRemainingFund(summary, resultStatus);

    return await client.replyMessage(event.replyToken, results);

  } catch (error) {
    console.error("Error in handleConfirmResultCommand:", error);
    return sendErrorMessage(event, "เกิดข้อผิดพลาด กรุณาลองใหม่");
  }
}


// ฟังก์ชันสำหรับคำนวณราคาฝั่งต่อและรอง (รีเทิร์น Object)
function calculateOdds(type, oddsValue) {
  // แผนที่อัตราต่อรอง
  const oddsMap = {
    8.5: { ต่อ: 7.5, รอง: 9.5 },
    8: { ต่อ: 7, รอง: 9 },
    7.5: { ต่อ: 6.5, รอง: 8.5 },
    7: { ต่อ: 6, รอง: 8 },
    6.5: { ต่อ: 5.5, รอง: 7.5 },
    6: { ต่อ: 5, รอง: 7 },
    5.5: { ต่อ: 4.5, รอง: 6.5 },
    5: { ต่อ: 4, รอง: 6 },
    4.5: { ต่อ: 3.5, รอง: 5.5 },
    4: { ต่อ: 3, รอง: 5 },
    3.5: { ต่อ: 2.5, รอง: 4.5 },
    3: { ต่อ: 2, รอง: 4 },
    2.5: { ต่อ: 1.5, รอง: 3.5 },
    2: { ต่อ: 1, รอง: 3 },
    1: { ต่อ: 150 / 10, รอง: 1000 / 100 }, // ข้อยกเว้น
    100: { ต่อ: 1 / 100, รอง: 2000 / 100 }, // ข้อยกเว้น
  };

  // ตรวจสอบว่า oddsValue มีใน oddsMap หรือไม่
  const odds = oddsMap[oddsValue];
  if (!odds) return { error: "ข้อมูลไม่ถูกต้อง" }; // คืนค่าหากข้อมูลไม่ถูกต้อง

  // กำหนดฝั่งและข้อความ
  const side = type === "ด" ? "แดง" : "น้ำเงิน";

  // สำหรับกรณีที่เป็นข้อยกเว้น 1 และ 100
  if (oddsValue === 1) {
    return {
      x: `ต่อ ${side} แทง 150 ได้ 10`,
      y: `รอง ${side === "แดง" ? "น้ำเงิน" : "แดง"} แทง 10 ได้ 100`,
    };
  }
  if (oddsValue === 100) {
    return {
      x: `ต่อ ${side} แทง 100 ได้ 1`,
      y: `รอง ${side === "แดง" ? "น้ำเงิน" : "แดง"} แทง 10 ได้ 200`,
    };
  }

  // สำหรับกรณีปกติ
  return {
    x: `ต่อ ${side} แทง 10 ได้ ${odds.ต่อ}`,
    y: `รอง ${side === "แดง" ? "น้ำเงิน" : "แดง"} แทง ${odds.รอง} ได้ 10`,
  };
}


function sendErrorMessage(event, message) {
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: message,
  });
}

module.exports = {
  sendErrorMessage,
  handleUserCheckMoney,
  handleSetCockCommand,
  handleBankAccountDetails,
  handleSetHiloCommand,
  handleWithdrawMoney,
  handleCashCustomer,
  handleTopUpCredit,
  handleUpdateAdminRole,
  handleAddAllMembers,
  handleSetGroupCommand,
  handleSetSubGroupCommand,
  handleOpenIndayCommand,
  handleCloseIndayCommand,
  handleOpenMainPlayCommand,
  handleCloseMainPlayCommand,
  handleSetOdds,
  handleCloseSetOdds,
  handleUserBet,
  handleConfirmResultCommand,
  handleResultConfirmation,
  handleReturnConfirmResultCommand,
  handleReturnResultConfirmation,
};
