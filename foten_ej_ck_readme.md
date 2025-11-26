# 福田E家CK版本使用说明

## 脚本说明

这是基于原始福田E家脚本修改的CK版本，主要改动如下：

### 主要改动

1. **环境变量变更**：
   - 从 `FTEJ` 改为 `FTEJ_CK`
   - 格式从 `账号#密码&账号#密码` 改为 `CK1&CK2`
   - CK格式：`SESSION=xxx; HWWAFSESTIME=xxx; HWWAFSESID=xxx; FOTONTGT=xxx`

2. **移除了登录逻辑**：
   - 不再需要账号密码
   - 直接使用Cookie进行身份验证
   - 支持并发处理多个CK

3. **新增Cookie解析功能**：
   - `parseCookies()`: 解析Cookie字符串
   - `extractCookieInfo()`: 提取关键Cookie信息

## 使用方法

### 1. 环境变量配置

```bash
# 单个CK示例
export FTEJ_CK="SESSION=abc123; HWWAFSESTIME=1234567890; HWWAFSESID=def456; FOTONTGT=ghi789"

# 多个CK示例（用&分隔）
export FTEJ_CK="SESSION=abc123; HWWAFSESTIME=1234567890; HWWAFSESID=def456; FOTONTGT=ghi789&SESSION=jkl012; HWWAFSESTIME=1234567891; HWWAFSESID=mno345; FOTONTGT=pqr678"
```

### 2. 其他配置变量

```bash
# 皮卡生活签到 开启=1，关闭=0
export FTEJ_PK="1"

# 积分转盘抽奖 开启=1，关闭=0  
export FTEJ_Lottery="0"

# 春日活动相关（已结束）
export FTEJ_SpringSign="0"

# 自动删帖 开启=1，关闭=0
export FTEJ_DEL_POSTS="1"

# 各任务开关
export FTEJ_TASK_SIGNIN="1"     # 福田e家签到
export FTEJ_TASK_SHARE="1"      # 保客分享
export FTEJ_TASK_FOLLOW="1"     # 关注/取关  
export FTEJ_TASK_POST="1"       # 发帖
```

### 3. 运行脚本

```bash
node foten_ej_ck.js
```

## CK获取方法

### 方法1：从浏览器开发者工具获取

1. 登录福田E家APP或网页版
2. 按F12打开开发者工具
3. 切换到Network（网络）标签
4. 进行任意操作（如签到）
5. 找到相关的API请求
6. 在Request Headers中找到Cookie字段
7. 复制完整的Cookie值

### 方法2：从移动端获取

1. 使用支持查看Cookie的APP或工具
2. 导出福田E家的Cookie信息
3. 整理成标准格式

## 功能说明

### 支持的任务

1. **福田e家签到**：自动签到获取积分
2. **保客分享**：执行分享任务
3. **关注/取关**：自动关注然后取关
4. **发帖**：自动发布动态
5. **皮卡生活签到**：额外的签到任务
6. **积分转盘抽奖**：转盘抽奖（默认关闭）
7. **自动删帖**：清理非今日的帖子

### 并发处理

- 默认并发数：50（可在脚本中修改 `concurrencyLimit` 变量）
- 支持多CK同时处理，提高效率
- 异常处理：单个CK失败不影响其他CK的执行

### 任务间隔

- 各任务之间有随机延迟：45-90秒
- 避免频繁请求被风控

## 注意事项

1. **Cookie有效期**：CK可能有过期时间，请定期更新
2. **频率控制**：脚本已内置延迟，但请合理设置运行频率
3. **并发限制**：建议根据实际情况调整并发数，避免被封
4. **环境要求**：需要Node.js环境运行

## 故障排除

1. **CK格式错误**：确保Cookie字符串格式正确，用分号分隔
2. **Cookie失效**：重新获取有效的Cookie
3. **网络错误**：检查网络连接和代理设置
4. **任务失败**：查看控制台日志，了解具体错误信息

## 免责声明

本脚本仅供学习交流使用，使用者需自行承担使用风险。请遵守相关平台的使用规则，避免过度频繁操作导致账号被封。