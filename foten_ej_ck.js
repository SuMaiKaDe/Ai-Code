/**
 * 福田E家并发优化版 By羽化 (CK版本)
 * 
 * 1. 默认50并发，可自定义并发数
 * 2. 各任务间隔延时执行，默认45-90s
 * 3. 优化运行逻辑，避免因某个号报错停止脚本
 * 4. 支持多变量，可处理各种Cookie格式
 * 5. 优化皮卡生活签到任务逻辑，避免每天触发异地登录短信提示
 * 6. 积分转盘抽奖默认关闭，赌狗可开启，运气爆棚单车变摩托
 * 
 * 使用说明：
 * cron: 30 12 * * * (建议根据实际情况调整)
 * 变量：export FTEJ_CK="CK1&CK2" (每个CK包含SESSION、HWWAFSESTIME、HWWAFSESID、FOTONTGT等)
 * CK格式：SESSION=xxx; HWWAFSESTIME=xxx; HWWAFSESID=xxx; FOTONTGT=xxx
 * 
 * 原作者：@xzxxn777
 * 频道：https://t.me/xzxxn777
 * 群组：https://t.me/xzxxn7777
 */

const crypto = require("crypto"); 
const $ = new Env('福田e家');
const FTEJ_CK = ($.isNode() ? process.env.FTEJ_CK : $.getdata("FTEJ_CK")) || '';
const FTEJ_PK = ($.isNode() ? process.env.FTEJ_PK : $.getdata("FTEJ_PK")) || '1'; //皮卡生活签到 开启=1，关闭=0
const FTEJ_Lottery = ($.isNode() ? process.env.FTEJ_Lottery : $.getdata("FTEJ_Lottery")) || '0'; //积分转盘抽奖 开启=1，关闭=0
const FTEJ_SpringSign = ($.isNode() ? process.env.FTEJ_SpringSign : $.getdata("FTEJ_SpringSign")) || '0'; //春日活动已结束
const FTEJ_DEL_POSTS = ($.isNode() ? process.env.FTEJ_DEL_POSTS : $.getdata("FTEJ_DEL_POSTS")) || '1'; // 自动删帖 开启=1，关闭=0
const FTEJ_TASK_SIGNIN = ($.isNode() ? process.env.FTEJ_TASK_SIGNIN : $.getdata("FTEJ_TASK_SIGNIN")) || '1'; // 福田e家签到 开启=1，关闭=0
const FTEJ_TASK_SHARE = ($.isNode() ? process.env.FTEJ_TASK_SHARE : $.getdata("FTEJ_TASK_SHARE")) || '1';    // 保客分享 开启=1，关闭=0
const FTEJ_TASK_FOLLOW = ($.isNode() ? process.env.FTEJ_TASK_FOLLOW : $.getdata("FTEJ_TASK_FOLLOW")) || '1';    // 关注/取关 开启=1，关闭=0
const FTEJ_TASK_POST = ($.isNode() ? process.env.FTEJ_TASK_POST : $.getdata("FTEJ_TASK_POST")) || '1';      // 发帖 开启=1，关闭=0

let notice = '';
let PKSafeKey = null; 
let EJSafeKey = null; 

function a7(ad) {
    const ae = Buffer.from("Zm9udG9uZS10cmFuc0BseDEwMCQjMzY1", "base64");
    const af = Buffer.from("MjAxNjEyMDE=", "base64");
    const ag = crypto.createDecipheriv("des-ede3-cbc", ae, af);
    ag.setAutoPadding(!0); 
    const ah = Buffer.from(ad, "base64");
    let ai = ag.update(ah, undefined, "utf8");
    ai += ag.final("utf8");
    return ai;
}

function a8(ad) {
    const ae = Buffer.from("Zm9udG9uZS10cmFuc0BseDEwMCQjMzY1", "base64");
    const af = Buffer.from("MjAxNjEyMDE=", "base64");
    const ag = crypto.createCipheriv("des-ede3-cbc", ae, af);
    ag.setAutoPadding(!0);
    let ah = ag.update(ad, "utf8", "base64");
    ah += ag.final("base64");
    return ah;
}

async function getPKSafeKey() {
    const body = { deviceType: 1 };
    const response = await pkLoginPost("/ehomes-new/pkHome/version/getVersion", body);
    if (response.code === 200 && response.data && response.data.safeKey) {
        PKSafeKey = response.data.safeKey;
    } else {
        PKSafeKey = Date.now() % 1000000; 
    }
    return PKSafeKey;
}

async function estVersionRequest(url, bodyString) {
    return new Promise(resolve => {
        const options = {
            url: `https://czyl.foton.com.cn${url}`,
            headers: {
                'encrypt': 'yes',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'Keep-Alive',
                'User-Agent': 'okhttp/3.14.9', 
                'Accept-Encoding': 'gzip'
            },
            body: bodyString 
        };
        $.post(options, async (err, resp, data) => {
            if (err) {
                return resolve({ code: -1, success: false, msg: '网络错误', originalData: null });
            } else {
                resolve({ code: resp.statusCode, success: true, originalData: data, headers: resp.headers });
            }
        });
    });
}

async function getEJSafeKey() {
    const payload = { 
        limit: { auth: "null", uid: "", userType: "61" },
        param: { deviceType: "1", version: "7.5.1", versionCode: "345" }
    };
    const encryptedPayloadString = a8(JSON.stringify(payload));
    const responseWrapper = await estVersionRequest('/est/getVersion.action', `jsonParame=${encodeURIComponent(encryptedPayloadString)}`);

    if (responseWrapper.success && responseWrapper.originalData && responseWrapper.code === 200) {
        try {
            const decryptedLevel1String = a7(responseWrapper.originalData);
            const decryptedLevel1Object = JSON.parse(decryptedLevel1String);

            if (decryptedLevel1Object.code === 0 && decryptedLevel1Object.data) {
                const finalDataObject = JSON.parse(decryptedLevel1Object.data);
                if (finalDataObject.safeKey) {
                    EJSafeKey = finalDataObject.safeKey;
                } else {
                    EJSafeKey = Date.now() % 1000000; 
                }
            } else {
                 EJSafeKey = Date.now() % 1000000;
            }
        } catch (e) {
            EJSafeKey = Date.now() % 1000000; 
        }
    } else {
        EJSafeKey = Date.now() % 1000000; 
    }
    return EJSafeKey;
}

// 解析Cookie字符串
function parseCookies(cookieString) {
    const cookies = {};
    if (!cookieString) return cookies;
    
    cookieString.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        if (name && rest.length > 0) {
            cookies[name.trim()] = rest.join('=').trim();
        }
    });
    return cookies;
}

// 从Cookie中提取所需信息
function extractCookieInfo(cookies) {
    return {
        session: cookies['SESSION'] || '',
        hwwafsesid: cookies['HWWAFSESID'] || '',
        hwwafsestime: cookies['HWWAFSESTIME'] || '',
        fotontgt: cookies['FOTONTGT'] || '',
        fotontgt_gt: cookies['FOTONTGT_GT'] || cookies['FOTONTGT'] || ''
    };
}

async function main() {
    if (!FTEJ_CK) {
        console.log("未配置Cookie信息，请添加环境变量");
        return;
    }

    await getPKSafeKey();
    await getEJSafeKey();

    const cks = FTEJ_CK.split("&");
    const concurrencyLimit = 50; // 并发数
    let results = [];

    for (let i = 0; i < cks.length; i += concurrencyLimit) {
        const batch = cks.slice(i, i + concurrencyLimit);
        console.log(`\n\n开始处理第 ${i / concurrencyLimit + 1} 批CK`);
        const batchResults = await Promise.all(
            batch.map((ck, index) => processCKAccount(ck, index + 1 + i))
        );
        results.push(...batchResults);
        console.log('————————————');
    }

    const finalNotice = results.join('');
    if (finalNotice) {
        console.log(finalNotice);
        await sendMsg(finalNotice);
    }
}

!(async () => {
    await main();
})()
.catch((e) => $.logErr(e))
.finally(() => $.done());

const randomDelay = (min, max) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay * 1000));
};

async function retryTask(taskFn, maxRetries = 3, initialDelay = 1000) {
    let delay = initialDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await taskFn();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            
            console.log(`✘第 ${attempt} 次尝试失败: ${error.message}${delay/1000}秒后重试`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}

// 积分转盘抽奖函数
async function lotteryDraw(cookieInfo, index) {
    try {
        const validateResponse = await request('/shareCars/validateToken.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': `https://czyl.foton.com.cn/shareCars/activity/luckDraw/index.html?channel=app`,
                'Cookie': `FOTONTGT=${cookieInfo.fotontgt}`
            },
            body: `ticketName=FOTONTGT&ticketValue=${cookieInfo.fotontgt.trim()}`
        });

        if (!validateResponse.headers || !validateResponse.headers['set-cookie']) {
            throw new Error(`[${index}]获取 HWWAFSESID 失败`);
        }

        const cookies = validateResponse.headers['set-cookie'];
        const session = extractCookieValue(cookies.find(cookie => cookie.startsWith('SESSION=')));
        const hwwafsesid = extractCookieValue(cookies.find(cookie => cookie.startsWith('HWWAFSESID=')));
        const hwwafsestime = extractCookieValue(cookies.find(cookie => cookie.startsWith('HWWAFSESTIME=')));

        for (let i = 1; i <= 5; i++) {
            await randomDelay(5, 10);

            const lotteryResponse = await request('/shareCars/turnTable/turnTableLottery2nd.action', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile)',
                    'Referer': `https://czyl.foton.com.cn/shareCars/activity/luckDraw/index.html?channel=app`,
                    'Cookie': `SESSION=${session}; FOTONTGT=${cookieInfo.fotontgt}; HWWAFSESID=${hwwafsesid}; HWWAFSESTIME=${hwwafsestime}`
                },
                body: {}
            });

            const lotteryMsg = lotteryResponse.data?.msg || '未知错误';
            console.log(`[${index}]第${i}次抽奖: ${lotteryMsg}`);

            if (lotteryMsg.includes('每天最多参加5次')) {
                console.log(`[${index}]已达到每日抽奖上限`);
                break;
            }
        }
    } catch (error) {
        console.error(`[${index}]抽奖失败: ${error.message}`);
    }
}

// 【春日抽奖】
async function springDayLottery(cookieInfo, index) {
    try {
        const validateResponse = await request('/shareCars/validateToken.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': `https://czyl.foton.com.cn/shareCars/activity/interactCenter250401/index.html?channel=app`,
                'Cookie': `FOTONTGT=${cookieInfo.fotontgt}`
            },
            body: `ticketName=FOTONTGT&ticketValue=${cookieInfo.fotontgt.trim()}`
        });

        if (!validateResponse.headers || !validateResponse.headers['set-cookie']) {
            throw new Error(`[${index}]春日抽奖 => 获取 COOKIE 失败`);
        }

        const cookies = validateResponse.headers['set-cookie'];
        const session = extractCookieValue(cookies.find(cookie => cookie.startsWith('SESSION=')));
        const hwwafsesid = extractCookieValue(cookies.find(cookie => cookie.startsWith('HWWAFSESID=')));
        const hwwafsestime = extractCookieValue(cookies.find(cookie => cookie.startsWith('HWWAFSESTIME=')));

        for (let i = 1; i <= 5; i++) {
            await randomDelay(5, 10);
    
            const lotteryResponse = await request('/shareCars/c250401/luckyDraw.action', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile)',
                    'Referer': `https://czyl.foton.com.cn/shareCars/activity/interactCenter250401/index.html?channel=app`,
                    'Cookie': `SESSION=${session}; FOTONTGT=${cookieInfo.fotontgt}; HWWAFSESID=${hwwafsesid}; HWWAFSESTIME=${hwwafsestime}`
                },
                body: `activityNum=250401`
            });
    
            const lotteryMsg = lotteryResponse.data?.msg || '未知错误';
            console.log(`[${index}]春日第${i}抽: ${lotteryMsg}`);
    
            if (lotteryMsg.includes('没有抽奖次数')) {
                console.log(`[${index}]暂无抽奖次数，跳过`);
                break;
            }
        }
    } catch (error) {
        console.error(`[${index}]春日抽奖异常：${error.message}`);
    }
}

//【春日签到】
async function springDaySign(cookieInfo, index) {
    try {
        const validateResponse = await request('/shareCars/validateToken.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': `https://czyl.foton.com.cn/shareCars/activity/interactCenter250401/index.html?channel=app`,
                'Cookie': `FOTONTGT=${cookieInfo.fotontgt}`
            },
            body: `ticketName=FOTONTGT&ticketValue=${cookieInfo.fotontgt.trim()}`
        });

        if (!validateResponse.headers || !validateResponse.headers['set-cookie']) {
            throw new Error(`[${index}]春日签到 => 获取 COOKIE 失败`);
        }

        const cookies = validateResponse.headers['set-cookie'];
        const session = extractCookieValue(cookies.find(cookie => cookie.startsWith('SESSION=')));
        const hwwafsesid = extractCookieValue(cookies.find(cookie => cookie.startsWith('HWWAFSESID=')));
        const hwwafsestime = extractCookieValue(cookies.find(cookie => cookie.startsWith('HWWAFSESTIME=')));

        await randomDelay(5, 10);

        const signResponse = await request('/shareCars/c250401/sign.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile)', 
                'Cookie': `SESSION=${session}; FOTONTGT=${cookieInfo.fotontgt}; HWWAFSESID=${hwwafsesid}; HWWAFSESTIME=${hwwafsestime}`
            },
            body: ``
        });

        if (signResponse.data?.code === 0) {
            console.log(`[${index}]春日签到成功 => ${signResponse.data?.msg || ''}`);
        } else {
            console.log(`[${index}]春日签到失败 => ${signResponse.data?.msg || '未知错误'}`);
        }

    } catch (error) {
        console.error(`[${index}]春日签到异常：${error.message}`);
    }
}

// 判断日期是否为今天
function isPostFromToday(createTimeString) {
    if (!createTimeString || typeof createTimeString !== 'string') return false;
    const postDateStr = createTimeString.split(' ')[0];

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDateStr = `${year}-${month}-${day}`;

    return postDateStr === todayDateStr;
}

// 获取帖子列表
async function getMyPosts(cookieInfo, phone, index, pageNum = 1, pageSize = 10) {
    const body = {
        memberId: "",
        userId: "",
        userType: "61",
        uid: "",
        mobile: phone,
        tel: phone,
        phone: phone,
        brandName: "",
        seriesName: "",
        token: "ebf76685e48d4e14a9de6fccc76483e3",
        safeEnc: Date.now() - (EJSafeKey || 0), 
        businessId: 1,
        pageNumber: pageNum,
        pageSize: pageSize,
        type: 1
    };
    const response = await commonPost('/ehomes-new/ehomesCommunity/api/mine/myPost', body, cookieInfo);
    if (response.code === 200 && response.data && Array.isArray(response.data)) {
        return response.data;
    } else {
        return null;
    }
}

// 删除单个帖子函数
async function deleteSinglePost(post, cookieInfo, phone, index) {
    const body = {
        memberId: "", 
        userId: "",
        userType: "61",
        uid: "",
        mobile: phone,
        tel: phone,
        brandName: "",
        seriesName: "",
        token: "", 
        safeEnc: Date.now() - (EJSafeKey || 0), 
        postId: post.postId,
        businessId: 1
    };

    const response = await commonPost('/ehomes-new/ehomesCommunity/api/mine/delete', body, cookieInfo);
    await randomDelay(2, 5); 
}

// 管理旧帖子，删除非今日帖子
async function manageOldPosts(cookieInfo, phone, index) {
    let currentPage = 1;
    const pageSize = 10;
    let hasMorePosts = true;
    const allPostsToDelete = [];

    while (hasMorePosts) {
        const postsOnPage = await getMyPosts(cookieInfo, phone, index, currentPage, pageSize);
        if (postsOnPage && postsOnPage.length > 0) {
            for (const post of postsOnPage) {
                if (!post.createTime || !post.postId) {
                    continue;
                }
                if (!isPostFromToday(post.createTime)) {
                    allPostsToDelete.push(post);
                }
            }
            if (postsOnPage.length < pageSize) {
                hasMorePosts = false;
            } else {
                currentPage++;
                await randomDelay(1, 3); 
            }
        } else {
            hasMorePosts = false;
        }
    }

    if (allPostsToDelete.length === 0) {
        console.log(`[${index}]删帖结果：未找到非今日帖子`);
        return;
    }

    for (const post of allPostsToDelete) {
        await deleteSinglePost(post, cookieInfo, phone, index);
    }
    console.log(`[${index}]删帖结果：非今日帖子清理完毕`);
}

function extractCookieValue(cookie) {
    return cookie ? cookie.split(';')[0].split('=')[1] : '';
}

// 获取用户信息
async function getMemberInfo(cookieInfo, index) {
    try {
        const requestBody = {
            memberId: "",
            userId: "",
            userType: "61",
            uid: "",
            mobile: "",
            tel: "",
            phone: "",
            brandName: "",
            seriesName: "",
            token: "ebf76685e48d4e14a9de6fccc76483e3",
            safeEnc: Date.now() - (EJSafeKey || 0), 
            businessId: 1
        };

        const response = await commonPost('/ehomes-new/homeManager/api/Member/findMemberInfo2', requestBody, cookieInfo);

        if (response.code === 200 && response.data && response.data.nickName) {
            console.log(`[${index}]昵称: ${response.data.nickName}`);
            return {
                nickName: response.data.nickName,
                memberID: response.data.memberID || '',
                memberComplexCode: response.data.memberComplexCode || ''
            };
        } else {
            return {
                nickName: "",
                memberID: "",
                memberComplexCode: ""
            };
        }
    } catch (error) {
        return {
            nickName: "",
            memberID: "",
            memberComplexCode: ""
        };
    }
}

// 打开福田e家APP函数，效果未知
async function corsToActivity(cookieInfo, memberInfo, index) {
    try {
        if (!memberInfo.memberID) {
            console.log(`[${index}]缺少memberID，跳过打开APP请求`);
            return;
        }

        const requestBody = {
            memberId: memberInfo.memberID,
            userId: "",
            userType: "61",
            uid: "",
            mobile: "",
            tel: "",
            phone: "",
            brandName: "",
            seriesName: "",
            token: "ebf76685e48d4e14a9de6fccc76483e3",
            safeEnc: Date.now() - (EJSafeKey || 0), 
            businessId: 1,
            activityNumber: "open",
            requestType: "0",
            type: "5",
            userNumber: memberInfo.memberID,
            channel: "1",
            name: memberInfo.nickName,
            remark: "打开APP",
        };

        const response = await commonPost('/ehomes-new/homeManager/api/share/corsToActicity', requestBody, cookieInfo);

        if (response.code === 200) {
            console.log(`[${index}]打开APP请求成功`);
        } else {
            console.log(`[${index}]打开APP请求失败: ${response.msg}`);
        }
    } catch (error) {
        console.error(`[${index}]打开APP请求失败: ${error.message}`);
    }
}

async function saveUserDeviceInfo(cookieInfo, memberInfo, index) {
    try {
        if (!memberInfo.memberID) {
            console.log(`[${index}]缺少memberID，跳过保存友盟设备信息`);
            return;
        }

        const requestBody = {
            memberId: memberInfo.memberID,
            userId: "",
            userType: "61",
            uid: "",
            mobile: "",
            tel: "",
            phone: "",
            brandName: "",
            seriesName: "",
            token: "ebf76685e48d4e14a9de6fccc76483e3",
            safeEnc: Date.now() - (EJSafeKey || 0), 
            businessId: null,
            device: "ANDROID",
            deviceToken: "ApQrEcr_yjuLFVk8vR7x3FUtFd9NZqd4BTZmW6iWblPR",
        };

        const response = await commonPost('/ehomes-new/homeManager/api/message/saveUserDeviceInfo', requestBody, cookieInfo);

        if (response.code === 200) {
            console.log(`[${index}]保存友盟设备信息成功`);
        } else {
            console.log(`[${index}]保存友盟设备信息失败: ${response.msg}`);
        }
    } catch (error) {
        console.error(`[${index}]保存友盟设备信息失败: ${error.message}`);
    }
}

async function processCKAccount(ckString, index) {
    try {
        const cookies = parseCookies(ckString);
        const cookieInfo = extractCookieInfo(cookies);
        
        if (!cookieInfo.session && !cookieInfo.fotontgt) {
            throw new Error(`CK格式不正确，缺少必要的SESSION或FOTONTGT信息`);
        }

        const maskedCK = ckString.length > 20 ? `${ckString.substring(0, 20)}...` : ckString;

        console.log(`[${index}]${maskedCK} 处理中`);
        console.log('————————————');
        
        // 获取用户信息
        const memberInfo = await getMemberInfo(cookieInfo, index);

        // 调用打开APP函数
        await corsToActivity(cookieInfo, memberInfo, index);
        
        // 调用保存友盟设备信息函数
        await saveUserDeviceInfo(cookieInfo, memberInfo, index);

        // 获取任务列表
        let taskList = await retryTask(async () => {
            return await commonPost('/ehomes-new/homeManager/api/Member/getTaskList', {
                "memberId": memberInfo.memberID,
                "userId": "", 
                "userType": "61", 
                "uid": "", 
                "mobile": "", 
                "tel": "", 
                "phone": "", 
                "brandName": "", 
                "seriesName": "", 
                "token": "ebf76685e48d4e14a9de6fccc76483e3", 
                "safeEnc": Date.now() - (EJSafeKey || 0), 
                "businessId": 1
            }, cookieInfo);
        });

        if (taskList.code === 200 && taskList.data) {
            for (const task of taskList.data) {

                let taskProcessedOrSkippedBySwitch = false;

                if (task.ruleName === '签到') {
                    if (FTEJ_TASK_SIGNIN !== '1') {
                        taskProcessedOrSkippedBySwitch = true;
                    }
                } else if (task.ruleName === '保客分享') {
                    if (FTEJ_TASK_SHARE !== '1') {
                        taskProcessedOrSkippedBySwitch = true;
                    }
                } else if (task.ruleName === '关注') {
                    if (FTEJ_TASK_FOLLOW !== '1') {
                        taskProcessedOrSkippedBySwitch = true;
                    }
                } else if (task.ruleName === '发帖') {
                    if (FTEJ_TASK_POST !== '1') {
                        taskProcessedOrSkippedBySwitch = true;
                    }
                }

                if (taskProcessedOrSkippedBySwitch) {
                    continue;
                }
                
                if (task.isComplete === "1") {
                    console.log(`[${index}]任务"${task.ruleName}"已完成，跳过`);
                    continue; 
                }

                if (task.ruleName === '签到') {
                    if (FTEJ_TASK_SIGNIN === '1') {
                        await randomDelay(45, 90);
                        const sign = await commonPost('/ehomes-new/homeManager/api/bonus/signActivity2nd', {
                            memberId: memberInfo.memberComplexCode,
                            userId: "",
                            userType: "61",
                            uid: "",
                            mobile: "",
                            tel: "",
                            phone: "",
                            brandName: "",
                            seriesName: "",
                            token: "ebf76685e48d4e14a9de6fccc76483e3",
                            safeEnc: Date.now() - (EJSafeKey || 0), 
                            businessId: 1
                        }, cookieInfo);
                        console.log(`[${index}]福田e家签到结果: ${sign.data?.integral ? `获得${sign.data.integral}积分` : sign.msg}`);
                    }
                }

                if (task.ruleName === '保客分享') {
                    if (FTEJ_TASK_SHARE === '1') {
                        await randomDelay(45, 90);
                
                        const financeBaseUrl = 'https://finance.foton.com.cn/FONTON_PROD';
                        const userAgentFinance = 'Mozilla/5.0 (Linux; Android 15; RMX5060 Build/AP3A.240617.008; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36;Umeng4Aplus/1.0.0ftejAndroid';
                        const refererUrl = `https://finance.foton.com.cn/payingmember/clientHome?tab=1&show=0&channel=app`;
                
                        const getSafeInfoRequestOptions = {
                            url: `${financeBaseUrl}/ehomes-new/ehomesService//api/safeH5/getSafeInfo`,
                            headers: {
                                'Content-Type': 'application/json;charset=UTF-8',
                                'channel': 'H5',
                                'User-Agent': userAgentFinance,
                                'Origin': 'https://finance.foton.com.cn',
                                'X-Requested-With': 'com.foton.almighty',
                                'Referer': refererUrl,
                                'Cookie': `FOTONTGT=${cookieInfo.fotontgt}`
                            },
                            body: JSON.stringify({})
                        };
                
                        const financeSafeKeyValue = await new Promise(resolve => {
                            $.post(getSafeInfoRequestOptions, (err, resp, data) => {
                                if (err) {
                                    resolve(null);
                                } else {
                                    try {
                                        const parsedData = JSON.parse(data);
                                        if (parsedData.code === 200 && parsedData.data && parsedData.data.key) {
                                            resolve(parsedData.data.key);
                                        } else {
                                            resolve(null);
                                        }
                                    } catch (e) {
                                        resolve(null);
                                    }
                                }
                            });
                        });
                
                        if (financeSafeKeyValue) {
                            const safeEncForFinance = String(Date.now() - parseInt(financeSafeKeyValue));
                
                            const sharePayload = {
                                memberId: memberInfo.memberComplexCode,
                                tel: "",
                                id: task.ruleId, 
                                safeEnc: safeEncForFinance,
                                userId: null
                            };
                
                            const addShareOptions = {
                                url: `${financeBaseUrl}/ehomes-new/homeManager//api/bonus/addIntegralForShare`,
                                headers: {
                                    'Content-Type': 'application/json;charset=UTF-8',
                                    'channel': 'H5',
                                    'User-Agent': userAgentFinance,
                                    'Origin': 'https://finance.foton.com.cn',
                                    'X-Requested-With': 'com.foton.almighty',
                                    'Referer': refererUrl,
                                    'Cookie': `FOTONTGT=${cookieInfo.fotontgt}`
                                },
                                body: JSON.stringify(sharePayload)
                            };
                
                            await new Promise(resolve => {
                                $.post(addShareOptions, (err, resp, data) => {
                                     if (err) {
                                        console.log(`[${index}]分享任务结果: 请求错误 - ${err}`);
                                    } else {
                                        try {
                                            const parsedData = JSON.parse(data);
                                            if (parsedData.code === 200 && parsedData.data) {
                                                const integral = parsedData.data.integral || (parsedData.data.data ? parsedData.data.data.integral : undefined);
                                                if (integral !== undefined) {
                                                    console.log(`[${index}]分享任务结果: 获得${integral}积分`);
                                                } else {
                                                     console.log(`[${index}]分享任务结果: ${parsedData.msg || '成功但未获取到积分信息'}`);
                                                }
                                            } else {
                                                console.log(`[${index}]分享任务结果: ${parsedData.msg || JSON.stringify(parsedData)}`);
                                            }
                                        } catch (e) {
                                            console.log(`[${index}]分享任务结果: 解析响应错误 - ${e}`);
                                        }
                                    }
                                    resolve();
                                });
                            });
                        } else {
                            console.log(`[${index}]保客分享：跳过，因获取finance safeKey失败`);
                        }
                    }
                }

                if (task.ruleName === '关注') {
                    if (FTEJ_TASK_FOLLOW === '1') {
                        await randomDelay(45, 90);
                        const postsResponse = await commonPost('/ehomes-new/ehomesCommunity/api/post/recommendPostList', {
                            memberId: memberInfo.memberID,
                            userId: "",
                            userType: "61",
                            uid: "",
                            mobile: "",
                            tel: "",
                            phone: "",
                            brandName: "",
                            seriesName: "",
                            token: "ebf76685e48d4e14a9de6fccc76483e3",
                            safeEnc: Date.now() - (EJSafeKey || 0), 
                            businessId: 1,
                            position: "1",
                            pageNumber: "1",
                            pageSize: 9
                        }, cookieInfo);

                        if (postsResponse.code === 200 && postsResponse.data && postsResponse.data.length > 0) {
                            const posts = postsResponse.data;
                            const targetMemberId = posts[Math.floor(Math.random() * posts.length)].memberId;
                            
                            // 关注
                            await commonPost('/ehomes-new/ehomesCommunity/api/post/follow2nd', {
                                memberId: memberInfo.memberComplexCode,
                                userId: "",
                                userType: "61",
                                uid: "",
                                mobile: "",
                                tel: "",
                                phone: "",
                                brandName: "",
                                seriesName: "",
                                token: "ebf76685e48d4e14a9de6fccc76483e3",
                                safeEnc: Date.now() - (EJSafeKey || 0), 
                                businessId: 1,
                                behavior: "1",
                                memberIdeds: targetMemberId,
                                navyId: "null"
                            }, cookieInfo);
                            console.log(`[${index}]关注ID ${targetMemberId} 成功`);

                            await randomDelay(1, 3);
                            await commonPost('/ehomes-new/ehomesCommunity/api/post/follow2nd', {
                                memberId: memberInfo.memberComplexCode,
                                userId: "",
                                userType: "61",
                                uid: "",
                                mobile: "",
                                tel: "",
                                phone: "",
                                brandName: "",
                                seriesName: "",
                                token: "ebf76685e48d4e14a9de6fccc76483e3",
                                safeEnc: Date.now() - (EJSafeKey || 0), 
                                businessId: 1,
                                behavior: "2",
                                memberIdeds: targetMemberId,
                                navyId: "null"
                            }, cookieInfo);
                            console.log(`[${index}]取关ID ${targetMemberId} 成功`);
                        } else {
                            console.log(`[${index}]获取推荐帖子列表失败或列表为空，无法执行关注任务: ${postsResponse.msg || ''}`);
                        }
                    }
                }

                if (task.ruleName === '发帖') {
                    if (FTEJ_TASK_POST === '1') {
                        const topicsResponse = await loginPost('/ehomes-new/ehomesCommunity/api/post/topicList', {
                            memberId: memberInfo.memberID,
                            userId: "",
                            userType: "61",
                            uid: "",
                            mobile: "",
                            tel: "",
                            phone: "",
                            brandName: "",
                            seriesName: "",
                            token: "ebf76685e48d4e14a9de6fccc76483e3",
                            safeEnc: Date.now() - (EJSafeKey || 0), 
                            businessId: 1
                        }, cookieInfo);

                        if (topicsResponse.code === 200 && topicsResponse.data && topicsResponse.data.top && topicsResponse.data.top.length > 0) {
                            const topics = topicsResponse.data.top;
                            const topicId = topics[Math.floor(Math.random() * topics.length)].topicId;
                            const text = await textGet() || "生活就像一杯茶，不会苦一辈子，但要学会等待她的甘甜。";

                            await randomDelay(45, 90);
                            const postAddResponse = await commonPost('/ehomes-new/ehomesCommunity/api/post/addJson2nd', {
                                memberId: memberInfo.memberComplexCode,
                                userId: "",
                                userType: "61",
                                uid: "",
                                mobile: "",
                                tel: "",
                                phone: "",
                                brandName: "",
                                seriesName: "",
                                token: "ebf76685e48d4e14a9de6fccc76483e3",
                                safeEnc: Date.now() - (EJSafeKey || 0), 
                                businessId: 1,
                                content: text,
                                postType: 1,
                                topicIdList: [topicId],
                                uploadFlag: 3,
                                title: "",
                                urlList: []
                            }, cookieInfo);
                            if(postAddResponse.code === 200){
                                console.log(`[${index}]发帖成功`);
                            } else {
                                console.log(`[${index}]发帖失败: ${postAddResponse.msg || '未知错误'}`);
                            }
                        } else {
                            console.log(`[${index}]获取话题列表失败或列表为空，无法执行发帖任务: ${topicsResponse.msg || ''}`);
                        }
                    }
                }
            }
        } else {
            console.log(`[${index}]获取任务列表失败或列表为空: ${taskList.msg || ''}`);
        }

        // 春日抽奖
        if (FTEJ_SpringSign === '1') {
             if (cookieInfo.fotontgt) {
                await springDayLottery(cookieInfo, index);
            } else {
                console.log(`[${index}]缺少FOTONTGT, 无法进行春日抽奖`);
            }
        }

        // 积分转盘抽奖
        if (FTEJ_Lottery === '1') {
            if (cookieInfo.fotontgt) {
                await lotteryDraw(cookieInfo, index);
            } else {
                console.log(`[${index}]缺少FOTONTGT, 无法进行积分转盘抽奖`);
            }
        }

        // 调用删帖函数
        if (FTEJ_DEL_POSTS === '1') {
            await manageOldPosts(cookieInfo, "", index);
        }

        // 查询积分
        const pointsInfo = await commonPost('/ehomes-new/homeManager/api/Member/findMemberPointsInfo', {
            memberId: memberInfo.memberID,
            userId: "",
            userType: "61",
            uid: "",
            mobile: "",
            tel: "",
            phone: "",
            brandName: "",
            seriesName: "",
            token: "ebf76685e48d4e14a9de6fccc76483e3",
            safeEnc: Date.now() - (EJSafeKey || 0), 
            businessId: 1
        }, cookieInfo);

        return `[${index}]CK ${maskedCK} 当前积分：${pointsInfo.data?.pointValue !== undefined ? pointsInfo.data.pointValue : '查询失败'}\n`;

    } catch (error) {
        console.error(`[${index}]${error.message}`);
        return `[${index}]${error.message}\n`;
    }
}

async function loginPost(url, body, cookieInfo = null) {
    return new Promise(resolve => {
        const options = {
            url: `https://czyl.foton.com.cn${url}`,
            headers: {
                'content-type': 'application/json;charset=utf-8',
                'Connection': 'Keep-Alive',
                'user-agent': 'okhttp/3.14.9',
                'Accept-Encoding': 'gzip',
                'Cookie': cookieInfo ? `SESSION=${cookieInfo.session}; HWWAFSESID=${cookieInfo.hwwafsesid}; HWWAFSESTIME=${cookieInfo.hwwafsestime}; FOTONTGT=${cookieInfo.fotontgt}` : ''
            },
            body: JSON.stringify(body)
        };
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                    return resolve({ code: 500 });
                } else {
                    await $.wait(2000);
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp);
                resolve({ code: 500 });
            }
        });
    });
}

async function pkLoginPost(url, body) {
    return new Promise(resolve => {
        const options = {
            url: `https://czyl.foton.com.cn${url}`,
            headers: {
                'content-type': 'application/json;charset=utf-8',
                'channel': '1',
                'Accept-Encoding': 'gzip',
            },
            body: JSON.stringify(body)
        };
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试，跳过当前账号`);
                    return resolve({ code: 500 });
                } else {
                    await $.wait(2000);
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp);
                resolve({ code: 500 });
            }
        });
    });
}

async function commonPost(url, body, cookieInfo = null) {
    return new Promise(resolve => {
        const options = {
            url: `https://czyl.foton.com.cn${url}`,
            headers: {
                'content-type': 'application/json;charset=utf-8',
                'Connection': 'Keep-Alive',
                'token': '',
                'app-key': '7918d2d1a92a02cbc577adb8d570601e72d3b640',
                'app-token': '58891364f56afa1b6b7dae3e4bbbdfbfde9ef489',
                'user-agent': 'web',
                'Accept-Encoding': 'gzip',
                'Cookie': cookieInfo ? `SESSION=${cookieInfo.session}; HWWAFSESID=${cookieInfo.hwwafsesid}; HWWAFSESTIME=${cookieInfo.hwwafsestime}; FOTONTGT=${cookieInfo.fotontgt}` : ''
            },
            body: JSON.stringify(body)
        };
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试，跳过该请求`);
                    return resolve({ code: 500 });
                } else {
                    await $.wait(2000);
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp);
                resolve({ code: 500 });
            }
        });
    });
}

async function request(url, options) {
    return new Promise(resolve => {
        const fullUrl = `https://czyl.foton.com.cn${url}`;
        const reqOptions = {
            url: fullUrl,
            ...options
        };
        if (options.body && typeof options.body === 'object' && !Buffer.isBuffer(options.body) && !(options.headers && options.headers['Content-Type'] && options.headers['Content-Type'].includes('x-www-form-urlencoded'))) {
            reqOptions.body = JSON.stringify(options.body);
        }
        $.post(reqOptions, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`❌ API请求失败: ${JSON.stringify(err)}`);
                    return resolve({ code: 500, msg: err.message });
                } else {
                    await $.wait(2000);
                    resolve({
                        code: resp.statusCode,
                        headers: resp.headers,
                        data: JSON.parse(data)
                    });
                }
            } catch (e) {
                console.log(`❌ 解析响应失败: ${e.message}`);
                resolve({ code: resp ? resp.statusCode : 500, headers: resp ? resp.headers : {}, msg: e.message, rawData: data });
            }
        });
    });
}

async function pkPost(url, body, token) {
    return new Promise((resolve) => {
        const options = {
            url: `https://czyl.foton.com.cn${url}`,
            headers: {
                "content-type": "application/json;charset=utf-8",
                channel: "1",
                token: token,
                "Accept-Encoding": "gzip",
            },
            body: JSON.stringify(body),
        };
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网络重试，跳过该请求`);
                    return resolve({ code: 500 });
                } else {
                    await $.wait(2000);
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp);
                resolve({ code: 500 });
            }
        });
    });
}

async function textGet() {
    return new Promise(resolve => {
        const options = {
            url: `http://api.btstu.cn/yan/api.php`,
            headers: {}
        };
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} 获取随机文本失败，使用默认文本`);
                    return resolve('如果觉得没有朋友，就去找喜欢的人表白，对方会提出和你做朋友的。');
                } else {
                    await $.wait(2000);
                    resolve(data);
                }
            } catch (e) {
                $.logErr(e, resp);
                resolve('如果觉得没有
async function sendMsg(message) {
    if ($.isNode()) {
        let notify = ''
        try {
            notify = require('./sendNotify');
        } catch (e) {
            try {
                 notify = require("../sendNotify");
            } catch (eInner){
                 console.log("sendNotify.js模块加载失败，请确保它在脚本同级目录或上一级目录下");
                 return;
            }
        }
        await notify.sendNotify($.name, message);
    } else {
        $.msg($.name, '', message)
    }
}

function Env(t, e) {
  class s {
    constructor(t) {
      this.env = t;
    }
    send(t, e = "GET") {
      t = "string" == typeof t ? {
        url: t
      } : t;
      let s = this.get;
      "POST" === e && (s = this.post);
      return new Promise((e, i) => {
        s.call(this, t, (t, s, o) => {
          t ? i(t) : e(s);
        });
      });
    }
    get(t) {
      return this.send.call(this.env, t);
    }
    post(t) {
      return this.send.call(this.env, t, "POST");
    }
  }
  return new class {
    constructor(t, e) {
      this.logLevels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
      };
      this.logLevelPrefixs = {
        debug: "[DEBUG] ",
        info: "[INFO] ",
        warn: "[WARN] ",
        error: "[ERROR] "
      };
      this.logLevel = "info";
      this.name = t;
      this.http = new s(this);
      this.data = null;
      this.dataFile = "box.dat";
      this.logs = [];
      this.isMute = !1;
      this.isNeedRewrite = !1;
      this.logSeparator = "\n";
      this.encoding = "utf-8";
      this.startTime = new Date().getTime();
      Object.assign(this, e);
      this.log("`, `🔔${this.name}, 开始!`);
    }
    getEnv() {
      return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0;
    }
    isNode() {
      return "Node.js" === this.getEnv();
    }
    isQuanX() {
      return "Quantumult X" === this.getEnv();
    }
    isSurge() {
      return "Surge" === this.getEnv();
    }
    isLoon() {
      return "Loon" === this.getEnv();
    }
    isShadowrocket() {
      return "Shadowrocket" === this.getEnv();
    }
    isStash() {
      return "Stash" === this.getEnv();
    }
    toObj(t, e = null) {
      try {
        return JSON.parse(t);
      } catch {
        return e;
      }
    }
    toStr(t, e = null, ...s) {
      try {
        return JSON.stringify(t, ...s);
      } catch {
        return e;
      }
    }
    getjson(t, e) {
      let s = e;
      if (this.getdata(t)) {
        try {
          s = JSON.parse(this.getdata(t));
        } catch {}
      }
      return s;
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e);
      } catch {
        return !1;
      }
    }
    getScript(t) {
      return new Promise(e => {
        this.get({
          url: t
        }, (t, s, i) => e(i));
      });
    }
    runScript(t, e) {
      return new Promise(s => {
        let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        i = i ? i.replace(/\n/g, "").trim() : i;
        let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        o = o ? 1 * o : 20;
        o = e && e.timeout ? e.timeout : o;
        const [r, a] = i.split("@"),
          n = {
            url: `http://${a}/v1/scripting/evaluate`,
            body: {
              script_text: t,
              mock_type: "cron",
              timeout: o
            },
            headers: {
              "X-Key": r,
              Accept: "*/*"
            },
            timeout: o
          };
        this.post(n, (t, e, i) => s(i));
      }).catch(t => this.logErr(t));
    }
    loaddata() {
      if (!this.isNode()) {
        return {};
      }
      {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e);
        if (!s && !i) {
          return {};
        }
        {
          const i = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(i));
          } catch (t) {
            return {};
          }
        }
      }
    }
    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e),
          o = JSON.stringify(this.data);
        s ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(e, o) : this.fs.writeFileSync(t, o);
      }
    }
    lodash_get(t, e, s) {
      const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let o = t;
      for (const t of i) if (o = Object(o)[t], void 0 === o) {
        return s;
      }
      return o;
    }
    lodash_set(t, e, s) {
      Object(t) !== t || (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s);
      return t;
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
          o = s ? this.getval(s) : "";
        if (o) {
          try {
            const t = JSON.parse(o);
            e = t ? this.lodash_get(t, i, "") : e;
          } catch (t) {
            e = "";
          }
        }
      }
      return e;
    }
    setdata(t, e) {
      let s = !1;
      if (/^@/.test(e)) {
        const [, i, o] = /^@(.*?)\.(.*?)$/.exec(e),
          r = this.getval(i),
          a = i ? "null" === r ? null : r || "{}" : "{}";
        try {
          const e = JSON.parse(a);
          this.lodash_set(e, o, t);
          s = this.setval(JSON.stringify(e), i);
        } catch (e) {
          const r = {};
          this.lodash_set(r, o, t);
          s = this.setval(JSON.stringify(r), i);
        }
      } else {
        s = this.setval(t, e);
      }
      return s;
    }
    getval(t) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
          return $persistentStore.read(t);
        case "Quantumult X":
          return $prefs.valueForKey(t);
        case "Node.js":
          this.data = this.loaddata();
          return this.data[t];
        default:
          return this.data && this.data[t] || null;
      }
    }
    setval(t, e) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
          return $persistentStore.write(t, e);
        case "Quantumult X":
          return $prefs.setValueForKey(t, e);
        case "Node.js":
          this.data = this.loaddata();
          this.data[e] = t;
          this.writedata();
          return !0;
        default:
          return this.data && this.data[e] || null;
      }
    }
    initGotEnv(t) {
      this.got = this.got ? this.got : require("got");
      this.cktough = this.cktough ? this.cktough : require("tough-cookie");
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
      t && (t.headers = t.headers ? t.headers : {}, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.cookie && void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)));
    }
    get(t, e = () => {}) {
      switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = {
        redirection: !1
      })), this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        default:
          this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
            "X-Surge-Skip-Scripting": !1
          }));
          $httpClient.get(t, (t, s, i) => {
            !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode);
            e(t, s, i);
          });
          break;
        case "Quantumult X":
          this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
            hints: !1
          }));
          $task.fetch(t).then(t => {
            const {
              statusCode: s,
              statusCode: i,
              headers: o,
              body: r,
              bodyBytes: a
            } = t;
            e(null, {
              status: s,
              statusCode: i,
              headers: o,
              body: r,
              bodyBytes: a
            }, r, a);
          }, t => e(t && t.error || "UndefinedError"));
          break;
        case "Node.js":
          let s = require("iconv-lite");
          this.initGotEnv(t);
          this.got(t).on("redirect", (t, e) => {
            try {
              if (t.headers["set-cookie"]) {
                const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                s && this.ckjar.setCookieSync(s, null);
                e.cookieJar = this.ckjar;
              }
            } catch (t) {
              this.logErr(t);
            }
          }).then(t => {
            const {
                statusCode: i,
                statusCode: o,
                headers: r,
                rawBody: a
              } = t,
              n = s.decode(a, this.encoding);
            e(null, {
              status: i,
              statusCode: o,
              headers: r,
              rawBody: a,
              body: n
            }, n);
          }, t => {
            const {
              message: i,
              response: o
            } = t;
            e(i, o, o && s.decode(o.rawBody, this.encoding));
          });
          break;
      }
    }
    post(t, e = () => {}) {
      const s = t.method ? t.method.toLocaleLowerCase() : "post";
      switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = {
        redirection: !1
      })), this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        default:
          this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
            "X-Surge-Skip-Scripting": !1
          }));
          $httpClient[s](t, (t, s, i) => {
            !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode);
            e(t, s, i);
          });
          break;
        case "Quantumult X":
          t.method = s;
          this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
            hints: !1
          }));
          $task.fetch(t).then(t => {
            const {
              statusCode: s,
              statusCode: i,
              headers: o,
              body: r,
              bodyBytes: a
            } = t;
            e(null, {
              status: s,
              statusCode: i,
              headers: o,
              body: r,
              bodyBytes: a
            }, r, a);
          }, t => e(t && t.error || "UndefinedError"));
          break;
        case "Node.js":
          let i = require("iconv-lite");
          this.initGotEnv(t);
          const {
            url: o,
            ...r
          } = t;
          this.got[s](o, r).then(t => {
            const {
                statusCode: s,
                statusCode: o,
                headers: r,
                rawBody: a
              } = t,
              n = i.decode(a, this.encoding);
            e(null, {
              status: s,
              statusCode: o,
              headers: r,
              rawBody: a,
              body: n
            }, n);
          }, t => {
            const {
              message: s,
              response: o
            } = t;
            e(s, o, o && i.decode(o.rawBody, this.encoding));
          });
          break;
      }
    }
    time(t, e = null) {
      const s = e ? new Date(e) : new Date();
      let i = {
        "M+": s.getMonth() + 1,
        "d+": s.getDate(),
        "H+": s.getHours(),
        "m+": s.getMinutes(),
        "s+": s.getSeconds(),
        "q+": Math.floor((s.getMonth() + 3) / 3),
        S: s.getMilliseconds()
      };
      /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
      return t;
    }
    queryStr(t) {
      let e = "";
      for (const s in t) {
        let i = t[s];
        null != i && "" !== i && ("object" == typeof i && (i = JSON.stringify(i)), e += `${s}=${i}&`);
      }
      e = e.substring(0, e.length - 1);
      return e;
    }
    msg(e = t, s = "", i = "", o = {}) {
      const r = t => {
        const {
          $open: e,
          $copy: s,
          $media: i,
          $mediaMime: o
        } = t;
        switch (typeof t) {
          case void 0:
            return t;
          case "string":
            switch (this.getEnv()) {
              case "Surge":
              case "Stash":
              default:
                return {
                  url: t
                };
              case "Loon":
              case "Shadowrocket":
                return t;
              case "Quantumult X":
                return {
                  "open-url": t
                };
              case "Node.js":
                return;
            }
          case "object":
            switch (this.getEnv()) {
              case "Surge":
              case "Stash":
              case "Shadowrocket":
              default:
                {
                  const r = {};
                  let a = t.openUrl || t.url || t["open-url"] || e;
                  a && Object.assign(r, {
                    action: "open-url",
                    url: a
                  });
                  let n = t["update-pasteboard"] || t.updatePasteboard || s;
                  if (n && Object.assign(r, {
                    action: "clipboard",
                    text: n
                  }), i) {
                    let t, e, s;
                    if (i.startsWith("http")) {
                      t = i;
                    } else {
                      if (i.startsWith("data:")) {
                        const [t] = i.split(";"),
                          [, o] = i.split(",");
                        e = o;
                        s = t.replace("data:", "");
                      } else {
                        e = i;
                        s = (t => {
                          const e = {
                            JVBERi0: "application/pdf",
                            R0lGODdh: "image/gif",
                            R0lGODlh: "image/gif",
                            iVBORw0KGgo: "image/png",
                            "/9j/": "image/jpg"
                          };
                          for (var s in e) if (0 === t.indexOf(s)) {
                            return e[s];
                          }
                          return null;
                        })(i);
                      }
                    }
                    Object.assign(r, {
                      "media-url": t,
                      "media-base64": e,
                      "media-base64-mime": o ?? s
                    });
                  }
                  Object.assign(r, {
                    "auto-dismiss": t["auto-dismiss"],
                    sound: t.sound
                  });
                  return r;
                }
              case "Loon":
                {
                  const s = {};
                  let o = t.openUrl || t.url || t["open-url"] || e;
                  o && Object.assign(s, {
                    openUrl: o
                  });
                  let r = t.mediaUrl || t["media-url"];
                  i?.startsWith("http") && (r = i);
                  r && Object.assign(s, {
                    mediaUrl: r
                  });
                  console.log(JSON.stringify(s));
                  return s;
                }
              case "Quantumult X":
                {
                  const o = {};
                  let r = t["open-url"] || t.url || t.openUrl || e;
                  r && Object.assign(o, {
                    "open-url": r
                  });
                  let a = t["media-url"] || t.mediaUrl;
                  i?.startsWith("http") && (a = i);
                  a && Object.assign(o, {
                    "media-url": a
                  });
                  let n = t["update-pasteboard"] || t.updatePasteboard || s;
                  n && Object.assign(o, {
                    "update-pasteboard": n
                  });
                  console.log(JSON.stringify(o));
                  return o;
                }
              case "Node.js":
                return;
            }
          default:
            return;
        }
      };
      if (!this.isMute) {
        switch (this.getEnv()) {
          case "Surge":
          case "Loon":
          case "Stash":
          case "Shadowrocket":
          default:
            $notification.post(e, s, i, r(o));
            break;
          case "Quantumult X":
            $notify(e, s, i, r(o));
            break;
          case "Node.js":
            break;
        }
      }
      if (!this.isMuteLog) {
        let t = ["", "==============📣系统通知📣=============="];
        t.push(e);
        s && t.push(s);
        i && t.push(i);
        console.log(t.join("\n"));
        this.logs = this.logs.concat(t);
      }
    }
    debug(...t) {
      this.logLevels[this.logLevel] <= this.logLevels.debug && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.debug}${t.map(t => t ?? String(t)).join(this.logSeparator)}`));
    }
    info(...t) {
      this.logLevels[this.logLevel] <= this.logLevels.info && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.info}${t.map(t => t ?? String(t)).join(this.logSeparator)}`));
    }
    warn(...t) {
      this.logLevels[this.logLevel] <= this.logLevels.warn && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.warn}${t.map(t => t ?? String(t)).join(this.logSeparator)}`));
    }
    error(...t) {
      this.logLevels[this.logLevel] <= this.logLevels.error && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.error}${t.map(t => t ?? String(t)).join(this.logSeparator)}`));
    }
    log(...t) {
      t.length > 0 && (this.logs = [...this.logs, ...t]);
      console.log(t.map(t => t ?? String(t)).join(this.logSeparator));
    }
    logErr(t, e) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        case "Quantumult X":
        default:
          this.log("`, `❗️${this.name}, 错误!`, e, t);
          break;
        case "Node.js":
          this.log("`, `❗️${this.name}, 错误!`, e, void 0 !== t.message ? t.message : t, t.stack);
          break;
      }
    }
    wait(t) {
      return new Promise(e => setTimeout(e, t));
    }
    done(t = {}) {
      const e = (new Date().getTime() - this.startTime) / 1000;
      switch (this.log("`, `🔔${this.name}, 结束! 🕛 ${e} 秒"), this.log(), this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        case "Quantumult X":
        default:
          $done(t);
          break;
        case "Node.js":
          process.exit(1);
      }
    }
  }(t, e);
}
