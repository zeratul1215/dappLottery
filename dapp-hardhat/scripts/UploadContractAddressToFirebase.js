import { getDatabase, ref, set, get } from "firebase/database";
import { initializeApp } from "firebase/app";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
    databaseURL: process.env.FIREBASE_DATABASE_URL,
}

// console.log(firebaseConfig);
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log("Firebase 数据库连接成功");

async function uploadData() {
    try {
        console.log("开始上传数据...");
        
        await set(ref(db, 'contracts/lottery/300'), {
            address: '0xcf638e23f8eE04C1630ED05c6D0B24CCBDe328F1'
        });
        
        console.log("✅ 数据上传成功！");
        
    } catch (error) {
        console.error("❌ 数据上传失败:", error);
        process.exit(1);
    }
}

async function getData() {
    try {
        const snapshot = await get(ref(db, "contracts/lottery"));
        
        console.log(snapshot.val());
    } catch (error) {
        console.error("❌ 数据获取失败:", error);
        process.exit(1);
    }
}

// 执行上传
// uploadData().then(() => {
//     console.log("脚本执行完成");
//     process.exit(0);
// }).catch((error) => {
//     console.error("脚本执行失败:", error);
//     process.exit(1);
// });

getData().then(() => {
    console.log("脚本执行完成");
    process.exit(0);
}).catch((error) => {
    console.error("脚本执行失败:", error);
    process.exit(1);
});
